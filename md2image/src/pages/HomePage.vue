<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import MarkdownPoster from '@/components/MarkdownPoster.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'
// 移除网络状态相关组件
// import NetworkStatus from '@/components/NetworkStatus.vue'
// import VpnTroubleshootingGuide from '@/components/VpnTroubleshootingGuide.vue'
import ErrorLogDialog from '@/components/ErrorLogDialog.vue'
import PageBreakHelper from '@/components/PageBreakHelper.vue'
import PageNavigation from '@/components/PageNavigation.vue'
import Toolbar from '@/components/Toolbar.vue'
import { Settings } from 'lucide-vue-next'
import { renderMarkdown, extractTables, replaceTablesWithPlaceholders } from '@/utils/markdown'
import { enhanceMarkdown, checkApiHealth, type EnhanceRequest } from '@/utils/api'
import { toast } from 'sonner'
import type { AppSettings, TableData, ErrorLog } from '@/types'

// 主题管理
const { isDark, toggleTheme } = useTheme()

// 调试模式
const debugMode = ref(false)

// 编辑器内容
const markdownContent = ref(`# 段落间距测试文档

这是第一个段落，用于测试段落间距是否正确显示。

这是第二个段落，它应该与第一个段落之间有适当的间距，而不是紧挨着显示。

## 功能特性

**实时预览**: 左侧编辑，右侧实时预览

**分页支持**: 使用换页标识符创建多页内容

**极简设计**: 黑白配色，专注内容创作

这是一个普通段落，测试与上面列表项之间的间距。

### 换行符测试

这是第一行文字
这是第二行文字（单个换行符）
这是第三行文字

这是一个新段落（双换行符分隔）

### 代码示例

\`\`\`javascript
const message = "Hello, World!";
console.log(message);
\`\`\`

这是代码块后面的段落，应该有正确的间距。

### 列表示例

1. 第一项
2. 第二项
3. 第三项

这是有序列表后面的段落。

- 无序列表项 1
- 无序列表项 2
- 无序列表项 3

这是无序列表后面的段落，用于测试段落间距是否正确。

### 更多换行测试

第一行
第二行
第三行

新段落开始
继续这个段落
段落结束`)

// 当前页码
const currentPage = ref(0)

// 分页内容
const pages = ref<string[]>([])

// 表格数据
const pageTables = ref<TableData[][]>([])

// 分割内容为页面
const splitIntoPages = (content: string) => {
  if (!content.trim()) return []
  
  // 定义特殊的换页标识符
  const pageBreakMarkers = [
    '<!-- PAGE_BREAK -->'
  ]
  
  // 检查是否包含任何换页标识符
  const hasPageBreak = pageBreakMarkers.some(marker => content.includes(marker))
  
  if (hasPageBreak) {
    // 使用正则表达式匹配所有换页标识符
    const pageBreakRegex = /<!--\s*PAGE_BREAK\s*-->/gi
    const parts = content.split(pageBreakRegex)
    const pages: string[] = []
    
    // 过滤掉换页标识符本身，只保留实际内容
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]?.trim()
      if (part && 
          part.length > 0 && 
          part.toUpperCase() !== 'PAGE_BREAK') {
        pages.push(part)
      }
    }
    
    return pages.filter(page => page.length > 0)
  }
  

  
  // 智能分页：基于内容长度和结构
  const lines = content.split('\n')
  const pages: string[] = []
  let currentPage: string[] = []
  let currentLength = 0
  const maxPageLength = 1500 // 每页最大字符数，减少以避免截断
  const minPageLength = 300  // 每页最小字符数，减少以提高分页灵活性
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLength = line.length
    
    // 如果是一级标题且当前页面有内容，开始新页面
    if (line.startsWith('# ') && currentPage.length > 0 && currentLength > minPageLength) {
      pages.push(currentPage.join('\n').trim())
      currentPage = [line]
      currentLength = lineLength
      continue
    }
    
    // 如果当前页面长度超过最大限制，且遇到标题或空行，开始新页面
    if (currentLength > maxPageLength && 
        (line.startsWith('#') || line.trim() === '') && 
        currentPage.length > 0) {
      pages.push(currentPage.join('\n').trim())
      currentPage = line.trim() === '' ? [] : [line]
      currentLength = line.trim() === '' ? 0 : lineLength
      continue
    }
    
    currentPage.push(line)
    currentLength += lineLength + 1 // +1 for newline
  }
  
  // 添加最后一页
  if (currentPage.length > 0) {
    pages.push(currentPage.join('\n').trim())
  }
  
  // 如果没有分页，返回整个内容作为一页
  return pages.length > 0 ? pages : [content.trim()]
}

// 更新分页
const updatePages = () => {
  const rawPages = splitIntoPages(markdownContent.value)
  
  // 直接使用原始页面内容，不进行表格占位符处理
  // 表格应该在渲染时正常显示，而不是被替换为占位符
  pages.value = rawPages
  
  // 清空表格数据，因为不再需要单独处理表格
  pageTables.value = rawPages.map(() => [])
  
  if (currentPage.value >= pages.value.length) {
    currentPage.value = Math.max(0, pages.value.length - 1)
  }
}

// 当前页面的HTML内容
const currentPageHtml = computed(() => {
  const currentPageContent = pages.value[currentPage.value] || ''
  return renderMarkdown(currentPageContent)
})

// 当前页面的表格数据
const currentPageTables = computed(() => {
  return pageTables.value[currentPage.value] || []
})

// 分页逻辑
const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < pages.value.length - 1) {
    currentPage.value++
  }
}

const goToPage = (page: number) => {
  if (page >= 0 && page < pages.value.length) {
    currentPage.value = page
  }
}

// handleSlideChange函数已移除，因为不再使用PageSwiper组件

// AI增强相关状态
const showAiDialog = ref(false)
const aiLoading = ref(false)
const aiTaskType = ref<'segment_text'>('segment_text')

// AI任务选项
const aiTasks = [
  { value: 'segment_text', label: '智能分段', description: '优化文档结构，在合适位置添加换页标识符' }
] as const

// 错误日志状态管理
const errorLogs = ref<ErrorLog[]>([])
const showErrorLogDialog = ref(false)

// 错误日志记录函数
const logError = (errorType: string, message: string, context?: Record<string, any>, stack?: string) => {
  const errorLog: ErrorLog = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: errorType,
    message,
    timestamp: new Date().toISOString(),
    context,
    stack
  }
  
  errorLogs.value.unshift(errorLog) // 新错误添加到顶部
  
  // 限制日志数量，避免内存溢出
  if (errorLogs.value.length > 100) {
    errorLogs.value = errorLogs.value.slice(0, 100)
  }
  
  // 保存到localStorage
  try {
    localStorage.setItem('md2image-error-logs', JSON.stringify(errorLogs.value))
  } catch (e) {
    console.error('保存错误日志失败:', e)
  }
  
  console.error(`[ERROR_LOG] ${errorType}:`, errorLog)
}

// 从localStorage加载错误日志
const loadErrorLogs = () => {
  try {
    const saved = localStorage.getItem('md2image-error-logs')
    if (saved) {
      errorLogs.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载错误日志失败:', e)
  }
}

// 清空错误日志
const clearErrorLogs = () => {
  errorLogs.value = []
  try {
    localStorage.removeItem('md2image-error-logs')
  } catch (e) {
    console.error('清空错误日志失败:', e)
  }
}

// 显示错误日志对话框
const handleShowErrorLogs = () => {
  showErrorLogDialog.value = true
}

// 关闭错误日志对话框
const handleErrorLogClose = () => {
  showErrorLogDialog.value = false
}

// 兼容旧的logErrorToServer函数
const logErrorToServer = async (errorType: string, errorData: any) => {
  logError(errorType, errorData.error || '未知错误', errorData)
}

// 显示VPN友好的错误提示
const showVpnFriendlyError = (errorMessage: string) => {
  // 检查是否包含VPN相关的错误信息
  const isVpnRelated = errorMessage.includes('VPN') || 
                      errorMessage.includes('超时') || 
                      errorMessage.includes('timeout') || 
                      errorMessage.includes('网络连接异常')
  
  if (isVpnRelated) {
    // 显示包含VPN建议的详细错误信息
    alert(`AI增强失败\n\n${errorMessage}\n\n💡 如果问题持续存在，您也可以：\n• 检查后端服务是否正常运行\n• 确认API密钥配置正确\n• 查看错误日志获取更多详情`)
  } else {
    // 显示常规错误信息
    alert(`AI增强失败: ${errorMessage}`)
  }
}

// 工具栏事件处理
const handleAiEnhance = () => {
  showAiDialog.value = true
}

// 执行AI增强
const executeAiEnhance = async () => {
  if (!markdownContent.value.trim()) {
    alert('请先输入一些内容')
    return
  }

  // 重新加载配置以确保获取最新设置
  loadSettings()
  
  console.log('[DEBUG] Current settings after reload:', currentSettings.value)
  
  // 检查API密钥是否有效
  const apiKey = currentSettings.value.aiConfig.apiKey
  if (!apiKey || 
      apiKey.trim() === '' ||
      apiKey.includes('your_') ||
      apiKey.includes('sk-xxx') ||
      apiKey === 'your_openai_api_key_here') {
    alert('请先在设置中配置有效的 OpenAI API Key\n\n步骤：\n1. 点击右上角设置按钮\n2. 在AI配置中输入你的OpenAI API Key\n3. 点击保存配置\n\n你可以在 https://platform.openai.com/api-keys 获取API Key')
    return
  }

  console.log('[DEBUG] API Key check passed, first 10 chars:', apiKey.substring(0, 10))

  aiLoading.value = true
  // 只有非智能分段任务才立即关闭对话框
  if (aiTaskType.value !== 'segment_text') {
    showAiDialog.value = false
  }
  
  try {
    // 检查API健康状态
    const isHealthy = await checkApiHealth()
    if (!isHealthy) {
      throw new Error('后端服务不可用，请确保Python服务已启动')
    }

    const request: EnhanceRequest = {
      content: markdownContent.value,
      task_type: aiTaskType.value,
      aiConfig: {
        baseUrl: currentSettings.value.aiConfig.baseUrl,
        apiKey: currentSettings.value.aiConfig.apiKey,
        modelName: currentSettings.value.aiConfig.customModelName || currentSettings.value.aiConfig.modelName,
        temperature: currentSettings.value.aiConfig.temperature,
        maxTokens: currentSettings.value.aiConfig.maxTokens,
        pageBreakPrompt: currentSettings.value.aiConfig.pageBreakPrompt,
        tableBeautifyPrompt: currentSettings.value.aiConfig.tableBeautifyPrompt,
        imageGenerationPrompt: currentSettings.value.aiConfig.imageGenerationPrompt
      },
      cssConfig: currentSettings.value.cssConfig
    }
    
    // 调试日志：检查请求数据
    console.log('[DEBUG] 发送到后端的请求:', {
      ...request,
      aiConfig: {
        ...request.aiConfig,
        apiKey: request.aiConfig?.apiKey?.substring(0, 10) + '...' // 只显示前10位
      }
    })

    const response = await enhanceMarkdown(request)
    
    if (response.success && response.enhanced_content) {
      // 根据任务类型处理响应内容
      if (aiTaskType.value === 'segment_text') {
        // 智能分段任务：更新markdown编辑器内容
        markdownContent.value = response.enhanced_content
        await nextTick()
        updatePages()
        
        // 等待内容更新完成后再关闭对话框和显示消息
        await nextTick()
        showAiDialog.value = false
        
        // 根据网络状态显示不同的成功消息
        if (response.networkStatus === 'vpn_issue') {
          alert('智能分段完成！内容已更新到编辑器。\n\n注意：检测到VPN可能影响了连接速度，如果后续使用中遇到问题，建议优化VPN设置。')
        } else {
          alert('智能分段完成！内容已更新到编辑器。')
        }
      } else {
        // 其他任务：更新markdown内容
        markdownContent.value = response.enhanced_content
        updatePages()
        
        // 根据网络状态显示不同的成功消息
        if (response.networkStatus === 'vpn_issue') {
          alert('AI增强完成！\n\n注意：检测到VPN可能影响了连接速度，如果后续使用中遇到问题，建议优化VPN设置。')
        } else {
          alert('AI增强完成！')
        }
      }
    } else {
      throw new Error(response.error || 'AI增强失败')
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误'
    const timestamp = new Date().toISOString()
    
    // 详细错误日志记录
    console.error(`[${timestamp}] AI增强失败:`, {
      error: errorMsg,
      taskType: aiTaskType.value,
      contentLength: markdownContent.value.length,
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // 记录错误日志
    logError('AI_ENHANCE_FAILED', errorMsg, {
      taskType: aiTaskType.value,
      contentLength: markdownContent.value.length,
      timestamp
    }, error instanceof Error ? error.stack : undefined)
    
    // 显示友好的错误提示（已包含VPN相关建议）
    showVpnFriendlyError(errorMsg)
  } finally {
    aiLoading.value = false
  }
}

// MarkdownPoster 组件引用
const markdownPosterRef = ref<InstanceType<typeof MarkdownPoster>>()

const handleGenerateImage = async () => {
  if (markdownPosterRef.value) {
    await markdownPosterRef.value.generateImage()
  }
}

const handleExport = () => {
  // TODO: 实现导出功能
}

// 设置相关状态
const showSettingsDialog = ref(false)



// 默认设置
const defaultSettings = {
  aiConfig: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    modelName: 'gpt-3.5-turbo',
    customModelName: '',
    temperature: 0.7,
    maxTokens: 2000,
    pageBreakPrompt: `请对以下Markdown文档进行智能分段，在合适的位置添加换页标识符。要求：

**换页标识符使用指南：**
- 使用 \`<!-- PAGE_BREAK -->\` 作为换页标识符
- 分段位置不能在连贯段落的中间，必须保持内容的连贯性
- 优先在章节、小节之间分页
- 当表格内容过长时，可在合适的地方横向分开，但尽量保证表格完整性
- 每一段控制在500字以内（表格字数不计入限制）
- 分页后每页都应该有完整的语义单元

**分段原则：**
1. 连贯性优先：不在句子、段落中间分页
2. 语义完整：每页内容应该相对独立和完整
3. 长度控制：每页500字以内（表格除外）
4. 表格处理：长表格可适当分割，但保持表头和数据的对应关系

请在合适的位置插入换页标识符，确保分页后的内容既符合长度要求又保持良好的阅读体验。`,
    tableBeautifyPrompt: `请美化以下Markdown表格，要求：

**美化原则：**
- 保持表格数据的完整性和准确性
- 优化表格的可读性和视觉效果
- 确保表格在不同设备上的兼容性

**可优化的方面：**
1. 表格对齐：合理设置列对齐方式
2. 表头样式：突出表头的视觉效果
3. 数据格式：统一数字、日期等格式
4. 空值处理：合理处理空白单元格

请返回优化后的Markdown表格代码。`,
    imageGenerationPrompt: `请为以下Markdown内容生成合适的配图建议：

**生成原则：**
- 根据内容主题提供相关的图片描述
- 确保图片与文本内容高度相关
- 提供简洁明确的图片描述

**图片类型：**
1. 插图：配合文章内容的示意图
2. 图表：数据可视化图表
3. 装饰图：提升视觉效果的背景图

请提供图片的详细描述和建议的插入位置。`
  },
  imageConfig: {
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundImageType: 'none' as const,
    backgroundImageOpacity: 0.8,
    backgroundImageSize: 'cover' as const
  },
  cssConfig: {
    customCSS: '',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    lineHeight: 1.6,
    textColor: '#1f2937'
  }
}

// 当前设置
const currentSettings = ref<AppSettings>(defaultSettings as AppSettings)

// 从localStorage加载设置
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('md2image-settings')
    console.log('🔍 从localStorage加载的原始设置:', saved)
    if (saved) {
      const parsed = JSON.parse(saved)
      console.log('🔍 解析后的设置:', parsed)
      console.log('🔍 cssConfig:', parsed.cssConfig)
      console.log('🔍 customCSS内容:', parsed.cssConfig?.customCSS)
      console.log('🔍 customCSS长度:', parsed.cssConfig?.customCSS?.length || 0)
      console.log('🔍 customCSS是否为空:', !parsed.cssConfig?.customCSS || parsed.cssConfig?.customCSS.trim() === '')
      currentSettings.value = { ...defaultSettings, ...parsed }
    }
    console.log('🔍 最终currentSettings:', currentSettings.value)
    console.log('🔍 最终customCSS:', currentSettings.value.cssConfig?.customCSS)
  } catch (error) {
    console.warn('Failed to load settings:', error)
    currentSettings.value = defaultSettings
  }
}

// 保存设置到localStorage
const saveSettingsToStorage = (settings: any) => {
  try {
    localStorage.setItem('md2image-settings', JSON.stringify(settings))
    currentSettings.value = settings
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

const handleSettings = () => {
  showSettingsDialog.value = true
}

const handleSettingsClose = () => {
  showSettingsDialog.value = false
}

const handleSettingsSave = (settings: any) => {
  saveSettingsToStorage(settings)
  showSettingsDialog.value = false
}

// 处理应用样式方案
const handleApplyStyleScheme = (scheme: any) => {
  const newSettings = {
    ...currentSettings.value,
    cssConfig: {
      ...currentSettings.value.cssConfig,
      fontFamily: scheme.fontFamily,
      fontSize: scheme.fontSize,
      lineHeight: scheme.lineHeight,
      textColor: scheme.textColor,
      customCSS: scheme.customCSS
    }
  }
  saveSettingsToStorage(newSettings)
}

// 处理字体大小调整
const handleAdjustFontSize = (delta: number) => {
  const currentSize = currentSettings.value.cssConfig?.fontSize || 16
  const newSize = Math.max(8, Math.min(48, currentSize + delta))
  const newSettings = {
    ...currentSettings.value,
    cssConfig: {
      ...currentSettings.value.cssConfig,
      fontSize: newSize
    }
  }
  saveSettingsToStorage(newSettings)
}

// 处理行高调整
const handleAdjustLineHeight = (delta: number) => {
  const currentLineHeight = currentSettings.value.cssConfig?.lineHeight || 1.6
  const newLineHeight = Math.max(1.0, Math.min(3.0, currentLineHeight + delta))
  const newSettings = {
    ...currentSettings.value,
    cssConfig: {
      ...currentSettings.value.cssConfig,
      lineHeight: newLineHeight
    }
  }
  saveSettingsToStorage(newSettings)
}



// 编辑器引用
const editorRef = ref<InstanceType<typeof MarkdownEditor>>()

// 处理插入换页标识符
const handleInsertMarker = (marker: string) => {
  if (editorRef.value) {
    // 在标记符前后添加换行，确保格式正确
    const textToInsert = `\n\n${marker}\n\n`
    editorRef.value.insertText(textToInsert)
  }
}

// 处理提示词配置更新
const handleUpdatePrompts = (prompts: {
  pageBreakPrompt: string
  tableBeautifyPrompt: string
  imageGenerationPrompt: string
}) => {
  const newSettings = {
    ...currentSettings.value,
    aiConfig: {
      ...currentSettings.value.aiConfig,
      pageBreakPrompt: prompts.pageBreakPrompt,
      tableBeautifyPrompt: prompts.tableBeautifyPrompt,
      imageGenerationPrompt: prompts.imageGenerationPrompt
    }
  }
  saveSettingsToStorage(newSettings)
}

// 处理智能分段设置
const handleSegmentSettings = () => {
  showAiDialog.value = false
  handleSettings()
}

// 监听markdownContent变化，自动更新页面
watch(markdownContent, () => {
  updatePages()
}, { immediate: false })

// 初始化
onMounted(() => {
  loadSettings()
  loadErrorLogs()
  updatePages()
})
</script>

<template>
  <div class="min-h-screen bg-background text-text transition-colors duration-300">
    <!-- 顶部工具栏 -->
    <Toolbar 
      :current-page="currentPage"
      :total-pages="pages.length"
      :is-dark="isDark"
      :debug-mode="debugMode"
      :current-settings="currentSettings"
      @prev-page="prevPage"
      @next-page="nextPage"
      @ai-enhance="handleAiEnhance"
      @generate-image="handleGenerateImage"
      @export="handleExport"
      @settings="handleSettings"
      @toggle-theme="toggleTheme"
      @toggle-debug="debugMode = !debugMode"
      @show-error-logs="handleShowErrorLogs"
      @apply-style-scheme="handleApplyStyleScheme"
      @adjust-font-size="handleAdjustFontSize"
      @adjust-line-height="handleAdjustLineHeight"
    />

    <!-- 主内容区域 -->
    <main class="flex-1 flex">
      <div class="flex flex-col lg:flex-row w-full h-[calc(100vh-80px)]">
        <!-- 左侧编辑器面板 -->
        <div class="w-full lg:w-1/2 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-border">
          <div class="h-full flex flex-col">
            <!-- 编辑器标题 -->
            <div class="flex items-center mb-4">
              <h2 class="text-base lg:text-lg font-serif font-semibold text-text flex-1">Markdown 编辑器</h2>
              <div class="flex items-center space-x-3">
                <PageBreakHelper 
                  :settings="currentSettings"
                  @insert-marker="handleInsertMarker"
                  @update-prompts="handleUpdatePrompts"
                  @aiEnhance="handleAiEnhance"
                />
                <div class="text-xs lg:text-sm text-muted">
                  {{ markdownContent.length }} 字符
                </div>
              </div>
            </div>
            
            <!-- 编辑器容器 -->
            <div class="h-[calc(100%-60px)] lg:h-[calc(100%-80px)]">
              <MarkdownEditor 
                ref="editorRef"
                v-model="markdownContent"
                @update:model-value="updatePages"
              />
            </div>
          </div>
        </div>
        
        <!-- 右侧预览面板 -->
        <div class="w-full lg:w-1/2 p-4 lg:p-6">
          <div class="h-full flex flex-col">

            
            <!-- 图片预览面板 -->
            <div class="h-full flex flex-col">
              <div v-if="pages.length > 0" class="flex-1 min-h-0">
                <MarkdownPoster 
                  ref="markdownPosterRef"
                  :content="pages[currentPage] || ''"
                  :all-pages="pages"
                  :settings="currentSettings"
                  :debug-mode="debugMode"
                  @update:debug-mode="debugMode = $event"
                  @open-settings="handleSettings"
                  @apply-style-scheme="handleApplyStyleScheme"
                  @adjust-font-size="handleAdjustFontSize"
                  @adjust-line-height="handleAdjustLineHeight"
                />
              </div>
              <div v-else class="flex-1 border border-border rounded-lg bg-surface flex items-center justify-center">
                <div class="text-muted text-center px-4">
                  <div class="text-lg mb-2">🖼️</div>
                  <div class="text-sm lg:text-base">在编辑器中输入 Markdown 内容</div>
                  <div class="text-xs lg:text-sm mt-1">将自动生成图片预览</div>
                </div>
              </div>
              
              <!-- 分页导航 -->
              <div class="mt-2 flex-shrink-0">
                <PageNavigation 
                  :current-page="currentPage"
                  :total-pages="pages.length"
                  @prev-page="prevPage"
                  @next-page="nextPage"
                  @go-to-page="goToPage"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- AI增强任务选择对话框 -->
    <div v-if="showAiDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAiDialog = false">
      <div class="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-serif font-semibold text-text mb-4">选择AI增强任务</h3>
        
        <div class="space-y-3 mb-6">
          <div 
            v-for="task in aiTasks" 
            :key="task.value"
            class="border border-border rounded-lg p-3 cursor-pointer transition-colors"
            :class="{
              'bg-text text-background': aiTaskType === task.value,
              'bg-surface hover:bg-surface/80': aiTaskType !== task.value
            }"
            @click="aiTaskType = task.value"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-medium text-sm mb-1">{{ task.label }}</div>
                <div class="text-xs opacity-75">{{ task.description }}</div>
              </div>
              <div v-if="task.value === 'segment_text'" class="ml-3">
                <button 
                  @click.stop="handleSegmentSettings"
                  class="p-1 rounded hover:bg-background/20 transition-colors"
                  :class="{
                    'hover:bg-text/20': aiTaskType === task.value,
                    'hover:bg-surface': aiTaskType !== task.value
                  }"
                  title="智能分段设置"
                >
                  <Settings class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button 
            @click="showAiDialog = false"
            class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors text-text"
            :disabled="aiLoading"
          >
            取消
          </button>
          <button 
            @click="executeAiEnhance"
            class="flex-1 px-4 py-2 bg-text text-background rounded-lg hover:bg-text/90 transition-colors flex items-center justify-center"
            :disabled="aiLoading"
          >
            <span v-if="!aiLoading">开始增强</span>
            <span v-else class="flex items-center space-x-2">
              <div class="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
              <span>处理中...</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 设置对话框 -->
    <SettingsDialog 
      v-if="showSettingsDialog"
      :visible="showSettingsDialog"
      :settings="currentSettings"
      @close="handleSettingsClose"
      @save="handleSettingsSave"
    />

    <!-- 网络状态组件已移除 -->
    <!-- <NetworkStatus /> -->

    <!-- VPN故障排除指南已移除 -->
    <!-- <VpnTroubleshootingGuide /> -->

    <!-- 错误日志对话框 -->
    <ErrorLogDialog 
      v-if="showErrorLogDialog"
      :visible="showErrorLogDialog"
      :error-logs="errorLogs"
      @close="handleErrorLogClose"
      @clear="clearErrorLogs"
    />


  </div>
</template>

<style scoped>
/* 自定义 prose 类样式 */
.prose {
  color: var(--color-text);
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  font-family: var(--font-serif);
  color: var(--color-text);
}

.prose p {
  color: var(--color-text);
}

.prose code {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.prose pre {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

.prose blockquote {
  border-left-color: var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text);
}

/* Markdown 内容样式 */
.markdown-content {
  font-family: var(--font-sans);
  line-height: var(--markdown-line-height, 1.7);
  font-size: var(--markdown-font-size, 16px);
  padding: var(--markdown-page-margin, 24px);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-family: var(--font-serif);
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

.markdown-content table {
  font-size: 0.9rem;
}

.markdown-content pre {
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 滑块样式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: var(--color-text);
  cursor: pointer;
  border: 2px solid var(--color-background);
  box-shadow: 0 0 0 1px var(--color-border);
}

input[type="range"]::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: var(--color-text);
  cursor: pointer;
  border: 2px solid var(--color-background);
  box-shadow: 0 0 0 1px var(--color-border);
}
</style>
