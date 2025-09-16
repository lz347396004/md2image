<template>
  <div class="page-swiper-container h-full">
    <!-- Swiper 容器 -->
    <div ref="swiperContainer" class="swiper h-full">
      <div class="swiper-wrapper">
        <div 
          v-for="(page, index) in pages" 
          :key="index" 
          class="swiper-slide"
        >
          <div class="h-full overflow-y-auto p-6">
            <div class="prose prose-lg max-w-none">
              <div v-html="renderMarkdown(page)" class="markdown-content"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页指示器 -->
      <div class="swiper-pagination"></div>
      
      <!-- 导航按钮 -->
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
    
    <!-- 页面信息 -->
    <div class="absolute top-4 right-4 bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-muted border border-border">
      {{ currentSlide + 1 }} / {{ pages.length }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Swiper } from 'swiper'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import { renderMarkdown } from '@/utils/markdown'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// 注册 Swiper 模块
Swiper.use([Navigation, Pagination, Keyboard])

interface Props {
  pages: string[]
  initialSlide?: number
}

interface Emits {
  (e: 'slideChange', index: number): void
}

const props = withDefaults(defineProps<Props>(), {
  initialSlide: 0
})

const emit = defineEmits<Emits>()

const swiperContainer = ref<HTMLElement>()
const currentSlide = ref(0)
let swiperInstance: Swiper | null = null

// 初始化 Swiper
const initSwiper = async () => {
  if (!swiperContainer.value || props.pages.length === 0) return
  
  await nextTick()
  
  swiperInstance = new Swiper(swiperContainer.value, {
    direction: 'horizontal',
    loop: false,
    initialSlide: props.initialSlide,
    
    // 分页器
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      bulletClass: 'swiper-pagination-bullet custom-bullet',
      bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active'
    },
    
    // 导航按钮
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    
    // 键盘控制
    keyboard: {
      enabled: true,
      onlyInViewport: true
    },
    
    // 鼠标滚轮
    mousewheel: {
      enabled: true,
      forceToAxis: true
    },
    
    // 触摸滑动
    touchRatio: 1,
    touchAngle: 45,
    
    // 事件监听
    on: {
      slideChange: (swiper) => {
        currentSlide.value = swiper.activeIndex
        emit('slideChange', swiper.activeIndex)
      }
    }
  })
}

// 销毁 Swiper
const destroySwiper = () => {
  if (swiperInstance) {
    swiperInstance.destroy(true, true)
    swiperInstance = null
  }
}

// 更新 Swiper
const updateSwiper = async () => {
  if (swiperInstance) {
    await nextTick()
    swiperInstance.update()
    swiperInstance.updateSlides()
    swiperInstance.updateProgress()
    swiperInstance.updateSlidesClasses()
  }
}

// 跳转到指定页面
const slideTo = (index: number) => {
  if (swiperInstance && index >= 0 && index < props.pages.length) {
    swiperInstance.slideTo(index)
  }
}

// 监听页面变化
watch(() => props.pages, async () => {
  if (props.pages.length === 0) {
    destroySwiper()
    return
  }
  
  if (swiperInstance) {
    await updateSwiper()
  } else {
    await initSwiper()
  }
}, { deep: true })

// 监听初始页面变化
watch(() => props.initialSlide, (newSlide) => {
  slideTo(newSlide)
})

onMounted(() => {
  if (props.pages.length > 0) {
    initSwiper()
  }
})

onUnmounted(() => {
  destroySwiper()
})

// 暴露方法给父组件
defineExpose({
  slideTo,
  getCurrentSlide: () => currentSlide.value,
  getSwiperInstance: () => swiperInstance
})
</script>

<style scoped>
.page-swiper-container {
  position: relative;
}

/* Swiper 自定义样式 */
:deep(.swiper) {
  width: 100%;
  height: 100%;
}

:deep(.swiper-slide) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  padding: 12px;
}

@media (min-width: 768px) {
  :deep(.swiper-slide) {
    border-radius: 12px;
    padding: 20px;
  }
}

/* 分页器样式 */
:deep(.swiper-pagination) {
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  display: flex;
  justify-content: center;
  gap: 6px;
}

@media (min-width: 768px) {
  :deep(.swiper-pagination) {
    bottom: 16px;
    gap: 8px;
  }
}

:deep(.custom-bullet) {
  width: 6px;
  height: 6px;
  background: var(--color-muted);
  border-radius: 50%;
  opacity: 0.5;
  transition: all 0.3s ease;
  cursor: pointer;
}

@media (min-width: 768px) {
  :deep(.custom-bullet) {
    width: 8px;
    height: 8px;
  }
}

:deep(.custom-bullet-active) {
  background: var(--color-primary);
  opacity: 1;
  transform: scale(1.2);
}

/* 导航按钮样式 */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  margin-top: -16px;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  :deep(.swiper-button-prev),
  :deep(.swiper-button-next) {
    width: 40px;
    height: 40px;
    margin-top: -20px;
  }
}

:deep(.swiper-button-prev:hover),
:deep(.swiper-button-next:hover) {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

:deep(.swiper-button-prev::after),
:deep(.swiper-button-next::after) {
  font-size: 14px;
  font-weight: bold;
}

@media (min-width: 768px) {
  :deep(.swiper-button-prev::after),
  :deep(.swiper-button-next::after) {
    font-size: 16px;
  }
}

:deep(.swiper-button-prev) {
  left: 8px;
}

:deep(.swiper-button-next) {
  right: 8px;
}

@media (min-width: 768px) {
  :deep(.swiper-button-prev) {
    left: 16px;
  }
  
  :deep(.swiper-button-next) {
    right: 16px;
  }
}

/* 禁用状态 */
:deep(.swiper-button-disabled) {
  opacity: 0.3;
  cursor: not-allowed;
}

:deep(.swiper-button-disabled:hover) {
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}

/* Markdown 内容样式 */
.markdown-content {
  font-family: var(--font-sans);
  line-height: 1.5;
  font-size: 14px;
}

@media (min-width: 768px) {
  .markdown-content {
    line-height: 1.7;
    font-size: 16px;
  }
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-family: var(--font-serif);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

@media (min-width: 768px) {
  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
}

.markdown-content h1 {
  font-size: 1.75rem;
}

@media (min-width: 768px) {
  .markdown-content h1 {
    font-size: 2.5rem;
  }
}

.markdown-content h2 {
  font-size: 1.5rem;
}

@media (min-width: 768px) {
  .markdown-content h2 {
    font-size: 2rem;
  }
}

.markdown-content h3 {
  font-size: 1.25rem;
}

@media (min-width: 768px) {
  .markdown-content h3 {
    font-size: 1.5rem;
  }
}

.markdown-content p {
  margin-bottom: 0.75rem;
}

@media (min-width: 768px) {
  .markdown-content p {
    margin-bottom: 1rem;
  }
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 0.75rem 0;
}

@media (min-width: 768px) {
  .markdown-content img {
    border-radius: 8px;
    margin: 1rem 0;
  }
}

.markdown-content table {
  font-size: 0.8rem;
}

@media (min-width: 768px) {
  .markdown-content table {
    font-size: 0.9rem;
  }
}

.markdown-content pre {
  font-size: 0.8rem;
  line-height: 1.4;
}

@media (min-width: 768px) {
  .markdown-content pre {
    font-size: 0.875rem;
    line-height: 1.5;
  }
}
</style>