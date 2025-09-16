<template>
  <div class="markdown-poster">
    <!-- 预览工具栏 -->
    <div class="preview-toolbar bg-background border-b border-border mb-4" style="background-color: var(--color-background) !important; border-color: var(--color-border) !important;">
      <div class="toolbar-left">
        <button 
          @click="generateImage" 
          :disabled="isGenerating || !props.content.trim()"
          class="px-2 py-1.5 lg:px-4 lg:py-2 bg-text text-background rounded-lg hover:bg-text/90 transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-sm hover:shadow-md"
        >
          <div v-if="isGenerating" class="loading-spinner"></div>
          {{ isGenerating ? '生成中...' : '生成图片' }}
        </button>
        
        <button 
          @click="downloadImage" 
          :disabled="!previewImage"
          class="px-2 py-1.5 lg:px-4 lg:py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-sm hover:shadow-md bg-surface border border-border text-text hover:bg-text/10"
        >下载</button>
        
        <button 
          @click="copyToClipboard" 
          :disabled="!previewImage"
          class="px-2 py-1.5 lg:px-4 lg:py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-sm hover:shadow-md bg-surface border border-border text-text hover:bg-text/10"
        >复制</button>
        
        <!-- 快速样式按钮 -->
        <div class="relative">
          <button 
            @click="toggleStylePanel"
            class="px-2 py-1.5 lg:px-4 lg:py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-sm hover:shadow-md bg-surface border border-border text-text hover:bg-text/10"
            :class="{ 'bg-text text-background hover:bg-text/90': showStylePanel }"
            title="快速样式"
          >样式</button>
          
          <!-- 样式快捷面板 -->
          <div v-if="showStylePanel" class="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50 p-4">
            <div class="text-sm font-medium text-text mb-3">快速样式</div>
            
            <!-- 预设样式方案 -->
            <div class="space-y-2 mb-4">
              <div class="text-xs text-muted mb-2">预设方案</div>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  v-for="scheme in styleSchemes" 
                  :key="scheme.name"
                  @click="applyStyleScheme(scheme)"
                  class="p-2 text-xs border border-border rounded hover:bg-surface transition-colors text-left"
                >
                  <div class="font-medium">{{ scheme.name }}</div>
                  <div class="text-muted text-xs">{{ scheme.description }}</div>
                </button>
              </div>
            </div>
            
            <!-- 快速设置 -->
            <div class="space-y-3">
              <div class="text-xs text-muted">快速调整</div>
              
              <!-- 字体大小 -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-text">字体大小</span>
                <div class="flex items-center space-x-1">
                  <button @click="adjustFontSize(-2)" class="w-6 h-6 rounded border border-border hover:bg-surface text-xs">-</button>
                  <span class="text-xs text-muted w-8 text-center">{{ props.settings?.cssConfig?.fontSize || 16 }}</span>
                  <button @click="adjustFontSize(2)" class="w-6 h-6 rounded border border-border hover:bg-surface text-xs">+</button>
                </div>
              </div>
              
              <!-- 行高 -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-text">行高</span>
                <div class="flex items-center space-x-1">
                  <button @click="adjustLineHeight(-0.1)" class="w-6 h-6 rounded border border-border hover:bg-surface text-xs">-</button>
                  <span class="text-xs text-muted w-8 text-center">{{ (props.settings?.cssConfig?.lineHeight || 1.6).toFixed(1) }}</span>
                  <button @click="adjustLineHeight(0.1)" class="w-6 h-6 rounded border border-border hover:bg-surface text-xs">+</button>
                </div>
              </div>
            </div>
            
            <div class="border-t border-border mt-3 pt-3">
              <button 
                @click="emit('openSettings')"
                class="w-full text-xs text-text hover:bg-surface p-2 rounded transition-colors"
              >
                更多设置...
              </button>
            </div>
          </div>
        </div>
        
        <!-- 全部下载按钮 -->
        <button 
          @click="batchDownload" 
          :disabled="isBatchDownloading"
          class="px-2 py-1.5 lg:px-4 lg:py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-sm hover:shadow-md bg-surface border border-border text-text hover:bg-text/10"
          title="下载所有页面的压缩包"
        >
          <div v-if="isBatchDownloading" class="loading-spinner"></div>
          {{ isBatchDownloading ? '下载中...' : '全部下载' }}
        </button>
      </div>
      
      <div class="toolbar-right">
        <div class="zoom-controls bg-surface border border-border rounded-lg p-0 flex items-center space-x-1">
          <button @click="zoomOut" :disabled="zoomLevel <= 0.05" class="px-2 py-1 rounded transition-all duration-200 bg-surface border border-border text-text hover:bg-text/10 disabled:opacity-50 disabled:cursor-not-allowed">-</button>
          <span class="zoom-display px-2 text-sm text-text min-w-12 text-center">{{ Math.round(zoomLevel * 100) }}%</span>
          <button @click="zoomIn" :disabled="zoomLevel >= 3" class="px-2 py-1 rounded transition-all duration-200 bg-surface border border-border text-text hover:bg-text/10 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
          <button @click="fitToWindow" class="px-2 py-1 rounded transition-all duration-200 border border-border text-text hover:bg-text/10" :class="{ 'bg-blue-600 text-white hover:bg-blue-700': isFitToWindow, 'bg-surface': !isFitToWindow }">适应窗口</button>
          <button @click="resetZoom" class="px-2 py-1 rounded transition-all duration-200 bg-surface border border-border text-text hover:bg-text/10">1:1</button>
        </div>
      </div>
    </div>

    <!-- 图片预览区域 -->
    <div class="preview-container bg-surface p-4" ref="previewContainer">
      <div 
        v-if="previewImage" 
        class="preview-wrapper bg-background"
        :style="{
          transform: `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @wheel="onWheel"
      >
        <img 
          :src="previewImage" 
          alt="Generated Preview" 
          class="preview-image"
          :class="{ 'fit-to-window': isFitToWindow }"
          draggable="false"
        />
      </div>
      
      <div v-else-if="!props.content.trim()" class="empty-state">
        <p>请输入 Markdown 内容以生成预览</p>
      </div>
      
      <div v-else class="loading-state">
        <p>准备生成预览...</p>
      </div>
    </div>

    <!-- 隐藏的渲染容器 -->
    <div 
      ref="renderContainer"
      class="render-container"
      :class="{ 'debug-visible': props.debugMode }"
      :style="getBackgroundStyle()"
    >
      <div 
        v-html="processedHtml"
        class="prose prose-lg max-w-none markdown-content"
        :style="getContentStyle()"
      ></div>
      
      <!-- 调试信息 -->
      <div v-if="props.debugMode" class="debug-info">
        <div class="debug-header">
          <div class="debug-label">调试模式 - 渲染容器</div>
          <button @click="emit('update:debugMode', false)" class="debug-close-btn" title="关闭调试模式">
            ✕
          </button>
        </div>
        <div class="debug-details">
          <div>内容长度: {{ processedHtml.length }}</div>
          <div>容器尺寸: {{ renderContainer?.offsetWidth }}x{{ renderContainer?.offsetHeight }}</div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="showToastMessage" class="toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, defineExpose } from 'vue'
import { domToPng } from 'modern-screenshot'
import { renderMarkdown, replaceTablesWithPlaceholders } from '../utils/markdown'
import JSZip from 'jszip'

// Props 接口定义
interface Props {
  content: string
  allPages?: string[]  // 添加所有页面内容的属性
  debugMode?: boolean
  settings: {
    aiConfig: {
      baseUrl: string
      apiKey: string
      modelName: string
      customModelName: string
      temperature: number
      maxTokens: number
      pageBreakPrompt: string
      tableBeautifyPrompt: string
      imageGenerationPrompt: string
    }
    imageConfig: {
      backgroundColor: string
      backgroundImage: string
      backgroundImageType: 'none' | 'preset' | 'custom'
      backgroundImageOpacity: number
      backgroundImageSize: 'cover' | 'contain' | 'auto'
    }
    cssConfig: {
      customCSS: string
      fontFamily: string
      fontSize: number
      lineHeight: number
      textColor: string
    }
  }
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  debugMode: false
})

// 定义事件
const emit = defineEmits<{
  'update:debugMode': [value: boolean]
  'openSettings': []
  'applyStyleScheme': [scheme: any]
  'adjustFontSize': [delta: number]
  'adjustLineHeight': [delta: number]
}>()

// 响应式数据
const previewImage = ref('')
const isGenerating = ref(false)
const zoomLevel = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const showToastMessage = ref(false)
const toastMessage = ref('')
// 从localStorage读取适应窗口状态，默认为true
const isFitToWindow = ref(localStorage.getItem('md2image-fitToWindow') === 'false' ? false : true)
// debugMode 现在通过 props 传入，不再是内部状态

// 快速样式面板状态
const showStylePanel = ref(false)

// 批量下载状态
const isBatchDownloading = ref(false)

// 预设样式方案
const styleSchemes = ref([
  {
    name: '现代简洁',
    description: '清爽现代风格',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    lineHeight: 1.6,
    textColor: '#1f2937'
  },
  {
    name: '优雅衬线',
    description: '经典衬线字体',
    fontFamily: 'Georgia, serif',
    fontSize: 18,
    lineHeight: 1.7,
    textColor: '#374151'
  },
  {
    name: '技术文档',
    description: '适合代码文档',
    fontFamily: 'SF Mono, Monaco, monospace',
    fontSize: 14,
    lineHeight: 1.5,
    textColor: '#111827'
  },
  {
    name: '温暖阅读',
    description: '舒适阅读体验',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 17,
    lineHeight: 1.8,
    textColor: '#4b5563'
  }
])

// 模板引用
const renderContainer = ref<HTMLElement>()
const previewContainer = ref<HTMLElement>()

// 计算属性
const processedHtml = computed(() => {
  if (!props.content.trim()) {
    console.log('[MarkdownPoster] 内容为空')
    return ''
  }
  
  try {
    console.log('[MarkdownPoster] 开始处理内容:', props.content.substring(0, 100) + '...')
    
    // 直接渲染Markdown内容，不进行表格占位符处理
    // 因为表格占位符处理应该在分页时进行，这里应该渲染完整的内容
    let html = renderMarkdown(props.content)
    console.log('[MarkdownPoster] Markdown 渲染完成，HTML 长度:', html.length)
    
    // 移除换页分隔符
    html = html.replace(/<!--\s*PAGEBREAK\s*-->/g, '')
    
    // 清理空段落
    html = html.replace(/<p>\s*<\/p>/g, '')
    
    // 确保有基本内容
    if (!html.trim()) {
      console.warn('[MarkdownPoster] 处理后的 HTML 为空')
      return '<p>内容处理失败</p>'
    }
    
    console.log('[MarkdownPoster] 最终 HTML:', html.substring(0, 200) + '...')
    return html
  } catch (error) {
    console.error('[MarkdownPoster] 处理内容时出错:', error)
    return `<p>内容处理出错: ${error.message}</p>`
  }
})

// 背景样式
const getBackgroundStyle = () => {
  const imageConfig = props.settings?.imageConfig
  if (!imageConfig) return {}
  
  const { backgroundColor, backgroundImage, backgroundImageType, backgroundImageOpacity, backgroundImageSize } = imageConfig
  
  // 明确处理无背景情况
  if (backgroundImageType === 'none') {
    return {
      backgroundColor: backgroundColor || '#ffffff',
      backgroundImage: 'none'
    }
  }
  
  // 处理预设背景图片
  if (backgroundImageType === 'preset' && backgroundImage) {
    // 检查是否为CSS渐变
    if (backgroundImage.includes('gradient') || backgroundImage.includes('linear-gradient')) {
      return {
        backgroundColor: 'transparent',
        backgroundImage: backgroundImage,
        backgroundSize: backgroundImageSize || 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity: backgroundImageOpacity
      }
    } else {
      // 普通图片URL
      return {
        backgroundColor: backgroundColor || '#ffffff',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: backgroundImageSize || 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity: backgroundImageOpacity
      }
    }
  }
  
  // 处理自定义背景图片
  if (backgroundImageType === 'custom' && backgroundImage) {
    return {
      backgroundColor: backgroundColor || '#ffffff',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: backgroundImageSize || 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      opacity: backgroundImageOpacity
    }
  }
  
  // 默认返回纯色背景
  return {
    backgroundColor: backgroundColor || '#ffffff',
    backgroundImage: 'none'
  }
}

// 响应式计算CSS配置
const cssConfig = computed(() => {
  console.log('🔧 计算cssConfig，当前props.settings:', props.settings)
  console.log('🔧 props.settings?.cssConfig:', props.settings?.cssConfig)
  
  const config = {
    fontFamily: props.settings?.cssConfig?.fontFamily || 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontSize: props.settings?.cssConfig?.fontSize || 16,
    lineHeight: props.settings?.cssConfig?.lineHeight || 1.6,
    textColor: props.settings?.cssConfig?.textColor || '#333333',
    customCSS: props.settings?.cssConfig?.customCSS || ''
  }
  
  console.log('🎯 最终cssConfig:', config)
  return config
})

// 内容样式
const getContentStyle = () => {
  const config = cssConfig.value
  if (!config) return {}
  
  return {
    fontFamily: config.fontFamily || 'Inter, system-ui, sans-serif',
    fontSize: `${config.fontSize || 16}px`,
    lineHeight: config.lineHeight || 1.6,
    color: config.textColor || '#1f2937'
  }
}

// 处理自定义CSS，添加作用域
const processCustomCSS = (customCSS: string): string => {
  console.log('🎨 处理自定义CSS:', customCSS)
  if (!customCSS || !customCSS.trim()) {
    console.log('❌ 自定义CSS为空')
    return ''
  }
  
  // 修复常见的CSS语法错误
  let fixedCSS = customCSS
    // 修复不完整的十六进制颜色值（如 #452 -> #445522）
    .replace(/#([0-9a-fA-F]{3})(?![0-9a-fA-F])/g, (match, hex) => {
      return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
    })
    // 修复其他常见错误
    .replace(/;\s*;/g, ';') // 移除重复的分号
    .replace(/:\s*;/g, ': transparent;') // 修复空值
  
  console.log('🔧 修复CSS语法错误后:', fixedCSS)
  
  // 将用户CSS中的.markdown-body选择器替换为实际的容器选择器
  // 同时处理其他常见的选择器模式
  let processedCSS = fixedCSS
    .replace(/\.markdown-body\s*/g, '.render-container .markdown-content ')
  console.log('🔄 替换.markdown-body后:', processedCSS)
  
  processedCSS = processedCSS.replace(/^([^{@}]+)\s*{/gm, (match, selector) => {
    const trimmedSelector = selector.trim()
    console.log('🔍 处理选择器:', trimmedSelector)
    // 如果选择器不包含容器作用域，则添加
    if (!selector.includes('.render-container') && !selector.includes('@')) {
      const newSelector = `.render-container .markdown-content ${trimmedSelector} {`
      console.log('✅ 添加作用域:', newSelector)
      return newSelector
    }
    console.log('⏭️ 跳过选择器:', trimmedSelector)
    return match
  })
  
  // 为用户自定义CSS添加!important以确保优先级
  processedCSS = processedCSS.replace(/([^{}]+)\s*{([^}]+)}/g, (match, selector, rules) => {
    const enhancedRules = rules.replace(/([^;]+);/g, (ruleMatch, rule) => {
      const trimmedRule = rule.trim()
      if (trimmedRule && !trimmedRule.includes('!important')) {
        return `${trimmedRule} !important;`
      }
      return ruleMatch
    })
    return `${selector} {${enhancedRules}}`
  })
  
  console.log('🎯 最终处理的CSS（添加!important后）:', processedCSS)
  return processedCSS
}

// 应用自定义 CSS
const applyCustomCSS = (container: HTMLElement) => {
  console.log('🚀 开始应用自定义CSS')
  
  // 移除之前的自定义样式
  const existingStyle = container.querySelector('#custom-markdown-styles')
  if (existingStyle) {
    console.log('🗑️ 移除旧样式标签')
    existingStyle.remove()
  }
  
  // 创建新的样式标签
  const style = document.createElement('style')
  style.id = 'custom-markdown-styles'
  
  const cssConfig = props.settings?.cssConfig
  if (!cssConfig) {
    console.log('[MarkdownPoster] 无CSS配置，跳过样式应用')
    return
  }
  
  console.log('📋 当前cssConfig:', cssConfig)
  console.log('🎨 自定义CSS内容:', cssConfig.customCSS)
  
  // 确保字体大小和行高有明显的效果
  const adjustedFontSize = Math.max(12, cssConfig.fontSize || 16)
  const adjustedLineHeight = Math.max(1.2, cssConfig.lineHeight || 1.6)
  
  // 生成自定义 CSS，使用更高的优先级
  style.textContent = `
    /* 基础样式 - 使用高优先级选择器 */
    .render-container .markdown-content {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${adjustedFontSize}px !important;
      line-height: ${adjustedLineHeight} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
    }
    
    .render-container .markdown-content * {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
    }
    
    .render-container .markdown-content h1 {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${Math.round(adjustedFontSize * 2.2)}px !important;
      line-height: ${Math.max(1.1, adjustedLineHeight * 0.9)} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
      font-weight: bold !important;
      margin-top: 1.5em !important;
      margin-bottom: ${Math.round(adjustedFontSize * 0.8)}px !important;
    }
    
    .render-container .markdown-content h2 {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${Math.round(adjustedFontSize * 1.8)}px !important;
      line-height: ${Math.max(1.1, adjustedLineHeight * 0.9)} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
      font-weight: bold !important;
      margin-top: 1.5em !important;
      margin-bottom: ${Math.round(adjustedFontSize * 0.7)}px !important;
    }
    
    .render-container .markdown-content h3 {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${Math.round(adjustedFontSize * 1.5)}px !important;
      line-height: ${Math.max(1.1, adjustedLineHeight * 0.9)} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
      font-weight: bold !important;
      margin-top: 1.5em !important;
      margin-bottom: ${Math.round(adjustedFontSize * 0.6)}px !important;
    }
    
    .render-container .markdown-content h4,
    .render-container .markdown-content h5,
    .render-container .markdown-content h6 {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${Math.round(adjustedFontSize * 1.2)}px !important;
      line-height: ${Math.max(1.1, adjustedLineHeight * 0.9)} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
      font-weight: bold !important;
      margin-top: 1.5em !important;
      margin-bottom: ${Math.round(adjustedFontSize * 0.5)}px !important;
    }
    
    .render-container .markdown-content table {
      border-collapse: collapse !important;
      width: 100% !important;
      margin: 1em 0 !important;
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${adjustedFontSize}px !important;
      line-height: ${adjustedLineHeight} !important;
    }
    
    .render-container .markdown-content table th,
    .render-container .markdown-content table td {
      border: 1px solid #d1d5db !important;
      padding: 8px 12px !important;
      text-align: left !important;
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
    }
    
    .render-container .markdown-content table th {
      background-color: #f9fafb !important;
      font-weight: bold !important;
    }
    
    .render-container .markdown-content table tr:nth-child(even) {
      background-color: #f9fafb !important;
    }
    
    .render-container .markdown-content p {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${adjustedFontSize}px !important;
      line-height: ${adjustedLineHeight} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
      margin-bottom: ${Math.round(adjustedFontSize * adjustedLineHeight * 0.8)}px !important;
    }
    
    .render-container .markdown-content li {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${adjustedFontSize}px !important;
      line-height: ${adjustedLineHeight} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
      margin-bottom: ${Math.round(adjustedFontSize * 0.3)}px !important;
    }
    
    .render-container .markdown-content td,
    .render-container .markdown-content th {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${adjustedFontSize}px !important;
      line-height: ${adjustedLineHeight} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
      padding: ${Math.round(adjustedFontSize * 0.4)}px ${Math.round(adjustedFontSize * 0.6)}px !important;
    }
    
    .render-container .markdown-content span,
    .render-container .markdown-content div {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${adjustedFontSize}px !important;
      line-height: ${adjustedLineHeight} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
    }
    
    .render-container .markdown-content code {
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace !important;
      font-size: ${Math.round(adjustedFontSize * 0.9)}px !important;
      background-color: #f3f4f6 !important;
      padding: 0.125rem 0.25rem !important;
      border-radius: 0.25rem !important;
    }
    
    .render-container .markdown-content pre {
      background-color: #f8f9fa !important;
      border: 1px solid #e9ecef !important;
      border-radius: 0.5rem !important;
      padding: ${Math.round(adjustedFontSize)}px !important;
      overflow-x: auto !important;
      margin-bottom: ${Math.round(adjustedFontSize * adjustedLineHeight)}px !important;
    }
    
    .render-container .markdown-content pre code {
      background-color: transparent !important;
      padding: 0 !important;
      font-size: ${Math.round(adjustedFontSize * 0.85)}px !important;
      line-height: ${Math.max(1.3, adjustedLineHeight * 0.9)} !important;
    }
    
    .render-container .markdown-content blockquote {
      font-family: ${cssConfig.fontFamily || 'Inter, system-ui, sans-serif'} !important;
      font-size: ${adjustedFontSize}px !important;
      line-height: ${adjustedLineHeight} !important;
      color: ${cssConfig.textColor || '#1f2937'} !important;
      border-left: 4px solid #e5e7eb !important;
      padding-left: 1rem !important;
      margin: ${Math.round(adjustedFontSize * adjustedLineHeight)}px 0 !important;
      font-style: italic !important;
    }
    
    /* 用户自定义CSS样式 - 最高优先级 */
    ${cssConfig.customCSS ? processCustomCSS(cssConfig.customCSS) : ''}
  `
  
  console.log('[MarkdownPoster] 生成的完整CSS样式:', style.textContent)
  container.appendChild(style)
  
  // 验证样式是否成功添加
  const addedStyle = container.querySelector('#custom-markdown-styles')
  if (addedStyle) {
    console.log('[MarkdownPoster] 样式标签已成功添加到容器')
  } else {
    console.error('[MarkdownPoster] 样式标签添加失败')
  }
}

// 缩放控制
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value = Math.min(3, zoomLevel.value + 0.1)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.05) {
    zoomLevel.value = Math.max(0.05, zoomLevel.value - 0.1)
  }
}

const resetZoom = () => {
  isFitToWindow.value = false
  localStorage.setItem('md2image-fitToWindow', 'false')
  zoomLevel.value = 1
  translateX.value = 0
  translateY.value = 0
}

const fitToWindow = () => {
  const container = previewContainer.value
  const wrapper = document.querySelector('.preview-wrapper')
  
  if (!container || !wrapper) return
  
  // 切换适应窗口状态
  const newFitToWindow = !isFitToWindow.value
  
  if (newFitToWindow) {
    // 获取容器和内容的尺寸
    const containerRect = container.getBoundingClientRect()
    const wrapperRect = wrapper.getBoundingClientRect()
    
    // 计算缩放比例，确保内容完全适应容器
    const scaleX = containerRect.width / wrapperRect.width
    const scaleY = containerRect.height / wrapperRect.height
    const scale = Math.min(scaleX, scaleY, 1) // 取较小值，且不超过1
    
    // 设置缩放级别
    zoomLevel.value = scale
    
    // 计算居中位置
    const scaledWidth = wrapperRect.width * scale
    const scaledHeight = wrapperRect.height * scale
    
    translateX.value = (containerRect.width - scaledWidth) / 2
    translateY.value = (containerRect.height - scaledHeight) / 2
  }
  
  // 更新状态并保存到localStorage
  isFitToWindow.value = newFitToWindow
  localStorage.setItem('md2image-fitToWindow', newFitToWindow.toString())
}

// 拖拽控制
const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragStart.value = { x: e.clientX - translateX.value, y: e.clientY - translateY.value }
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  translateX.value = e.clientX - dragStart.value.x
  translateY.value = e.clientY - dragStart.value.y
}

const endDrag = () => {
  isDragging.value = false
}

// 鼠标滚轮缩放
const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.max(0.05, Math.min(3, zoomLevel.value + delta))
  zoomLevel.value = newZoom
}

// 生成预览图片
const generateImage = async () => {
  if (!renderContainer.value || !processedHtml.value.trim()) {
    console.log('[MarkdownPoster] 无法生成图片：容器或内容为空')
    previewImage.value = ''
    return
  }

  isGenerating.value = true
  console.log('[MarkdownPoster] 开始生成图片...')
  
  try {
    // 应用自定义 CSS
    applyCustomCSS(renderContainer.value)
    console.log('[MarkdownPoster] 自定义 CSS 已应用')
    
    // 等待 DOM 更新和渲染
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 检查容器内容
    const contentElement = renderContainer.value.querySelector('.markdown-content')
    if (contentElement) {
      console.log('[MarkdownPoster] 容器内容:', contentElement.innerHTML.substring(0, 200) + '...')
      console.log('[MarkdownPoster] 容器尺寸:', {
        width: renderContainer.value.scrollWidth,
        height: renderContainer.value.scrollHeight,
        offsetWidth: renderContainer.value.offsetWidth,
        offsetHeight: renderContainer.value.offsetHeight
      })
    } else {
      console.error('[MarkdownPoster] 找不到 .markdown-content 元素')
      throw new Error('找不到内容元素，无法生成图片')
    }
    
    // 获取背景颜色
    const backgroundColor = props.settings?.imageConfig?.backgroundColor || '#ffffff'
    console.log('[MarkdownPoster] 背景颜色:', backgroundColor)
    
    // 使用 modern-screenshot 生成图片
    const dataUrl = await domToPng(renderContainer.value, {
      backgroundColor,
      width: renderContainer.value.scrollWidth || 800,
      height: renderContainer.value.scrollHeight || 600,
      style: {
        transform: 'none',
        position: 'static'
      }
    })
    
    console.log('[MarkdownPoster] 图片生成成功，数据长度:', dataUrl.length)
    previewImage.value = dataUrl
    showToast('图片生成成功！')
  } catch (error) {
    console.error('[MarkdownPoster] 生成图片失败:', error)
    showToast('生成图片失败')
  } finally {
    isGenerating.value = false
  }
}

// 下载图片
const downloadImage = () => {
  if (!previewImage.value) return
  
  const link = document.createElement('a')
  link.download = `markdown-poster-${Date.now()}.png`
  link.href = previewImage.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  showToast('图片下载成功！')
}

// 批量下载所有页面
const batchDownload = async () => {
  if (!props.content.trim()) {
    showToast('没有内容可下载')
    return
  }
  
  isBatchDownloading.value = true
  
  try {
    // 使用传入的所有页面内容，如果没有则回退到分割当前内容
    const pages = props.allPages && props.allPages.length > 0 
      ? props.allPages 
      : props.content.split(/<!--\s*PAGE_BREAK\s*-->/)
    const validPages = pages.filter(page => page.trim())
    
    if (validPages.length === 0) {
      showToast('没有有效页面可下载')
      return
    }
    
    showToast(`开始生成 ${validPages.length} 个页面...`)
    
    // 创建 ZIP 文件
    const zip = new JSZip()
    
    // 为每个页面生成图片并添加到 ZIP
    for (let i = 0; i < validPages.length; i++) {
      const pageContent = validPages[i].trim()
      if (!pageContent) continue
      
      // 渲染当前页面内容
      const pageHtml = renderMarkdown(pageContent)
      
      if (renderContainer.value) {
        // 更新容器内容
        const contentElement = renderContainer.value.querySelector('.markdown-content')
        if (contentElement) {
          contentElement.innerHTML = pageHtml
        } else {
          console.error('[MarkdownPoster] 批量下载：找不到 .markdown-content 元素')
          continue // 跳过这个页面
        }
        
        // 应用自定义样式
        applyCustomCSS(renderContainer.value)
        
        // 等待渲染完成
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // 生成图片
        const backgroundColor = props.settings?.imageConfig?.backgroundColor || '#ffffff'
        const dataUrl = await domToPng(renderContainer.value, {
          backgroundColor,
          width: renderContainer.value.scrollWidth || 800,
          height: renderContainer.value.scrollHeight || 600,
          style: {
            transform: 'none',
            position: 'static'
          }
        })
        
        // 将 dataUrl 转换为 blob 并添加到 ZIP
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        zip.file(`markdown-page-${i + 1}.png`, blob)
        
        showToast(`已生成第 ${i + 1}/${validPages.length} 页`)
      }
    }
    
    // 生成 ZIP 文件并下载
    showToast('正在打包文件...')
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.download = `markdown-images-${Date.now()}.zip`
    link.href = URL.createObjectURL(zipBlob)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理 URL 对象
    URL.revokeObjectURL(link.href)
    
    showToast(`成功下载 ${validPages.length} 个页面的压缩包！`)
    
    // 恢复原始内容显示
    if (renderContainer.value) {
      const contentElement = renderContainer.value.querySelector('.markdown-content')
      if (contentElement) {
        contentElement.innerHTML = processedHtml.value
        applyCustomCSS(renderContainer.value)
      } else {
        console.error('[MarkdownPoster] 恢复内容：找不到 .markdown-content 元素')
      }
    }
    
  } catch (error) {
    console.error('批量下载失败:', error)
    showToast('批量下载失败，请重试')
  } finally {
    isBatchDownloading.value = false
  }
}

// 复制图片到剪贴板
const copyToClipboard = async () => {
  if (!previewImage.value) return
  
  try {
    // 现代浏览器支持
    if (navigator.clipboard && window.ClipboardItem) {
      const response = await fetch(previewImage.value)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      showToast('图片已复制到剪贴板！')
    } else {
      // 降级方案：复制图片 URL
      await navigator.clipboard.writeText(previewImage.value)
      showToast('图片链接已复制到剪贴板！')
    }
  } catch (error) {
    console.error('复制失败:', error)
    showToast('复制失败，请重试')
  }
}

// 显示提示
const showToast = (message: string) => {
  toastMessage.value = message
  showToastMessage.value = true
  setTimeout(() => {
    showToastMessage.value = false
  }, 3000)
}

// 快速样式功能方法
const toggleStylePanel = () => {
  showStylePanel.value = !showStylePanel.value
}

const applyStyleScheme = (scheme: any) => {
  emit('applyStyleScheme', scheme)
  showStylePanel.value = false
  showToast(`已应用 ${scheme.name} 样式`)
}

const adjustFontSize = (delta: number) => {
  emit('adjustFontSize', delta)
  showToast(`字体大小${delta > 0 ? '增大' : '减小'}`)
}

const adjustLineHeight = (delta: number) => {
  emit('adjustLineHeight', delta)
  showToast(`行高${delta > 0 ? '增大' : '减小'}`)
}

const openSettings = () => {
  emit('openSettings')
  showStylePanel.value = false
}

// 监听内容变化，自动生成预览
watch(() => [props.content, props.settings], () => {
  if (props.content.trim()) {
    nextTick(() => {
      generateImage()
    })
  } else {
    previewImage.value = ''
  }
}, { immediate: true, deep: true })

// 监听设置变化，重新应用CSS样式
watch(() => props.settings?.cssConfig, () => {
  if (renderContainer.value) {
    applyCustomCSS(renderContainer.value)
    console.log('[MarkdownPoster] 设置变化，重新应用CSS样式')
  }
}, { deep: true })

// 监听页面变化，重置缩放
watch(() => props.content, () => {
  resetZoom()
})

// 暴露方法给父组件
defineExpose({
  generateImage,
  copyImage: copyToClipboard,
  downloadImage
})
</script>

<style scoped>
.markdown-poster {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
}

.toolbar-left {
  display: flex;
  gap: 0.5rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 批量下载按钮样式 */
.btn:has(.loading-spinner) {
  position: relative;
}

.btn .loading-spinner {
  margin-right: 0.25rem;
}



.preview-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 400px;
  height: 100%;
}

.preview-wrapper {
  transition: transform 0.1s ease;
  user-select: none;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.preview-image.fit-to-window {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.empty-state,
.loading-state {
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}

.render-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  z-index: 1000;
  opacity: 1;
  visibility: visible;
  width: auto;
  min-width: 800px;
  max-width: 1200px;
  min-height: 600px;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: visible;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.render-container.debug-visible {
  position: fixed;
  left: 20px;
  top: 120px;
  width: calc(100vw - 40px);
  height: calc(100vh - 140px);
  z-index: 9999;
  border: 3px solid #ff6b6b;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
  overflow: auto;
  max-height: none;
  min-width: auto;
  max-width: none;
}

.debug-info {
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px 8px 0 0;
  font-size: 12px;
  font-family: monospace;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.debug-label {
  font-weight: bold;
}

.debug-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  transition: background-color 0.2s;
}

.debug-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.debug-details {
  display: flex;
  gap: 16px;
  font-size: 11px;
  opacity: 0.9;
}

.render-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 0;
}



.markdown-content {
  position: relative;
  z-index: 1;
  white-space: pre-wrap;
}

.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: #10b981;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>