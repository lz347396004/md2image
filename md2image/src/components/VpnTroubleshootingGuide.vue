<script setup lang="ts">
import { ref } from 'vue'

// 控制指南显示状态
const isExpanded = ref(false)

// 故障排除步骤
const troubleshootingSteps = [
  {
    title: '检查VPN连接状态',
    description: '确认VPN已正确连接且状态稳定',
    actions: [
      '查看VPN客户端连接状态',
      '尝试断开并重新连接VPN',
      '检查VPN服务器是否响应正常'
    ]
  },
  {
    title: '优化VPN设置',
    description: '调整VPN配置以提高连接稳定性',
    actions: [
      '选择延迟较低的VPN服务器',
      '尝试不同的VPN协议（如OpenVPN、WireGuard）',
      '关闭VPN的广告拦截或防火墙功能',
      '调整VPN的MTU设置'
    ]
  },
  {
    title: '网络连接测试',
    description: '验证网络连接的稳定性和速度',
    actions: [
      '使用ping命令测试网络延迟',
      '进行网速测试确认带宽充足',
      '检查DNS解析是否正常',
      '尝试访问其他网站验证连接'
    ]
  },
  {
    title: '应用程序设置',
    description: '调整应用设置以适应VPN环境',
    actions: [
      '增加API请求超时时间',
      '启用请求重试机制',
      '检查代理设置是否正确',
      '清除应用缓存和临时文件'
    ]
  }
]

// VPN使用建议
const vpnTips = [
  {
    icon: '🚀',
    title: '选择合适的服务器',
    description: '选择地理位置较近、延迟较低的VPN服务器'
  },
  {
    icon: '⚡',
    title: '使用高速协议',
    description: '优先使用WireGuard或IKEv2等现代高速协议'
  },
  {
    icon: '🔧',
    title: '调整连接设置',
    description: '根据网络环境调整MTU大小和加密级别'
  },
  {
    icon: '📊',
    title: '监控连接质量',
    description: '定期检查连接速度和稳定性，及时切换服务器'
  },
  {
    icon: '🛡️',
    title: '避免过度保护',
    description: '在开发环境中可适当降低安全级别以提高速度'
  },
  {
    icon: '🔄',
    title: '备用连接方案',
    description: '准备多个VPN服务或直连方案作为备选'
  }
]
</script>

<template>
  <div class="bg-surface border border-border rounded-lg p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-text flex items-center gap-2">
        🛠️ VPN故障排除指南
      </h3>
      <button 
        @click="isExpanded = !isExpanded"
        class="text-xs px-2 py-1 border border-border rounded hover:bg-surface/80 transition-colors"
      >
        {{ isExpanded ? '收起' : '展开' }}
      </button>
    </div>
    
    <div v-if="isExpanded" class="space-y-6">
      <!-- VPN使用建议 -->
      <div>
        <h4 class="text-sm font-medium text-text mb-3 flex items-center gap-2">
          💡 VPN使用建议
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div 
            v-for="tip in vpnTips" 
            :key="tip.title"
            class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <div class="flex items-start gap-2">
              <span class="text-lg">{{ tip.icon }}</span>
              <div>
                <div class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  {{ tip.title }}
                </div>
                <div class="text-xs text-blue-700 dark:text-blue-300">
                  {{ tip.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 故障排除步骤 -->
      <div>
        <h4 class="text-sm font-medium text-text mb-3 flex items-center gap-2">
          🔧 故障排除步骤
        </h4>
        <div class="space-y-4">
          <div 
            v-for="(step, index) in troubleshootingSteps" 
            :key="step.title"
            class="border border-border rounded-lg p-4"
          >
            <div class="flex items-start gap-3 mb-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                {{ index + 1 }}
              </div>
              <div>
                <h5 class="text-sm font-medium text-text mb-1">
                  {{ step.title }}
                </h5>
                <p class="text-xs text-muted mb-2">
                  {{ step.description }}
                </p>
              </div>
            </div>
            
            <div class="ml-9">
              <ul class="space-y-1">
                <li 
                  v-for="action in step.actions" 
                  :key="action"
                  class="text-xs text-text flex items-start gap-2"
                >
                  <span class="text-green-500 mt-0.5">•</span>
                  <span>{{ action }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 常见问题解答 -->
      <div>
        <h4 class="text-sm font-medium text-text mb-3 flex items-center gap-2">
          ❓ 常见问题解答
        </h4>
        <div class="space-y-3">
          <details class="border border-border rounded-lg">
            <summary class="p-3 cursor-pointer hover:bg-surface/50 text-sm font-medium">
              为什么使用VPN后API调用变慢？
            </summary>
            <div class="p-3 pt-0 text-xs text-muted">
              VPN会增加网络延迟，因为数据需要经过VPN服务器中转。选择地理位置较近的服务器可以减少延迟。
            </div>
          </details>
          
          <details class="border border-border rounded-lg">
            <summary class="p-3 cursor-pointer hover:bg-surface/50 text-sm font-medium">
              如何判断是VPN导致的连接问题？
            </summary>
            <div class="p-3 pt-0 text-xs text-muted">
              可以暂时关闭VPN进行测试，如果问题消失则说明是VPN相关问题。也可以尝试切换不同的VPN服务器。
            </div>
          </details>
          
          <details class="border border-border rounded-lg">
            <summary class="p-3 cursor-pointer hover:bg-surface/50 text-sm font-medium">
              哪些VPN协议性能更好？
            </summary>
            <div class="p-3 pt-0 text-xs text-muted">
              WireGuard和IKEv2通常提供更好的性能和稳定性。避免使用较老的PPTP协议。
            </div>
          </details>
          
          <details class="border border-border rounded-lg">
            <summary class="p-3 cursor-pointer hover:bg-surface/50 text-sm font-medium">
              如何优化VPN的MTU设置？
            </summary>
            <div class="p-3 pt-0 text-xs text-muted">
              可以尝试将MTU设置为1200-1400之间的值。过大的MTU可能导致数据包分片，影响性能。
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>