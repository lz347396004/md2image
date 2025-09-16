<template>
  <header class="h-16 lg:h-20 bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
    <div class="h-full px-4 lg:px-6 flex items-center justify-between">
      <!-- 左侧：品牌和导航 -->
      <div class="flex items-center space-x-4 lg:space-x-8">
        <!-- 品牌 -->
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 lg:w-8 lg:h-8 bg-text rounded-full flex items-center justify-center">
            <span class="text-background font-bold text-xs lg:text-sm">M</span>
          </div>
          <span class="font-serif text-lg lg:text-xl font-semibold text-text hidden sm:block">MD2Image</span>
        </div>
        
        <!-- 页面导航 -->
        <nav class="flex items-center space-x-1">
          <button 
            @click="$emit('prevPage')"
            :disabled="currentPage === 0"
            class="p-1.5 lg:p-2 rounded-lg hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft class="w-3 h-3 lg:w-4 lg:h-4 text-text" />
          </button>
          
          <span class="px-2 lg:px-3 py-1 text-xs lg:text-sm text-muted">
            {{ currentPage + 1 }} / {{ totalPages }}
          </span>
          
          <button 
            @click="$emit('nextPage')"
            :disabled="currentPage >= totalPages - 1"
            class="p-1.5 lg:p-2 rounded-lg hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight class="w-3 h-3 lg:w-4 lg:h-4 text-text" />
          </button>
        </nav>
      </div>
      
      <!-- 右侧：功能按钮 -->
      <div class="flex items-center space-x-1 lg:space-x-2">

        
        <!-- 调试模式按钮 -->
        <button 
          @click="$emit('toggleDebug')"
          class="px-2 py-1.5 lg:px-4 lg:py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-sm hover:shadow-md"
          :class="debugMode ? 'bg-text text-background hover:bg-text/90' : 'bg-text/10 text-text hover:bg-text/20'"
        >
          <Bug class="w-3 h-3 lg:w-4 lg:h-4" />
          <span class="font-medium text-xs lg:text-sm hidden sm:inline">{{ debugMode ? '关闭调试' : '调试模式' }}</span>
        </button>
        
        <!-- 生成图片按钮已删除 -->
        

        
        <!-- 主题切换按钮 -->
        <button 
          @click="$emit('toggleTheme')"
          class="p-1.5 lg:p-2 rounded-lg bg-text/10 text-text hover:bg-text/20 transition-all duration-200 shadow-sm hover:shadow-md"
          :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
        >
          <Sun v-if="isDark" class="w-3 h-3 lg:w-4 lg:h-4" />
          <Moon v-else class="w-3 h-3 lg:w-4 lg:h-4" />
        </button>
        
        <!-- 错误日志按钮 -->
        <button 
          @click="$emit('showErrorLogs')"
          class="p-1.5 lg:p-2 rounded-lg bg-text/10 text-text hover:bg-text/20 transition-all duration-200 shadow-sm hover:shadow-md"
          title="错误日志"
        >
          <AlertCircle class="w-3 h-3 lg:w-4 lg:h-4" />
        </button>
        
        <!-- 设置按钮 -->
        <button 
          @click="$emit('settings')"
          class="p-1.5 lg:p-2 rounded-lg bg-text/10 text-text hover:bg-text/20 transition-all duration-200 shadow-sm hover:shadow-md"
          title="设置"
        >
          <Settings class="w-3 h-3 lg:w-4 lg:h-4" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { 
  ChevronLeft, 
  ChevronRight, 
  Image, 
  Settings, 
  Sun, 
  Moon,
  AlertCircle,
  Bug
} from 'lucide-vue-next'

interface Props {
  currentPage: number
  totalPages: number
  isDark: boolean
  debugMode: boolean
  currentSettings?: any
}

interface Emits {
  (e: 'prevPage'): void
  (e: 'nextPage'): void
  (e: 'generateImage'): void
  (e: 'settings'): void
  (e: 'toggleTheme'): void
  (e: 'showErrorLogs'): void
  (e: 'toggleDebug'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.toolbar {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 按钮悬停效果 */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* 禁用状态样式 */
button:disabled {
  transform: none;
}

/* 主要按钮样式 */
button.bg-primary {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button.bg-primary:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 次要按钮样式 */
button.bg-surface {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

button.bg-surface:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>