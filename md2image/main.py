from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
from enum import Enum
import openai
import os
from datetime import datetime
from dotenv import load_dotenv
import openai
import uvicorn
import logging
import traceback
from pathlib import Path

# 配置日志系统
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / 'app.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

app = FastAPI(title="AI Markdown 可视化图文生成器", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# AI配置模型
class AIConfig(BaseModel):
    baseUrl: str = "https://api.openai.com/v1"
    apiKey: str
    modelName: str = "gpt-3.5-turbo"
    customModelName: Optional[str] = None
    temperature: float = 0.7
    maxTokens: int = 2000
    pageBreakPrompt: str = "请在适当的位置插入分页符，确保每页内容完整且易于阅读。考虑标题层级、段落完整性和逻辑结构。"
    tableBeautifyPrompt: str = "请优化表格格式，确保表格美观、对齐良好，并添加适当的样式。保持数据的准确性和可读性。"
    imageGenerationPrompt: str = "根据文档内容生成相关的配图，图片应该与内容主题相关，风格统一，有助于理解文档内容。"
    cssStylePrompt: str = "根据文档内容和结构，生成适合的CSS样式，提升文档的视觉效果和可读性。"

# 任务类型枚举
class TaskType(str, Enum):
    AUTO_IMAGE = "auto_image"
    BEAUTIFY_TABLE = "beautify_table"
    SEGMENT_TEXT = "segment_text"
    AUTO_CSS_STYLE = "auto_css_style"

# 请求模型
class EnhanceRequest(BaseModel):
    content: str
    task_type: Literal["auto_image", "beautify_table", "segment_text", "auto_css_style"]
    options: Optional[dict] = None
    aiConfig: Optional[AIConfig] = None

# 响应模型
class EnhanceResponse(BaseModel):
    success: bool
    enhanced_content: Optional[str] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "AI Markdown 可视化图文生成器 API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/health")
async def api_health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/enhance", response_model=EnhanceResponse)
async def enhance_markdown(request: EnhanceRequest):
    """增强Markdown内容"""
    try:
        logger.info(f"收到增强请求: task_type={request.task_type}, content_length={len(request.content)}")
        
        # 参数验证和边界检查
        if not request.content or not request.content.strip():
            raise ValueError("输入内容不能为空")
        
        # 检查内容长度限制
        max_content_length = 50000  # 50KB限制
        if len(request.content) > max_content_length:
            raise ValueError(f"输入内容过长，最大支持{max_content_length}字符，当前{len(request.content)}字符")
        
        # 检查任务类型是否有效
        valid_task_types = ['segment_text', 'auto_image', 'beautify_table', 'auto_css_style']
        if request.task_type not in valid_task_types:
            raise ValueError(f"不支持的任务类型: {request.task_type}，支持的类型: {', '.join(valid_task_types)}")
        
        # 获取AI配置
        ai_config = request.aiConfig
        if not ai_config:
            raise ValueError("AI配置不能为空")
        
        api_key = ai_config.apiKey
        
        # 如果没有提供API key，尝试从环境变量获取
        if not api_key:
            api_key = os.getenv('OPENAI_API_KEY')
            if api_key:
                logger.info(f"使用环境变量API配置: api_key={'***' + api_key[-4:] if api_key and len(api_key) > 4 else 'None'}")
        
        # 改进的API密钥验证
        if not api_key or api_key.strip() == '':
            error_msg = "OpenAI API密钥未配置。请在设置中配置有效的API密钥。"
            logger.error(f"{error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        # 检查是否为占位符密钥
        if any(placeholder in api_key.lower() for placeholder in ['your_', 'sk-xxx', 'placeholder', 'example']):
            error_msg = "检测到占位符API密钥，请配置真实有效的OpenAI API密钥。"
            logger.error(f"{error_msg} 当前密钥格式: {api_key[:15] + '...' if len(api_key) > 15 else api_key}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        # 检查API密钥格式
        if not api_key.startswith('sk-') or len(api_key) < 20:
            error_msg = "API密钥格式不正确。OpenAI API密钥应以'sk-'开头且长度足够。"
            logger.error(f"{error_msg} 当前密钥: {api_key[:10] + '...' if len(api_key) > 10 else api_key}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        # 验证AI配置参数
        base_url = ai_config.baseUrl or "https://api.openai.com/v1"
        model_name = ai_config.customModelName or ai_config.modelName or "gpt-3.5-turbo"
        temperature = ai_config.temperature if ai_config.temperature is not None else 0.7
        max_tokens = ai_config.maxTokens if ai_config.maxTokens is not None else 2000
        
        # 参数范围验证
        if not (0.0 <= temperature <= 2.0):
            raise ValueError(f"温度参数必须在0.0-2.0之间，当前值: {temperature}")
        
        if not (1 <= max_tokens <= 4000):
            raise ValueError(f"最大令牌数必须在1-4000之间，当前值: {max_tokens}")
        
        if not base_url.startswith(('http://', 'https://')):
            raise ValueError(f"API基础URL格式不正确: {base_url}")
        
        logger.info(f"使用AI配置: base_url={base_url}, model={model_name}, temperature={temperature}, max_tokens={max_tokens}")
        
        # 准备自定义提示词
        custom_prompts = {}
        if ai_config:
            custom_prompts = {
                'pageBreakPrompt': getattr(ai_config, 'pageBreakPrompt', None),
                'tableBeautifyPrompt': getattr(ai_config, 'tableBeautifyPrompt', None),
                'imageGenerationPrompt': getattr(ai_config, 'imageGenerationPrompt', None),
                'cssStylePrompt': getattr(ai_config, 'cssStylePrompt', None)
            }
            logger.info(f"自定义提示词配置: {list(custom_prompts.keys())}")
        
        enhanced_content = await process_ai_task(
            content=request.content,
            task_type=request.task_type,
            options=request.options,
            api_key=api_key,
            base_url=base_url,
            model_name=model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            custom_prompts=custom_prompts
        )
        
        logger.info(f"AI增强成功完成: task_type={request.task_type}")
        return EnhanceResponse(
            success=True,
            enhanced_content=enhanced_content
        )
    except HTTPException as he:
        # HTTP异常直接返回，保持状态码
        logger.error(f"HTTP异常: {he.detail}")
        return EnhanceResponse(
            success=False,
            error=he.detail
        )
    except ValueError as ve:
        # 参数验证错误
        error_msg = f"参数错误: {str(ve)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return EnhanceResponse(
            success=False,
            error=error_msg
        )
    except Exception as e:
        # 其他未预期的错误
        error_type = type(e).__name__
        error_msg = f"AI增强处理失败 ({error_type}): {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        
        # 根据错误类型提供更友好的提示
        if "api" in str(e).lower() or "openai" in str(e).lower():
            user_friendly_msg = "AI服务调用失败，请检查API配置和网络连接。"
        elif "timeout" in str(e).lower():
            user_friendly_msg = "请求超时，请稍后重试或检查网络连接。"
        elif "rate" in str(e).lower() or "quota" in str(e).lower():
            user_friendly_msg = "API调用频率限制或配额不足，请稍后重试。"
        else:
            user_friendly_msg = "处理过程中发生错误，请稍后重试。"
        
        return EnhanceResponse(
            success=False,
            error=f"{user_friendly_msg} 详细信息: {str(e)}"
        )

async def process_ai_task(
    content: str, 
    task_type: str, 
    options: Optional[dict] = None,
    api_key: str = None,
    base_url: str = "https://api.openai.com/v1",
    model_name: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 2000,
    custom_prompts: dict = None,
    css_config: dict = None
) -> str:
    """处理AI增强任务"""
    try:
        logger.info(f"开始处理AI任务: {task_type}")
        
        # 获取自定义提示词
        prompts = custom_prompts or {}
        
        if task_type == "auto_image":
            result = await auto_add_images(content, api_key, base_url, model_name, temperature, max_tokens, prompts.get('imageGenerationPrompt'))
        elif task_type == "beautify_table":
            result = await beautify_tables(content, api_key, base_url, model_name, temperature, max_tokens, prompts.get('tableBeautifyPrompt'))
        elif task_type == "segment_text":
            result = await segment_text(content, api_key, base_url, model_name, temperature, max_tokens, prompts.get('pageBreakPrompt'))
        elif task_type == "auto_css_style":
            result = await auto_generate_css_style(content, api_key, base_url, model_name, temperature, max_tokens, prompts.get('cssStylePrompt'), css_config)
        else:
            error_msg = f"不支持的任务类型: {task_type}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        logger.info(f"AI任务处理完成: {task_type}")
        return result
    except Exception as e:
        logger.error(f"AI任务处理失败: {task_type}, 错误: {str(e)}\n{traceback.format_exc()}")
        raise

async def auto_add_images(
    content: str,
    api_key: str,
    base_url: str = "https://api.openai.com/v1",
    model_name: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 2000,
    custom_prompt: str = None
) -> str:
    """自动为内容添加相关图片"""
    try:
        # 使用自定义提示词或默认提示词
        base_prompt = custom_prompt or "根据文档内容生成相关的配图，图片应该与内容主题相关，风格统一，有助于理解文档内容。"
        
        # 使用动态API配置初始化OpenAI客户端
        client = openai.OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": f"{base_prompt} 你是一个Markdown内容增强助手。请为给定的Markdown内容自动添加相关的图片占位符。在适当的位置插入 ![图片描述](https://via.placeholder.com/600x300?text=相关图片) 格式的图片。保持原有内容不变，只添加图片。"
                },
                {
                    "role": "user",
                    "content": content
                }
            ],
            max_tokens=max_tokens,
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        error_msg = f"自动图片生成失败: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        raise Exception(error_msg)

async def beautify_tables(
    content: str,
    api_key: str,
    base_url: str = "https://api.openai.com/v1",
    model_name: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 2000,
    custom_prompt: str = None
) -> str:
    """美化表格格式"""
    try:
        # 使用自定义提示词或默认提示词
        base_prompt = custom_prompt or "请优化表格格式，确保表格美观、对齐良好，并添加适当的样式。保持数据的准确性和可读性。"
        
        # 使用动态API配置初始化OpenAI客户端
        client = openai.OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": f"{base_prompt} 你是一个Markdown表格美化专家。请优化给定内容中的表格格式，使其更加美观和易读。如果内容中没有表格，请将适合的列表或数据转换为表格格式。保持其他内容不变。"
                },
                {
                    "role": "user",
                    "content": content
                }
            ],
            max_tokens=max_tokens,
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        error_msg = f"表格美化失败: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        raise Exception(error_msg)

async def segment_text(
    content: str,
    api_key: str,
    base_url: str = "https://api.openai.com/v1",
    model_name: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 2000,
    custom_prompt: str = None
) -> str:
    """智能分段文本"""
    try:
        logger.info(f"[DEBUG] segment_text函数收到的api_key前10位: {api_key[:10] if api_key else 'None'}")
        logger.info(f"[DEBUG] segment_text函数收到的api_key长度: {len(api_key) if api_key else 0}")
        logger.info(f"[DEBUG] segment_text函数收到的base_url: {base_url}")
        logger.info(f"[DEBUG] segment_text函数收到的model_name: {model_name}")
        
        # 使用自定义提示词或默认提示词
        base_prompt = custom_prompt or "请在适当的位置插入分页符，确保每页内容完整且易于阅读。考虑标题层级、段落完整性和逻辑结构。"
        
        # 使用动态API配置初始化OpenAI客户端
        client = openai.OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": f"{base_prompt} 请将给定的Markdown内容进行智能分段，添加适当的标题、子标题和段落分隔，使文档结构更清晰。保持原有信息完整，只优化结构和格式。"
                },
                {
                    "role": "user",
                    "content": content
                }
            ],
            max_tokens=max_tokens,
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        error_msg = f"文本分段失败: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        raise Exception(error_msg)

async def auto_generate_css_style(
    content: str,
    api_key: str,
    base_url: str = "https://api.openai.com/v1",
    model_name: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 2000,
    custom_prompt: str = None,
    css_config: dict = None
) -> str:
    """自动生成CSS样式"""
    try:
        logger.info(f"开始处理CSS样式生成任务")
        
        # 检查是否有自定义CSS配置
        if css_config and css_config.get('customCSS'):
            logger.info("使用自定义CSS样式")
            return css_config['customCSS']
        
        # 使用自定义提示词或默认提示词
        base_prompt = custom_prompt or "根据文档内容和结构，生成适合的CSS样式，提升文档的视觉效果和可读性。"
        
        # 使用动态API配置初始化OpenAI客户端
        client = openai.OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": f"{base_prompt} 你是一个CSS样式生成专家。请根据给定的Markdown内容，生成适合的CSS样式代码，包括字体、颜色、间距、布局等。样式应该简洁美观，适合文档展示。只返回CSS代码，不要包含其他内容。"
                },
                {
                    "role": "user",
                    "content": content
                }
            ],
            max_tokens=max_tokens,
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        error_msg = f"CSS样式生成失败: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        raise Exception(error_msg)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)