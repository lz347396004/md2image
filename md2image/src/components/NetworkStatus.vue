<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { checkNetworkStatus, type NetworkStatus } from '@/utils/api'

// 网络状态
const networkStatus = ref<NetworkStatus>({
  isOnline: true,
  hasVpnIssues: false
})

const isChecking = ref(false)
const lastChecked = ref<Date | null>(null)

// 检查网络状态
const checkStatus = async () => {
  if (isChecking.value) return
  
  isChecking.value = true
  try {
    networkStatus.value = await checkNetworkStatus()
    lastChecked.value = new Date()
  } catch (error) {
    console.error('网络状态检查失败:', error)
  } finally {
    isChecking.value = false
  }
}

// 获取状态显示文本
const getStatusText = () => {
  if (!networkStatus.value.isOnline) {
    return '离线'
  }
  
  if (networkStatus.value.hasVpnIssues) {
    return 'VPN问题'
  }
  
  return '正常'
}

// 获取状态颜色
const getStatusColor = () => {
  if (!networkStatus.value.isOnline) {
    return 'text-red-500'
  }
  
  if (networkStatus.value.hasVpnIssues) {
    return 'text-yellow-500'
  }
  
  return 'text-green-500'
}

// 获取错误类型描述
const getErrorTypeDescription = (errorType?: string) => {
  switch (errorType) {
    case 'timeout':
      return '连接超时'
    case 'connection_refused':
      return '连接被拒绝'
    case 'dns_error':
      return 'DNS解析错误'
    case 'vpn_blocking':
      return 'VPN阻止连接'
    default:
      return '未知错误'
  }
}

// 自动检查间隔
let checkInterval: number | null = null

// 组件挂载时开始检查
onMounted(() => {
  checkStatus()
  // 每30秒自动检查一次
  checkInterval = window.setInterval(checkStatus, 30000)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>

<template>
  <div class="bg-surface border border-border rounded-lg p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-text">网络状态</h3>
      <button 
        @click="checkStatus"
        :disabled="isChecking"
        class="text-xs px-2 py-1 border border-border rounded hover:bg-surface/80 transition-colors disabled:opacity-50"
      >
        <span v-if="isChecking">检查中...</span>
        <span v-else>刷新</span>
      </button>
    </div>
    
    <div class="space-y-2 text-sm">
      <!-- 连接状态 -->
      <div class="flex items-center justify-between">
        <span class="text-muted">连接状态:</span>
        <span :class="getStatusColor()" class="font-medium">
          {{ getStatusText() }}
        </span>
      </div>
      
      <!-- 延迟信息 -->
      <div v-if="networkStatus.latency" class="flex items-center justify-between">
        <span class="text-muted">响应延迟:</span>
        <span class="text-text">
          {{ networkStatus.latency }}ms
          <span v-if="networkStatus.latency > 5000" class="text-yellow-500 ml-1">
            (较慢)
          </span>
        </span>
      </div>
      
      <!-- 错误类型 -->
      <div v-if="networkStatus.errorType" class="flex items-center justify-between">
        <span class="text-muted">错误类型:</span>
        <span class="text-red-500">
          {{ getErrorTypeDescription(networkStatus.errorType) }}
        </span>
      </div>
      
      <!-- VPN状态提示 -->
      <div v-if="networkStatus.hasVpnIssues" class="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
        <div class="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
          ⚠️ VPN相关问题
        </div>
        <div class="text-yellow-700 dark:text-yellow-300">
          检测到可能的VPN连接问题，这可能影响API调用性能
        </div>
      </div>
      
      <!-- 离线状态提示 -->
      <div v-if="!networkStatus.isOnline" class="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
        <div class="text-red-800 dark:text-red-200 font-medium mb-1">
          🔴 网络连接异常
        </div>
        <div class="text-red-700 dark:text-red-300">
          无法连接到服务器，请检查网络连接
        </div>
      </div>
      
      <!-- 最后检查时间 -->
      <div v-if="lastChecked" class="flex items-center justify-between text-xs text-muted pt-2 border-t border-border">
        <span>最后检查:</span>
        <span>{{ lastChecked.toLocaleTimeString() }}</span>
      </div>
    </div>
  </div>
</template>