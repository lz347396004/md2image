<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center space-x-2">
          <AlertTriangle class="w-5 h-5 text-red-600" />
          <h2 class="text-xl font-semibold text-gray-900">错误日志</h2>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="clearLogs"
            class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            清空日志
          </button>
          <button 
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      <!-- 内容 -->
      <div class="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
        <div v-if="errorLogs.length === 0" class="text-center py-12">
          <CheckCircle class="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无错误日志</h3>
          <p class="text-gray-500">系统运行正常，没有记录到错误信息。</p>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="(log, index) in errorLogs" 
            :key="index"
            class="border border-red-200 rounded-lg p-4 bg-red-50"
          >
            <!-- 错误头部信息 -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-2">
                <div class="flex items-center space-x-2">
                  <span :class="getErrorTypeClass(log.type)" class="px-2 py-1 text-xs font-medium rounded">
                    {{ getErrorTypeLabel(log.type) }}
                  </span>
                  <span class="text-sm text-gray-600">{{ formatTime(log.timestamp) }}</span>
                </div>
              </div>
              <button 
                @click="toggleLogDetails(index)"
                class="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>{{ expandedLogs.has(index) ? '收起' : '详情' }}</span>
                <ChevronDown :class="{ 'rotate-180': expandedLogs.has(index) }" class="w-4 h-4 transition-transform" />
              </button>
            </div>
            
            <!-- 错误消息 -->
            <div class="mb-2">
              <h4 class="font-medium text-red-800 mb-1">错误信息</h4>
              <p class="text-sm text-red-700 bg-red-100 p-2 rounded font-mono">{{ log.message }}</p>
            </div>
            
            <!-- 详细信息 -->
            <div v-if="expandedLogs.has(index)" class="space-y-3">
              <!-- 上下文信息 -->
              <div v-if="log.context">
                <h5 class="font-medium text-gray-800 mb-1">上下文信息</h5>
                <div class="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                  <div v-for="(value, key) in log.context" :key="key" class="mb-1">
                    <span class="font-medium">{{ key }}:</span> {{ value }}
                  </div>
                </div>
              </div>
              
              <!-- 堆栈跟踪 -->
              <div v-if="log.stack">
                <h5 class="font-medium text-gray-800 mb-1">堆栈跟踪</h5>
                <pre class="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">{{ log.stack }}</pre>
              </div>
              
              <!-- 解决建议 -->
              <div v-if="getSuggestion(log.type)">
                <h5 class="font-medium text-blue-800 mb-1">解决建议</h5>
                <div class="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                  {{ getSuggestion(log.type) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-vue-next'
import type { ErrorLog } from '@/types'

interface Props {
  visible: boolean
  errorLogs: ErrorLog[]
}

defineProps<Props>()
defineEmits<{
  close: []
  clearLogs: []
}>()

const expandedLogs = ref(new Set<number>())

const toggleLogDetails = (index: number) => {
  if (expandedLogs.value.has(index)) {
    expandedLogs.value.delete(index)
  } else {
    expandedLogs.value.add(index)
  }
}

const clearLogs = () => {
  if (confirm('确定要清空所有错误日志吗？')) {
    expandedLogs.value.clear()
    // 通过emit通知父组件清空日志
    // 这里需要父组件处理实际的清空逻辑
  }
}

const getErrorTypeClass = (type: string) => {
  const classes = {
    'AI_ENHANCE_FAILED': 'bg-red-100 text-red-800',
    'API_ERROR': 'bg-orange-100 text-orange-800',
    'NETWORK_ERROR': 'bg-yellow-100 text-yellow-800',
    'VALIDATION_ERROR': 'bg-purple-100 text-purple-800',
    'UNKNOWN_ERROR': 'bg-gray-100 text-gray-800'
  }
  return classes[type as keyof typeof classes] || classes.UNKNOWN_ERROR
}

const getErrorTypeLabel = (type: string) => {
  const labels = {
    'AI_ENHANCE_FAILED': 'AI增强失败',
    'API_ERROR': 'API错误',
    'NETWORK_ERROR': '网络错误',
    'VALIDATION_ERROR': '验证错误',
    'UNKNOWN_ERROR': '未知错误'
  }
  return labels[type as keyof typeof labels] || '未知错误'
}

const getSuggestion = (type: string) => {
  const suggestions = {
    'AI_ENHANCE_FAILED': '请检查AI配置是否正确，确保API密钥有效且网络连接正常。',
    'API_ERROR': '请检查API地址和密钥配置，确保服务正常运行。',
    'NETWORK_ERROR': '请检查网络连接，确保能够访问相关服务。',
    'VALIDATION_ERROR': '请检查输入数据格式是否正确。',
    'UNKNOWN_ERROR': '请尝试刷新页面或联系技术支持。'
  }
  return suggestions[type as keyof typeof suggestions]
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>