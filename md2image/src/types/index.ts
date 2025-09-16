export interface AIConfig {
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

export interface ImageConfig {
  backgroundColor: string
  backgroundImage: string
  backgroundImageType: 'none' | 'preset' | 'custom'
  backgroundImageOpacity: number
  backgroundImageSize: 'cover' | 'contain' | 'auto'
}

export interface CSSConfig {
  customCSS: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  textColor: string
}

export interface AppSettings {
  aiConfig: AIConfig
  imageConfig: ImageConfig
  cssConfig: CSSConfig
}

export interface TableData {
  headers: string[]
  rows: string[][]
  rawMarkdown: string
}

export interface ErrorLog {
  id: string
  timestamp: string
  type: string
  message: string
  details?: string
  context?: Record<string, any>
  stack?: string
}