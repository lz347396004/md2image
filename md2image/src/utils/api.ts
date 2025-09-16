// API 服务工具

const API_BASE_URL = 'http://localhost:8000'

// VPN和网络相关的超时设置
const NETWORK_TIMEOUT = 30000 // 30秒，适应VPN环境
const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000 // 2秒

export interface AIConfig {
  baseUrl?: string;
  apiKey?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  pageBreakPrompt?: string;
  cssStylePrompt?: string;
}

export interface EnhanceRequest {
  content: string
  task_type: 'segment_text' | 'auto_css_style'
  options?: Record<string, any>
  aiConfig?: AIConfig;
  cssConfig?: {
    customCSS?: string;
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    textColor?: string;
  };
}

export interface EnhanceResponse {
  success: boolean
  enhanced_content?: string
  error?: string
  networkStatus?: 'online' | 'offline' | 'vpn_issue'
}

export interface NetworkStatus {
  isOnline: boolean
  hasVpnIssues: boolean
  latency?: number
  errorType?: 'timeout' | 'connection_refused' | 'dns_error' | 'vpn_blocking'
}

/**
 * 检测网络连接状态
 */
export async function checkNetworkStatus(): Promise<NetworkStatus> {
  const startTime = Date.now()
  
  try {
    // 检测基本网络连接
    if (!navigator.onLine) {
      return {
        isOnline: false,
        hasVpnIssues: false,
        errorType: 'connection_refused'
      }
    }

    // 测试本地API连接
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const latency = Date.now() - startTime
      
      if (response.ok) {
        return {
          isOnline: true,
          hasVpnIssues: latency > 10000, // 超过10秒可能是VPN问题
          latency
        }
      } else {
        return {
          isOnline: true,
          hasVpnIssues: true,
          latency,
          errorType: 'vpn_blocking'
        }
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      const errorMessage = fetchError instanceof Error ? fetchError.message : ''
      
      if (errorMessage.includes('aborted')) {
        return {
          isOnline: true,
          hasVpnIssues: true,
          errorType: 'timeout'
        }
      }
      
      return {
        isOnline: false,
        hasVpnIssues: false,
        errorType: 'connection_refused'
      }
    }
  } catch (error) {
    return {
      isOnline: false,
      hasVpnIssues: false,
      errorType: 'dns_error'
    }
  }
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 带重试机制的fetch请求
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  attempts: number = RETRY_ATTEMPTS
): Promise<Response> {
  let lastError: Error
  
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT)
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      // 如果是最后一次尝试，直接抛出错误
      if (i === attempts - 1) {
        throw lastError
      }
      
      // 等待后重试
      await delay(RETRY_DELAY * (i + 1)) // 递增延迟
      console.warn(`API请求失败，正在重试 (${i + 1}/${attempts}):`, lastError.message)
    }
  }
  
  throw lastError!
}

/**
 * 获取VPN相关的错误提示
 */
function getVpnErrorMessage(error: Error, networkStatus?: NetworkStatus): string {
  const errorMessage = error.message.toLowerCase()
  
  if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
    return '请求超时，这可能是由于VPN连接不稳定导致的。建议：\n1. 检查VPN连接状态\n2. 尝试切换VPN服务器\n3. 暂时关闭VPN后重试'
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return '网络连接异常。如果您正在使用VPN，请尝试：\n1. 检查VPN是否正常工作\n2. 尝试切换到其他VPN节点\n3. 检查防火墙设置'
  }
  
  if (networkStatus?.hasVpnIssues) {
    return '检测到可能的VPN相关问题。建议：\n1. 检查VPN连接稳定性\n2. 尝试使用不同的VPN服务器\n3. 如果问题持续，请暂时关闭VPN'
  }
  
  return error.message
}

/**
 * 调用AI增强API
 */
export async function enhanceMarkdown(request: EnhanceRequest): Promise<EnhanceResponse> {
  try {
    // 首先检查网络状态
    const networkStatus = await checkNetworkStatus()
    
    if (!networkStatus.isOnline) {
      return {
        success: false,
        error: '网络连接不可用，请检查您的网络连接',
        networkStatus: 'offline'
      }
    }
    
    if (networkStatus.hasVpnIssues) {
      console.warn('检测到VPN相关问题，延迟:', networkStatus.latency)
    }

    const response = await fetchWithRetry(`${API_BASE_URL}/enhance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: EnhanceResponse = await response.json()
    return {
      ...data,
      networkStatus: networkStatus.hasVpnIssues ? 'vpn_issue' : 'online'
    }
  } catch (error) {
    console.error('API调用失败:', error)
    
    const networkStatus = await checkNetworkStatus()
    const friendlyMessage = getVpnErrorMessage(
      error instanceof Error ? error : new Error('未知错误'),
      networkStatus
    )
    
    return {
      success: false,
      error: friendlyMessage,
      networkStatus: networkStatus.hasVpnIssues ? 'vpn_issue' : 'offline'
    }
  }
}

/**
 * 检查API健康状态（带网络检测）
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const networkStatus = await checkNetworkStatus()
    
    if (!networkStatus.isOnline) {
      console.warn('网络连接不可用')
      return false
    }
    
    if (networkStatus.hasVpnIssues) {
      console.warn('检测到VPN相关问题，但尝试继续连接')
    }
    
    const response = await fetchWithRetry(`${API_BASE_URL}/api/health`, {
      method: 'GET'
    })
    
    if (!response.ok) {
      return false
    }
    
    const data = await response.json()
    return data.status === 'healthy'
  } catch (error) {
    console.error('API健康检查失败:', error)
    return false
  }
}