<template>
  <div class="page-navigation">
    <!-- 页面导航条 -->
    <div class="nav-bar">
      <!-- 左侧：上一页按钮 -->
      <button 
        @click="$emit('prev-page')"
        :disabled="currentPage === 0"
        class="nav-button prev-button"
        title="上一页"
      >
        <ChevronLeft class="w-4 h-4" />
        <span class="hidden sm:inline ml-1">上一页</span>
      </button>
      
      <!-- 中间：页码指示器 -->
      <div class="page-indicators">
        <template v-for="(page, index) in visiblePages" :key="index">
          <!-- 页码按钮 -->
          <button 
            v-if="typeof page === 'number'"
            @click="$emit('go-to-page', page)"
            :class="[
              'page-indicator',
              { 'active': page === currentPage }
            ]"
          >
            {{ page + 1 }}
          </button>
          
          <!-- 省略号 -->
          <span v-else class="ellipsis">...</span>
        </template>
      </div>
      
      <!-- 右侧：下一页按钮 -->
      <button 
        @click="$emit('next-page')"
        :disabled="currentPage >= totalPages - 1"
        class="nav-button next-button"
        title="下一页"
      >
        <span class="hidden sm:inline mr-1">下一页</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
    
    <!-- 页面信息 -->
    <div class="page-info">
      <span class="text-xs lg:text-sm text-muted">
        第 {{ currentPage + 1 }} 页，共 {{ totalPages }} 页
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

interface Emits {
  (e: 'prev-page'): void
  (e: 'next-page'): void
  (e: 'go-to-page', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
})

defineEmits<Emits>()

// 计算可见的页码
const visiblePages = computed(() => {
  const { currentPage, totalPages, maxVisiblePages } = props
  
  if (totalPages <= maxVisiblePages) {
    // 如果总页数小于等于最大可见页数，显示所有页码
    return Array.from({ length: totalPages }, (_, i) => i)
  }
  
  const pages: (number | string)[] = []
  const halfVisible = Math.floor(maxVisiblePages / 2)
  
  // 计算起始和结束页码
  let start = Math.max(0, currentPage - halfVisible)
  let end = Math.min(totalPages - 1, currentPage + halfVisible)
  
  // 调整范围以确保显示足够的页码
  if (end - start + 1 < maxVisiblePages) {
    if (start === 0) {
      end = Math.min(totalPages - 1, start + maxVisiblePages - 1)
    } else {
      start = Math.max(0, end - maxVisiblePages + 1)
    }
  }
  
  // 添加第一页和省略号
  if (start > 0) {
    pages.push(0)
    if (start > 1) {
      pages.push('...')
    }
  }
  
  // 添加中间页码
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  // 添加省略号和最后一页
  if (end < totalPages - 1) {
    if (end < totalPages - 2) {
      pages.push('...')
    }
    pages.push(totalPages - 1)
  }
  
  return pages
})
</script>

<style scoped>
.page-navigation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
}

@media (min-width: 768px) {
  .page-navigation {
    gap: 12px;
    padding: 16px;
  }
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 768px) {
  .nav-bar {
    gap: 12px;
  }
}

.nav-button {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

@media (min-width: 768px) {
  .nav-button {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 15px;
  }
}

.nav-button:hover:not(:disabled) {
  background: var(--color-text);
  color: var(--color-background);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-surface);
  color: var(--color-muted);
}

.page-indicators {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (min-width: 768px) {
  .page-indicators {
    gap: 6px;
  }
}

.page-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

@media (min-width: 768px) {
  .page-indicator {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    font-size: 14px;
  }
}

.page-indicator:hover {
  background: var(--color-text);
  color: var(--color-background);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-indicator.active {
  background: var(--color-text);
  color: var(--color-background);
  border-color: var(--color-text);
  font-weight: 600;
}

.ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 500;
}

@media (min-width: 768px) {
  .ellipsis {
    width: 36px;
    height: 36px;
    font-size: 15px;
  }
}

.page-info {
  text-align: center;
}

.page-info .text-muted {
  color: var(--color-muted);
}
</style>