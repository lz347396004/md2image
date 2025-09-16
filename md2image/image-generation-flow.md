# 图片生成流程分析

## 完整流程图

```mermaid
flowchart TD
    A[用户输入Markdown内容] --> B[内容分页处理]
    B --> C[提取表格数据]
    C --> D[渲染Markdown为HTML]
    D --> E[应用CSS样式]
    E --> F[组件渲染]
    F --> G[html2canvas转换]
    G --> H[生成图片]
    H --> I[显示预览]
    
    %% 分页处理细节
    B --> B1[检查换页标识符]
    B1 --> B2[<!-- PAGE_BREAK -->等]
    B2 --> B3[分割内容为页面]
    B3 --> B4[智能分页算法]
    
    %% 表格处理
    C --> C1[识别表格占位符]
    C1 --> C2[提取表格数据]
    C2 --> C3[替换为占位符]
    
    %% HTML渲染
    D --> D1[markdown-it渲染]
    D1 --> D2[生成HTML结构]
    D2 --> D3[移除表格占位符]
    
    %% CSS样式应用
    E --> E1[应用用户自定义CSS]
    E1 --> E2[应用主题样式]
    E2 --> E3[设置字体和颜色]
    E3 --> E4[设置背景和边框]
    
    %% 组件渲染
    F --> F1[StaticCard组件]
    F1 --> F2[渲染容器设置]
    F2 --> F3[内容插入DOM]
    F3 --> F4[表格组件渲染]
    
    %% html2canvas转换
    G --> G1[创建canvas]
    G1 --> G2[设置渲染选项]
    G2 --> G3[克隆DOM元素]
    G3 --> G4[应用样式到克隆]
    G4 --> G5[绘制到canvas]
    
    %% 可能导致全白的问题点
    B -.->|问题1| PB1[换页符解析错误<br/>导致内容为空]
    D -.->|问题2| PD1[HTML渲染失败<br/>内容为空白]
    E -.->|问题3| PE1[CSS样式冲突<br/>文字颜色透明]
    E -.->|问题4| PE2[背景色覆盖文字<br/>颜色相同]
    F -.->|问题5| PF1[StaticCard组件<br/>样式覆盖问题]
    F -.->|问题6| PF2[DOM元素未正确<br/>插入渲染容器]
    G -.->|问题7| PG1[html2canvas配置<br/>背景色设置错误]
    G -.->|问题8| PG2[字体加载失败<br/>文字无法显示]
    G -.->|问题9| PG3[克隆DOM时<br/>样式丢失]
    
    %% 样式问题详细分析
    PE1 --> PE1A[检查color属性]
    PE1 --> PE1B[检查opacity设置]
    PE1 --> PE1C[检查text-shadow]
    
    PE2 --> PE2A[检查background-color]
    PE2 --> PE2B[检查渐变背景]
    PE2 --> PE2C[检查z-index层级]
    
    PF1 --> PF1A[StaticCard背景样式]
    PF1 --> PF1B[variant样式冲突]
    PF1 --> PF1C[scoped样式隔离]
    
    PG1 --> PG1A[backgroundColor配置]
    PG1 --> PG1B[scale缩放设置]
    PG1 --> PG1C[useCORS设置]
    
    PG2 --> PG2A[字体文件加载]
    PG2 --> PG2B[fallback字体]
    PG2 --> PG2C[字体渲染时机]
    
    PG3 --> PG3A[onclone回调处理]
    PG3 --> PG3B[内联样式应用]
    PG3 --> PG3C[CSS变量解析]
    
    style PB1 fill:#ffebee
    style PD1 fill:#ffebee
    style PE1 fill:#ffebee
    style PE2 fill:#ffebee
    style PF1 fill:#ffebee
    style PF2 fill:#ffebee
    style PG1 fill:#ffebee
    style PG2 fill:#ffebee
    style PG3 fill:#ffebee
```

## 关键问题分析

### 1. 内容处理阶段
- **换页符解析错误**: 可能导致页面内容为空
- **表格数据提取失败**: 表格无法正确显示
- **Markdown渲染异常**: HTML结构不完整

### 2. 样式应用阶段
- **CSS颜色冲突**: 文字颜色与背景色相同或透明
- **字体加载失败**: 文字无法正确渲染
- **样式优先级问题**: 重要样式被覆盖

### 3. 组件渲染阶段
- **StaticCard组件问题**: 背景样式覆盖内容
- **DOM插入失败**: 内容未正确插入渲染容器
- **Vue组件生命周期**: 渲染时机不当

### 4. 图片转换阶段
- **html2canvas配置错误**: 背景色、缩放等参数不当
- **DOM克隆问题**: 样式在克隆过程中丢失
- **异步渲染问题**: 内容未完全加载就开始转换

## 排查建议

### 立即检查项目
1. **查看浏览器控制台**: 检查是否有CSS或JavaScript错误
2. **检查渲染容器**: 确认DOM元素是否正确插入
3. **验证CSS样式**: 检查文字颜色和背景色设置
4. **测试字体加载**: 确认字体文件是否正确加载

### 逐步调试方法
1. **简化内容测试**: 使用最简单的文本内容测试
2. **禁用复杂样式**: 暂时移除自定义CSS和复杂效果
3. **检查html2canvas选项**: 调整渲染参数
4. **添加调试日志**: 在关键步骤添加console.log

### 常见解决方案
1. **强制设置文字颜色**: 在CSS中使用!important
2. **调整html2canvas配置**: 修改backgroundColor和其他选项
3. **优化字体加载**: 使用web安全字体作为fallback
4. **改进DOM克隆处理**: 在onclone回调中强制应用样式