<template>
  <div class="md2poster-container" :style="cardStyles">
    <div class="md2poster-content" :style="contentStyles">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CSSConfig {
  fontFamily?: string
  fontSize?: number
  lineHeight?: number
  textColor?: string
}

interface ImageConfig {
  backgroundColor?: string
  backgroundImageType?: string
  backgroundImage?: string
  backgroundImageOpacity?: number
  backgroundImageSize?: string
}

interface Props {
  cssConfig?: CSSConfig
  imageConfig?: ImageConfig
}

const props = withDefaults(defineProps<Props>(), {
  cssConfig: () => ({}),
  imageConfig: () => ({})
})

// 卡片容器样式
const cardStyles = computed(() => {
  const styles: Record<string, string> = {
    background: getBackgroundStyle(),
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.06)'
  }
  
  return styles
})

// 获取背景样式
const getBackgroundStyle = () => {
  const imageConfig = props.imageConfig
  if (!imageConfig) {
    return 'rgba(255, 255, 255, 0.95)'
  }

  const { backgroundImageType, backgroundImage, backgroundColor, backgroundImageOpacity, backgroundImageSize } = imageConfig

  // 处理背景图片
  if (backgroundImage && backgroundImageType !== 'none') {
    if (backgroundImageType === 'preset' || backgroundImageType === 'custom') {
      // 检查是否为渐变背景（支持所有类型的渐变）
      if (backgroundImage.includes('linear-gradient') || 
          backgroundImage.includes('radial-gradient') || 
          backgroundImage.includes('conic-gradient') || 
          backgroundImage.includes('gradient')) {
        // CSS渐变背景 - 直接返回渐变样式
        return backgroundImage
      } else {
        // 普通图片背景
        const opacity = backgroundImageOpacity !== undefined ? backgroundImageOpacity : 0.8
        const size = backgroundImageSize || 'cover'
        const overlayColor = `rgba(0,0,0,${1-opacity})`
        return `linear-gradient(${overlayColor}, ${overlayColor}), url("${backgroundImage}") center/${size} no-repeat`
      }
    } else if (backgroundImageType === 'gradient' && backgroundImage) {
      // 直接使用CSS渐变背景
      return backgroundImage
    }
  } else {
    // 处理背景颜色（只有在没有背景图片时才应用）
    if (backgroundImageType === 'color' && backgroundColor) {
      return backgroundColor
    } else if (backgroundColor) {
      return backgroundColor
    }
  }
  
  return 'rgba(255, 255, 255, 0.95)'
}

// 卡片内容样式
const contentStyles = computed(() => {
  const styles: Record<string, string> = {
    padding: '48px',
    color: '#1a1a1a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px',
    lineHeight: '1.75',
    fontWeight: '400',
    letterSpacing: '0.01em'
  }
  
  if (props.cssConfig?.fontFamily) {
    styles.fontFamily = props.cssConfig.fontFamily
  }
  
  if (props.cssConfig?.fontSize !== undefined) {
    styles.fontSize = `${props.cssConfig.fontSize}px`
  }
  
  if (props.cssConfig?.lineHeight !== undefined) {
    styles.lineHeight = props.cssConfig.lineHeight.toString()
  }
  
  if (props.cssConfig?.textColor) {
    styles.color = props.cssConfig.textColor
  }
  
  return styles
})
</script>

<style scoped>
.md2poster-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-height: 400px;
}

.md2poster-content {
  position: relative;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 标题样式 - 参考GitHub项目的层次设计 */
.md2poster-content :deep(h1),
.md2poster-content :deep(h2),
.md2poster-content :deep(h3),
.md2poster-content :deep(h4),
.md2poster-content :deep(h5),
.md2poster-content :deep(h6) {
  font-weight: 600;
  line-height: 1.25;
  margin-top: 24px;
  margin-bottom: 16px;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.md2poster-content :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e1e4e8;
}

.md2poster-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 32px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e1e4e8;
}

.md2poster-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 12px;
}

.md2poster-content :deep(h4) {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 10px;
}

.md2poster-content :deep(h5) {
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 8px;
}

.md2poster-content :deep(h6) {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 8px;
  color: #6a737d;
}

/* 段落和文本样式 */
.md2poster-content :deep(p) {
  margin-bottom: 16px;
  line-height: 1.75;
  color: #24292e;
}

.md2poster-content :deep(ul),
.md2poster-content :deep(ol) {
  margin-bottom: 16px;
  padding-left: 24px;
}

.md2poster-content :deep(li) {
  margin-bottom: 4px;
  line-height: 1.75;
  color: #24292e;
}

.md2poster-content :deep(li + li) {
  margin-top: 4px;
}

.md2poster-content :deep(strong) {
  font-weight: 600;
  color: #1a1a1a;
}

.md2poster-content :deep(em) {
  font-style: italic;
  color: #24292e;
}

.md2poster-content :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.md2poster-content :deep(a:hover) {
  text-decoration: underline;
}

/* 代码样式 */
.md2poster-content :deep(code) {
  background: rgba(175, 184, 193, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 85%;
  font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
  color: #24292e;
}

.md2poster-content :deep(pre) {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  font-size: 85%;
  line-height: 1.45;
  border: 1px solid #e1e4e8;
}

.md2poster-content :deep(pre code) {
  background: transparent;
  padding: 0;
  border: none;
  font-size: 100%;
  color: #24292e;
}

/* 分隔符样式 - 简单灰色横线 */
.md2poster-content :deep(hr) {
  height: 1px;
  padding: 0;
  margin: 20px 0;
  background-color: #ccc;
  border: none;
  display: block;
  width: 100%;
}

/* 引用块样式 - GitHub风格 */
.md2poster-content :deep(blockquote) {
  margin: 16px 0;
  padding: 0 16px;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  background: transparent;
}

.md2poster-content :deep(blockquote > :first-child) {
  margin-top: 0;
}

.md2poster-content :deep(blockquote > :last-child) {
  margin-bottom: 0;
}

/* 表格样式 - GitHub风格 */
.md2poster-content :deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  margin: 16px 0;
  display: block;
  width: 100%;
  overflow: auto;
}

.md2poster-content :deep(table tr) {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.md2poster-content :deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.md2poster-content :deep(table th),
.md2poster-content :deep(table td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
  text-align: left;
}

.md2poster-content :deep(table th) {
  font-weight: 600;
  background-color: #f6f8fa;
}

/* 图片样式 */
.md2poster-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 16px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

/* 列表项目符号样式 */
.md2poster-content :deep(ul) {
  list-style-type: disc;
}

.md2poster-content :deep(ol) {
  list-style-type: decimal;
}

.md2poster-content :deep(ul ul),
.md2poster-content :deep(ol ul) {
  list-style-type: circle;
}

.md2poster-content :deep(ul ul ul),
.md2poster-content :deep(ol ul ul) {
  list-style-type: square;
}
</style>