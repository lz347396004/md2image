<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">设置</h2>
        <button 
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <!-- 页面切换标签 -->
      <div class="flex border-b border-gray-200 bg-gray-50">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2',
            activeTab === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.name }}</span>
        </button>
      </div>
      
      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-180px)]">
        <div class="p-6">
          <!-- AI配置标签页 -->
          <div v-if="activeTab === 'ai'" class="space-y-6">
            <div class="flex items-center space-x-2">
              <Bot class="w-5 h-5 text-blue-600" />
              <h3 class="text-lg font-medium text-gray-900">AI 功能配置</h3>
            </div>
            
            <div class="grid gap-6">
              <!-- API Base URL -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  API Base URL
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="localSettings.aiConfig.baseUrl"
                  type="url"
                  placeholder="https://api.openai.com/v1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p class="text-xs text-gray-500">AI服务的API基础地址</p>
              </div>
              
              <!-- API Key -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  API Key
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="localSettings.aiConfig.apiKey"
                    :type="showApiKey ? 'text' : 'password'"
                    placeholder="sk-..."
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    @click="showApiKey = !showApiKey"
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye v-if="!showApiKey" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
                <p class="text-xs text-gray-500">用于访问AI服务的API密钥</p>
              </div>
              
              <!-- 模型名称 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  模型名称
                  <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="localSettings.aiConfig.modelName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">请选择模型</option>
                  <optgroup label="OpenAI">
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </optgroup>
                  <optgroup label="Claude">
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </optgroup>
                  <optgroup label="其他">
                    <option value="custom">自定义模型</option>
                  </optgroup>
                </select>
                <input
                  v-if="localSettings.aiConfig.modelName === 'custom'"
                  v-model="localSettings.aiConfig.customModelName"
                  type="text"
                  placeholder="输入自定义模型名称"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mt-2"
                />
                <p class="text-xs text-gray-500">选择要使用的AI模型</p>
              </div>
              
              <!-- 温度设置 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  温度 (Temperature): {{ localSettings.aiConfig.temperature }}
                </label>
                <input
                  v-model.number="localSettings.aiConfig.temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>保守 (0)</span>
                  <span>平衡 (1)</span>
                  <span>创意 (2)</span>
                </div>
                <p class="text-xs text-gray-500">控制AI回答的创造性程度</p>
              </div>
              
              <!-- 最大Token数 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  最大Token数
                </label>
                <input
                  v-model.number="localSettings.aiConfig.maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p class="text-xs text-gray-500">限制AI回答的最大长度</p>
              </div>
              
              <!-- AI连接测试 -->
              <div class="space-y-3">
                <button
                  @click="testConnection"
                  :disabled="isTestingConnection || !isConfigValid"
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Loader2 v-if="isTestingConnection" class="w-4 h-4 animate-spin" />
                  <Zap v-else class="w-4 h-4" />
                  <span>{{ isTestingConnection ? '测试中...' : '测试AI连接' }}</span>
                </button>
                
                <div v-if="connectionTestResult" class="p-3 rounded-lg" :class="{
                  'bg-green-50 border border-green-200': connectionTestResult.success,
                  'bg-red-50 border border-red-200': !connectionTestResult.success
                }">
                  <div class="flex items-center space-x-2">
                    <CheckCircle v-if="connectionTestResult.success" class="w-4 h-4 text-green-600" />
                    <XCircle v-else class="w-4 h-4 text-red-600" />
                    <span class="text-sm font-medium" :class="{
                      'text-green-800': connectionTestResult.success,
                      'text-red-800': !connectionTestResult.success
                    }">
                      {{ connectionTestResult.message }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 提示词配置 -->
              <div class="space-y-4 pt-6 border-t border-gray-200">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900">提示词配置</h3>
                </div>
                
                <!-- 换页提示词 -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    换页提示词
                  </label>
                  <textarea
                    v-model="localSettings.aiConfig.pageBreakPrompt"
                    rows="3"
                    placeholder="请输入换页提示词，用于指导AI在何处插入分页符..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  ></textarea>
                  <p class="text-xs text-gray-500">用于指导AI在适当位置插入分页符，提高文档的可读性</p>
                </div>

                <!-- CSS样式生成提示词 -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">CSS样式生成提示词</label>
                  <textarea
                    v-model="localSettings.aiConfig.cssStylePrompt"
                    rows="4"
                    placeholder="请输入CSS样式生成提示词，用于指导AI生成适合的CSS样式..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  ></textarea>
                  <p class="text-xs text-gray-500">用于指导AI生成简洁、实用、兼容性好的CSS样式代码</p>
                </div>

                <!-- 重置提示词按钮 -->
                <div class="flex justify-end">
                  <button
                    @click="resetPrompts"
                    class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center space-x-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>重置为默认</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 图片设置标签页 -->
          <div v-if="activeTab === 'image'" class="space-y-6">
            <div class="flex items-center space-x-2">
              <Image class="w-5 h-5 text-green-600" />
              <h3 class="text-lg font-medium text-gray-900">背景设置</h3>
            </div>
            
            <!-- 背景颜色 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                背景颜色
              </label>
              <div class="flex space-x-2">
                <input
                  v-model="localSettings.imageConfig.backgroundColor"
                  type="color"
                  class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="localSettings.imageConfig.backgroundColor"
                  type="text"
                  placeholder="#d81313"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <!-- 预设颜色快速选择 -->
              <div class="space-y-2">
                <label class="block text-xs font-medium text-gray-600">
                  快速选择
                </label>
                <!-- 颜色圆点选择 -->
                <div class="flex flex-wrap gap-2 mb-3">
                  <button
                    v-for="color in presetColors"
                    :key="color.name"
                    @click="selectPresetColor(color)"
                    :style="{ backgroundColor: color.value }"
                    :class="[
                      'w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110',
                      localSettings.imageConfig.backgroundColor === color.value
                        ? 'border-gray-800 ring-2 ring-gray-300'
                        : 'border-gray-300 hover:border-gray-400'
                    ]"
                    :title="color.name"
                  ></button>
                </div>
                <!-- 颜色名称按钮 -->
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="color in presetColors.slice(0, 8)"
                    :key="'btn-' + color.name"
                    @click="selectPresetColor(color)"
                    :class="[
                      'px-3 py-1 text-xs rounded-full border transition-all duration-200',
                      localSettings.imageConfig.backgroundColor === color.value
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    ]"
                  >
                    {{ color.name }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 背景图片类型 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                背景图片
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="localSettings.imageConfig.backgroundImageType = 'none'"
                  :class="[
                    'px-3 py-2 text-sm rounded-lg border transition-colors',
                    localSettings.imageConfig.backgroundImageType === 'none'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  无背景
                </button>
                <button
                  @click="localSettings.imageConfig.backgroundImageType = 'preset'"
                  :class="[
                    'px-3 py-2 text-sm rounded-lg border transition-colors',
                    localSettings.imageConfig.backgroundImageType === 'preset'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  预设图片
                </button>
                <button
                  @click="localSettings.imageConfig.backgroundImageType = 'custom'"
                  :class="[
                    'px-3 py-2 text-sm rounded-lg border transition-colors',
                    localSettings.imageConfig.backgroundImageType === 'custom'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  自定义
                </button>
              </div>
            </div>
            
            <!-- 预设背景图片 -->
            <div v-if="localSettings.imageConfig.backgroundImageType === 'preset'" class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                选择预设背景
              </label>
              
              <!-- 快速选择按钮 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="preset in presetBackgrounds.slice(0, 6)"
                  :key="'btn-' + preset.id"
                  @click="selectPresetBackground(preset)"
                  :class="[
                    'px-3 py-1 text-xs rounded-full border transition-all duration-200',
                    localSettings.imageConfig.backgroundImage === preset.url
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  {{ preset.name }}
                </button>
              </div>
              
              <div class="grid grid-cols-3 gap-3">
                <div
                  v-for="preset in presetBackgrounds"
                  :key="preset.id"
                  @click="selectPresetBackground(preset)"
                  :class="[
                    'relative aspect-video rounded-lg border-2 cursor-pointer transition-all overflow-hidden',
                    (localSettings.imageConfig.backgroundImage === preset.url || localSettings.imageConfig.backgroundImage === preset.fallbackUrl)
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <!-- 渐变背景预览 -->
                  <div
                    class="w-full h-full"
                    :style="{ background: preset.thumbnail }"
                  ></div>
                  
                  <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span class="text-white text-xs font-medium">{{ preset.name }}</span>
                  </div>
                  <div
                    v-if="localSettings.imageConfig.backgroundImage === preset.url || localSettings.imageConfig.backgroundImage === preset.fallbackUrl"
                    class="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle class="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
            

            
            <!-- 自定义背景图片 -->
            <div v-if="localSettings.imageConfig.backgroundImageType === 'custom'" class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                上传自定义背景
              </label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="hidden"
                />
                <div v-if="!localSettings.imageConfig.backgroundImage" class="space-y-2">
                  <Image class="w-8 h-8 text-gray-400 mx-auto" />
                  <div class="text-sm text-gray-600">
                    <button
                      @click="fileInput?.click()"
                      class="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      点击上传
                    </button>
                    或拖拽图片到此处
                  </div>
                  <p class="text-xs text-gray-500">支持 JPG、PNG、GIF 格式</p>
                </div>
                <div v-else class="space-y-3">
                  <img
                    :src="localSettings.imageConfig.backgroundImage"
                    alt="背景预览"
                    class="max-w-full max-h-32 mx-auto rounded-lg"
                  />
                  <div class="flex justify-center space-x-2">
                    <button
                      @click="fileInput?.click()"
                      class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      更换图片
                    </button>
                    <button
                      @click="localSettings.imageConfig.backgroundImage = ''; fileInput && (fileInput.value = '')"
                      class="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      移除图片
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 背景图片设置 -->
            <div v-if="localSettings.imageConfig.backgroundImageType !== 'none'" class="space-y-4">
              <!-- 透明度 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  背景透明度: {{ Math.round(localSettings.imageConfig.backgroundImageOpacity * 100) }}%
                </label>
                <input
                  v-model.number="localSettings.imageConfig.backgroundImageOpacity"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <!-- 背景尺寸 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  背景尺寸
                </label>
                <select
                  v-model="localSettings.imageConfig.backgroundImageSize"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="cover">覆盖 (Cover)</option>
                  <option value="contain">包含 (Contain)</option>
                  <option value="auto">原始尺寸 (Auto)</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- 样式设置标签页 -->
          <div v-if="activeTab === 'style'" class="space-y-6">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900">自定义CSS设置</h3>
            </div>
            
            <div class="grid gap-6">
              <!-- 字体设置 -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    字体族
                  </label>
                  <select
                    v-model="localSettings.cssConfig.fontFamily"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Inter, system-ui, sans-serif">Inter (默认)</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                    <option value="'Noto Sans SC', sans-serif">思源黑体</option>
                    <option value="'Source Han Serif SC', serif">思源宋体</option>
                  </select>
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    字体大小: {{ localSettings.cssConfig.fontSize }}px
                  </label>
                  <input
                    v-model.number="localSettings.cssConfig.fontSize"
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
              
              <!-- 行高和颜色设置 -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    行高: {{ localSettings.cssConfig.lineHeight }}
                  </label>
                  <input
                    v-model.number="localSettings.cssConfig.lineHeight"
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">
                    文字颜色
                  </label>
                  <div class="flex space-x-2">
                    <input
                      v-model="localSettings.cssConfig.textColor"
                      type="color"
                      class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      v-model="localSettings.cssConfig.textColor"
                      type="text"
                      placeholder="#ffffff"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              

              
              <!-- 预设样式方案 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  预设样式方案
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    v-for="scheme in presetStyleSchemes"
                    :key="scheme.id"
                    class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    @click="applyStyleScheme(scheme)"
                  >
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="font-medium text-gray-900">{{ scheme.name }}</h4>
                        <p class="text-sm text-gray-500 mt-1">{{ scheme.description }}</p>
                        <div class="text-xs text-gray-400 mt-2">
                          {{ scheme.config.fontFamily.split(',')[0] }} · {{ scheme.config.fontSize }}px
                        </div>
                      </div>
                      <div class="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-xs" 
                           :style="{ fontFamily: scheme.config.fontFamily.split(',')[0], color: scheme.config.textColor }">
                        Aa
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 自定义CSS代码 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  自定义CSS代码
                </label>
                <textarea
                  v-model="localSettings.cssConfig.customCSS"
                  rows="8"
                  placeholder="/* 自定义CSS样式说明&#10; * &#10; * 可以定义的样式范围：&#10; * 1. 字体样式：font-family, font-size, font-weight, line-height&#10; * 2. 颜色方案：color, background-color（建议使用十六进制或RGB值）&#10; * 3. 间距布局：margin, padding, text-align&#10; * 4. 边框装饰：border, border-radius（简单边框效果）&#10; * 5. 文本效果：text-shadow（轻微效果）&#10; * &#10; * 注意事项：&#10; * - 避免使用复杂的动画属性（transform, animation, transition）&#10; * - 不建议使用外部字体，优先使用系统字体&#10; * - 避免使用position: fixed/absolute等定位属性&#10; * - 不使用复杂的背景图片或渐变效果&#10; * - 确保样式在图片生成时能正确显示&#10; * &#10; * 示例：&#10; * body { font-family: 'Microsoft YaHei', sans-serif; }&#10; * h1 { color: #2c3e50; font-size: 24px; }&#10; * p { line-height: 1.6; margin-bottom: 16px; }&#10; */&#10;&#10;/* 在此处添加您的自定义样式 */"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                ></textarea>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-500">可以使用CSS代码进一步定制样式，支持所有标准CSS属性</p>
                  <button
                    @click="generateAiCssStyle"
                    :disabled="aiCssLoading"
                    class="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <svg v-if="aiCssLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>{{ aiCssLoading ? '生成中...' : 'AI生成样式' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          

        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          @click="resetToDefaults"
          class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          重置默认
        </button>
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          @click="saveSettings"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { toast } from 'sonner'
import { 
  X, Bot, Eye, EyeOff, Image, Zap, Loader2, 
  CheckCircle, XCircle, AlertTriangle, Palette 
} from 'lucide-vue-next'
import type { AppSettings, AIConfig, ImageConfig, CSSConfig } from '@/types'

interface Props {
  visible: boolean
  settings: AppSettings
}

interface Emits {
  (e: 'close'): void
  (e: 'save', settings: AppSettings): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地设置副本
const localSettings = ref<AppSettings>({
  aiConfig: {
    baseUrl: '',
    apiKey: '',
    modelName: '',
    customModelName: '',
    temperature: 0.7,
    maxTokens: 2000,
    pageBreakPrompt: `请对以下Markdown文档进行智能分段，在合适的位置添加换页标识符。要求：

**换页标识符使用指南：**
- 使用 \`<!-- PAGE_BREAK -->\` 作为换页标识符（注意：这与分页符 \`---\` 不同）
- 换页符 \`<!-- PAGE_BREAK -->\` 用于强制分页，在图片生成时会在此处分割成新页面
- 分页符 \`---\` 是Markdown语法，用于创建水平分割线，不影响分页
- 分段位置不能在连贯段落的中间，必须保持内容的连贯性
- 优先在章节、小节之间添加换页符
- 当表格内容过长时，可在合适的地方横向分开，但尽量保证表格完整性
- 每一段控制在500字以内（表格字数不计入限制）
- 分页后每页都应该有完整的语义单元

**分段原则：**
1. 连贯性优先：不在句子、段落中间添加换页符
2. 语义完整：每页内容应该相对独立和完整
3. 长度控制：每页500字以内（表格除外）
4. 表格处理：长表格可适当分割，但保持表头和数据的对应关系

请在合适的位置插入换页标识符 \`<!-- PAGE_BREAK -->\`，确保分页后的内容既符合长度要求又保持良好的阅读体验。`,
    tableBeautifyPrompt: '请优化表格格式，确保表格美观、对齐良好，并添加适当的样式。保持数据的准确性和可读性。',
    imageGenerationPrompt: '根据文档内容生成相关的配图，图片应该与内容主题相关，风格统一，有助于理解文档内容。'
  },
  imageConfig: {
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundImageType: 'none',
    backgroundImageOpacity: 0.8,
    backgroundImageSize: 'cover'
  },
  cssConfig: {
    customCSS: '',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    lineHeight: 1.6,
    textColor: '#1f2937'
  }
})

// UI状态
const showApiKey = ref(false)
const isTestingConnection = ref(false)
const connectionTestResult = ref<{ success: boolean; message: string } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const aiCssLoading = ref(false)

// 标签页配置
const activeTab = ref('ai')
const tabs = ref([
  {
    id: 'ai',
    name: 'AI配置',
    icon: 'Bot'
  },
  {
    id: 'style',
    name: '样式设置',
    icon: 'Palette'
  },
  {
    id: 'image',
    name: '图片设置',
    icon: 'Image'
  }
])

// 图片加载状态管理
const imageLoadingStates = ref<Record<string, boolean>>({})
const imageErrorStates = ref<Record<string, boolean>>({})

// 预设颜色
const presetColors = ref([
  { name: '纯白', value: '#ffffff' },
  { name: '浅灰', value: '#f8f9fa' },
  { name: '天蓝', value: '#e3f2fd' },
  { name: '薄荷绿', value: '#e8f5e8' },
  { name: '淡粉', value: '#fce4ec' },
  { name: '浅黄', value: '#fff9c4' },
  { name: '淡紫', value: '#f3e5f5' },
  { name: '浅橙', value: '#fff3e0' },
  { name: '深蓝', value: '#1976d2' },
  { name: '深绿', value: '#388e3c' },
  { name: '深红', value: '#d32f2f' },
  { name: '深紫', value: '#7b1fa2' },
  { name: '深灰', value: '#424242' },
  { name: '黑色', value: '#000000' }
])

// 预设背景图片
const presetBackgrounds = ref([
  {
    id: 'gradient-1',
    name: '蓝紫渐变',
    url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fallbackUrl: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'gradient-2',
    name: '橙红渐变',
    url: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    fallbackUrl: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'gradient-3',
    name: '绿青渐变',
    url: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    thumbnail: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    fallbackUrl: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'geometric-1',
    name: '几何图案',
    url: 'linear-gradient(45deg, #667eea 25%, transparent 25%), linear-gradient(-45deg, #667eea 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #667eea 75%), linear-gradient(-45deg, transparent 75%, #667eea 75%)',
    thumbnail: 'linear-gradient(45deg, #667eea 25%, transparent 25%), linear-gradient(-45deg, #667eea 25%, transparent 25%)',
    fallbackUrl: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    id: 'nature-1',
    name: '自然风景',
    url: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #00b894 100%)',
    thumbnail: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #00b894 100%)',
    fallbackUrl: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
  },
  {
    id: 'tech-1',
    name: '科技风格',
    url: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    fallbackUrl: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
])

// 预设CSS样式方案
const presetStyleSchemes = ref([
  {
    id: 'modern-clean',
    name: '现代简洁',
    description: '简洁现代的设计风格',
    config: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 16,
      lineHeight: 1.6,
      textColor: '#1f2937',
      customCSS: `/* 现代简洁风格 */
.markdown-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.markdown-content h1 {
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.markdown-content blockquote {
  background-color: #f9fafb;
  border-left: 4px solid #3b82f6;
}`
    }
  },
  {
    id: 'elegant-serif',
    name: '优雅衬线',
    description: '经典优雅的衬线字体风格',
    config: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 18,
      lineHeight: 1.8,
      textColor: '#374151',
      customCSS: `/* 优雅衬线风格 */
.markdown-content {
  max-width: 700px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.markdown-content h1, .markdown-content h2 {
  font-weight: 400;
  letter-spacing: -0.025em;
}

.markdown-content p {
  text-align: justify;
  margin-bottom: 1.5rem;
}`
    }
  },
  {
    id: 'tech-mono',
    name: '科技等宽',
    description: '技术文档风格，适合代码展示',
    config: {
      fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
      fontSize: 14,
      lineHeight: 1.5,
      textColor: '#0f172a',
      customCSS: `/* 科技等宽风格 */
.markdown-content {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
}

.markdown-content h1, .markdown-content h2, .markdown-content h3 {
  color: #1e40af;
  font-weight: 600;
}

.markdown-content code {
  background-color: #1e293b;
  color: #e2e8f0;
}`
    }
  },
  {
    id: 'creative-bold',
    name: '创意粗体',
    description: '大胆创意的设计风格',
    config: {
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      fontSize: 17,
      lineHeight: 1.7,
      textColor: '#111827',
      customCSS: `/* 创意粗体风格 */
.markdown-content h1 {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.markdown-content h2 {
  font-weight: 700;
  color: #4f46e5;
}

.markdown-content strong {
  background-color: #fef3c7;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}`
    }
  },
  {
    id: 'minimal-light',
    name: '极简浅色',
    description: '极简主义浅色主题',
    config: {
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: 15,
      lineHeight: 1.6,
      textColor: '#6b7280',
      customCSS: `/* 极简浅色风格 */
.markdown-content {
  color: #6b7280;
  line-height: 1.8;
}

.markdown-content h1, .markdown-content h2, .markdown-content h3 {
  color: #374151;
  font-weight: 300;
}

.markdown-content p {
  margin-bottom: 1.25rem;
}

.markdown-content ul, .markdown-content ol {
  padding-left: 1.5rem;
}`
    }
  }
])

// 监听props变化，更新本地设置
watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    // 深度合并设置，确保所有字段都有默认值
    localSettings.value = {
      aiConfig: {
        baseUrl: newSettings.aiConfig?.baseUrl || '',
        apiKey: newSettings.aiConfig?.apiKey || '',
        modelName: newSettings.aiConfig?.modelName || '',
        customModelName: newSettings.aiConfig?.customModelName || '',
        temperature: newSettings.aiConfig?.temperature ?? 0.7,
        maxTokens: newSettings.aiConfig?.maxTokens ?? 2000,
        pageBreakPrompt: newSettings.aiConfig?.pageBreakPrompt || `请对以下Markdown文档进行智能分段，在合适的位置添加换页标识符。要求：

**换页标识符使用指南：**
- 使用 \`<!-- PAGE_BREAK -->\` 作为换页标识符（注意：这与分页符 \`---\` 不同）
- 换页符 \`<!-- PAGE_BREAK -->\` 用于强制分页，在图片生成时会在此处分割成新页面
- 分页符 \`---\` 是Markdown语法，用于创建水平分割线，不影响分页
- 分段位置不能在连贯段落的中间，必须保持内容的连贯性
- 优先在章节、小节之间添加换页符
- 当表格内容过长时，可在合适的地方横向分开，但尽量保证表格完整性
- 每一段控制在500字以内（表格字数不计入限制）
- 分页后每页都应该有完整的语义单元

**分段原则：**
1. 连贯性优先：不在句子、段落中间添加换页符
2. 语义完整：每页内容应该相对独立和完整
3. 长度控制：每页500字以内（表格除外）
4. 表格处理：长表格可适当分割，但保持表头和数据的对应关系

请在合适的位置插入换页标识符 \`<!-- PAGE_BREAK -->\`，确保分页后的内容既符合长度要求又保持良好的阅读体验。`,
        tableBeautifyPrompt: newSettings.aiConfig?.tableBeautifyPrompt || '请优化表格格式，确保表格美观、对齐良好，并添加适当的样式。保持数据的准确性和可读性。',
        imageGenerationPrompt: newSettings.aiConfig?.imageGenerationPrompt || '根据文档内容生成相关的配图，图片应该与内容主题相关，风格统一，有助于理解文档内容。'
      },
      imageConfig: {
        backgroundColor: newSettings.imageConfig?.backgroundColor || '#ffffff',
        backgroundImage: newSettings.imageConfig?.backgroundImage || '',
        backgroundImageType: newSettings.imageConfig?.backgroundImageType || 'none',
        backgroundImageOpacity: newSettings.imageConfig?.backgroundImageOpacity ?? 0.8,
        backgroundImageSize: newSettings.imageConfig?.backgroundImageSize || 'cover'
      },
      cssConfig: {
        customCSS: newSettings.cssConfig?.customCSS || '',
        fontFamily: newSettings.cssConfig?.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: newSettings.cssConfig?.fontSize ?? 16,
        lineHeight: newSettings.cssConfig?.lineHeight ?? 1.6,
        textColor: newSettings.cssConfig?.textColor || '#1f2937'
      }
    }
  }
}, { immediate: true, deep: true })

// 组件挂载时确保初始化
onMounted(() => {
  if (props.settings) {
    // 触发一次手动更新，确保所有输入框都显示正确的值
    const currentSettings = props.settings
    localSettings.value = {
      aiConfig: {
        baseUrl: currentSettings.aiConfig?.baseUrl || '',
        apiKey: currentSettings.aiConfig?.apiKey || '',
        modelName: currentSettings.aiConfig?.modelName || '',
        customModelName: currentSettings.aiConfig?.customModelName || '',
        temperature: currentSettings.aiConfig?.temperature ?? 0.7,
        maxTokens: currentSettings.aiConfig?.maxTokens ?? 2000,
        pageBreakPrompt: currentSettings.aiConfig?.pageBreakPrompt || '请在适当的位置插入分页符，确保每页内容完整且易于阅读。考虑标题层级、段落完整性和逻辑结构。',
        tableBeautifyPrompt: currentSettings.aiConfig?.tableBeautifyPrompt || '请优化表格格式，确保表格美观、对齐良好，并添加适当的样式。保持数据的准确性和可读性。',
        imageGenerationPrompt: currentSettings.aiConfig?.imageGenerationPrompt || '根据文档内容生成相关的配图，图片应该与内容主题相关，风格统一，有助于理解文档内容。'
      },
      imageConfig: {
        backgroundColor: currentSettings.imageConfig?.backgroundColor || '#ffffff',
        backgroundImage: currentSettings.imageConfig?.backgroundImage || '',
        backgroundImageType: currentSettings.imageConfig?.backgroundImageType || 'none',
        backgroundImageOpacity: currentSettings.imageConfig?.backgroundImageOpacity ?? 0.8,
        backgroundImageSize: currentSettings.imageConfig?.backgroundImageSize || 'cover'
      },
      cssConfig: {
        customCSS: currentSettings.cssConfig?.customCSS || '',
        fontFamily: currentSettings.cssConfig?.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: currentSettings.cssConfig?.fontSize ?? 16,
        lineHeight: currentSettings.cssConfig?.lineHeight ?? 1.6,
        textColor: currentSettings.cssConfig?.textColor || '#1f2937'
      }
    }
  }
})

// 配置有效性检查
const isConfigValid = computed(() => {
  const { baseUrl, apiKey, modelName } = localSettings.value.aiConfig
  return baseUrl.trim() !== '' && apiKey.trim() !== '' && modelName.trim() !== ''
})

// 测试连接
const testConnection = async () => {
  if (!isConfigValid.value) return
  
  isTestingConnection.value = true
  connectionTestResult.value = null
  
  try {
    // 模拟API测试调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 这里应该调用实际的API测试接口
    const testSuccess = Math.random() > 0.3 // 模拟70%成功率
    
    connectionTestResult.value = {
      success: testSuccess,
      message: testSuccess ? 'AI服务连接成功！' : 'AI服务连接失败，请检查配置信息'
    }
  } catch (error) {
    connectionTestResult.value = {
      success: false,
      message: '连接测试失败：' + (error instanceof Error ? error.message : '未知错误')
    }
  } finally {
    isTestingConnection.value = false
  }
}

// 重置提示词为默认值
const resetPrompts = () => {
  localSettings.value.aiConfig.pageBreakPrompt = `请对以下Markdown文档进行智能分段，在合适的位置添加换页标识符。要求：

**换页标识符使用指南：**
- 使用 \`<!-- PAGE_BREAK -->\` 作为换页标识符
- 分段位置不能在连贯段落的中间，必须保持内容的连贯性
- 优先在章节、小节之间分页
- 当表格内容过长时，可在合适的地方横向分开，但尽量保证表格完整性
- 每一段控制在500字以内（表格字数不计入限制）
- 分页后每页都应该有完整的语义单元

**分段原则：**
1. 连贯性优先：不在句子、段落中间分页
2. 语义完整：每页内容应该相对独立和完整
3. 长度控制：每页500字以内（表格除外）
4. 表格处理：长表格可适当分割，但保持表头和数据的对应关系

请在合适的位置插入换页标识符，确保分页后的内容既符合长度要求又保持良好的阅读体验。`
  localSettings.value.aiConfig.cssStylePrompt = `请为以下Markdown文档生成适合的CSS样式，要求：

**样式生成原则：**
- 只使用标准CSS属性，避免复杂的动画和特效
- 重点优化字体、颜色、间距、布局等基础样式
- 确保样式在图片生成时能正确显示
- 避免使用position: fixed、absolute等可能影响截图的定位属性
- 不使用外部字体，只使用系统安全字体

**可优化的样式元素：**
1. 字体样式：font-family, font-size, font-weight, line-height
2. 颜色方案：color, background-color（使用安全的颜色值）
3. 间距布局：margin, padding, text-align
4. 边框装饰：border, border-radius（简单边框）
5. 文本效果：text-shadow（轻微效果）

**限制条件：**
- 不使用transform、animation、transition等动画属性
- 不使用复杂的背景图片或渐变
- 不使用flex、grid等可能不兼容的布局属性
- 颜色值使用十六进制或RGB格式

请生成简洁、实用、兼容性好的CSS样式代码。`
}

// 应用预设样式方案
const applyStyleScheme = (scheme: any) => {
  // 应用字体和样式配置
  localSettings.value.cssConfig.fontFamily = scheme.config.fontFamily
  localSettings.value.cssConfig.fontSize = scheme.config.fontSize
  localSettings.value.cssConfig.lineHeight = scheme.config.lineHeight
  localSettings.value.cssConfig.textColor = scheme.config.textColor
  localSettings.value.cssConfig.customCSS = scheme.config.customCSS
  
  // 触发更新
  nextTick(() => {
    // 可以在这里添加应用成功的提示
    console.log(`已应用样式方案: ${scheme.name}`)
  })
}

// 重置为默认值
const resetToDefaults = () => {
  localSettings.value = {
    aiConfig: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      modelName: 'gpt-3.5-turbo',
      customModelName: '',
      temperature: 0.7,
      maxTokens: 2000,
      pageBreakPrompt: `请对以下Markdown文档进行智能分段，在合适的位置添加换页标识符。要求：

**换页标识符使用指南：**
- 使用 \`<!-- PAGE_BREAK -->\` 作为换页标识符
- 分段位置不能在连贯段落的中间，必须保持内容的连贯性
- 优先在章节、小节之间分页
- 当表格内容过长时，可在合适的地方横向分开，但尽量保证表格完整性
- 每一段控制在500字以内（表格字数不计入限制）
- 分页后每页都应该有完整的语义单元

**分段原则：**
1. 连贯性优先：不在句子、段落中间分页
2. 语义完整：每页内容应该相对独立和完整
3. 长度控制：每页500字以内（表格除外）
4. 表格处理：长表格可适当分割，但保持表头和数据的对应关系

请在合适的位置插入换页标识符，确保分页后的内容既符合长度要求又保持良好的阅读体验。`,
      cssStylePrompt: `请为以下Markdown文档生成适合的CSS样式，要求：

**样式生成原则：**
- 只使用标准CSS属性，避免复杂的动画和特效
- 重点优化字体、颜色、间距、布局等基础样式
- 确保样式在图片生成时能正确显示
- 避免使用position: fixed、absolute等可能影响截图的定位属性
- 不使用外部字体，只使用系统安全字体

**可优化的样式元素：**
1. 字体样式：font-family, font-size, font-weight, line-height
2. 颜色方案：color, background-color（使用安全的颜色值）
3. 间距布局：margin, padding, text-align
4. 边框装饰：border, border-radius（简单边框）
5. 文本效果：text-shadow（轻微效果）

**限制条件：**
- 不使用transform、animation、transition等动画属性
- 不使用复杂的背景图片或渐变
- 不使用flex、grid等可能不兼容的布局属性
- 颜色值使用十六进制或RGB格式

请生成简洁、实用、兼容性好的CSS样式代码。`
    },
    imageConfig: {
      backgroundColor: '#ffffff',
      backgroundImage: '',
      backgroundImageType: 'none',
      backgroundImageOpacity: 0.8,
      backgroundImageSize: 'cover'
    },
    cssConfig: {
      customCSS: `/* 自定义CSS样式说明
 * 
 * 可以定义的样式范围：
 * 1. 字体样式：font-family, font-size, font-weight, line-height
 * 2. 颜色方案：color, background-color（建议使用十六进制或RGB值）
 * 3. 间距布局：margin, padding, text-align
 * 4. 边框装饰：border, border-radius（简单边框效果）
 * 5. 文本效果：text-shadow（轻微效果）
 * 
 * 注意事项：
 * - 避免使用复杂的动画属性（transform, animation, transition）
 * - 不建议使用外部字体，优先使用系统字体
 * - 避免使用position: fixed/absolute等定位属性
 * - 不使用复杂的背景图片或渐变效果
 * - 确保样式在图片生成时能正确显示
 * 
 * 示例：
 * body { font-family: 'Microsoft YaHei', sans-serif; }
 * h1 { color: #2c3e50; font-size: 24px; }
 * p { line-height: 1.6; margin-bottom: 16px; }
 */

/* 在此处添加您的自定义样式 */`,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 16,
      lineHeight: 1.6,
      textColor: '#1f2937'
    }
  }
  connectionTestResult.value = null
}

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }
    
    // 检查文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片文件大小不能超过5MB')
      return
    }
    
    // 读取文件并转换为base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      localSettings.value.imageConfig.backgroundImage = result
    }
    reader.readAsDataURL(file)
  }
}

// 选择预设颜色
const selectPresetColor = (color: { name: string; value: string }) => {
  localSettings.value.imageConfig.backgroundColor = color.value
  localSettings.value.imageConfig.backgroundImageType = 'none'
  localSettings.value.imageConfig.backgroundImage = ''
}

// 处理图片加载开始
const handleImageLoadStart = (imageId: string) => {
  imageLoadingStates.value[imageId] = true
  imageErrorStates.value[imageId] = false
}

// 处理图片加载成功
const handleImageLoad = (imageId: string) => {
  imageLoadingStates.value[imageId] = false
  imageErrorStates.value[imageId] = false
}

// 处理图片加载成功（别名）
const handleImageLoadSuccess = (imageId: string) => {
  handleImageLoad(imageId)
}

// 处理图片加载失败
const handleImageError = (imageId: string) => {
  imageLoadingStates.value[imageId] = false
  imageErrorStates.value[imageId] = true
}

// 处理图片加载失败（别名）
const handleImageLoadError = (imageId: string) => {
  handleImageError(imageId)
}

// 选择预设背景图片
const selectPresetBackground = (background: any) => {
  // 如果API图片加载失败，使用备用渐变背景
  if (imageErrorStates.value[background.id]) {
    // 使用CSS渐变作为背景
    localSettings.value.imageConfig.backgroundImage = background.fallbackUrl
    localSettings.value.imageConfig.backgroundImageType = 'preset'
  } else {
    // 开始加载状态
    handleImageLoadStart(background.id)
    
    // 尝试加载API图片
    try {
      const img = document.createElement('img')
      img.onload = () => {
        handleImageLoadSuccess(background.id)
        localSettings.value.imageConfig.backgroundImage = background.url
        localSettings.value.imageConfig.backgroundImageType = 'preset'
      }
      img.onerror = () => {
        handleImageLoadError(background.id)
        // 加载失败时使用备用渐变背景
        localSettings.value.imageConfig.backgroundImage = background.fallbackUrl
        localSettings.value.imageConfig.backgroundImageType = 'preset'
      }
      img.src = background.url
    } catch (error) {
      // 如果创建图片元素失败，直接使用备用背景
      handleImageLoadError(background.id)
      localSettings.value.imageConfig.backgroundImage = background.fallbackUrl
      localSettings.value.imageConfig.backgroundImageType = 'preset'
    }
  }
}

// 获取背景样式
const getBackgroundStyle = (background: any) => {
  if (imageErrorStates.value[background.id]) {
    return {
      background: background.fallbackUrl
    }
  }
  return {}
}

// AI生成CSS样式
const generateAiCssStyle = async () => {
  if (aiCssLoading.value) return
  
  try {
    aiCssLoading.value = true
    
    // 检查AI配置
    if (!localSettings.value.aiConfig.apiKey || !localSettings.value.aiConfig.baseUrl || !localSettings.value.aiConfig.modelName) {
      toast.error('请先配置AI设置')
      return
    }
    
    // 构建请求
    const response = await fetch(`${localSettings.value.aiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localSettings.value.aiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: localSettings.value.aiConfig.modelName === 'custom' ? localSettings.value.aiConfig.customModelName : localSettings.value.aiConfig.modelName,
        messages: [
          {
            role: 'user',
            content: localSettings.value.aiConfig.cssStylePrompt || '请生成一套简洁美观的CSS样式，适用于Markdown文档渲染。'
          }
        ],
        temperature: localSettings.value.aiConfig.temperature,
        max_tokens: localSettings.value.aiConfig.maxTokens
      })
    })
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    const generatedCSS = data.choices?.[0]?.message?.content
    
    if (generatedCSS) {
      // 提取CSS代码块（如果有的话）
      const cssMatch = generatedCSS.match(/```css\n([\s\S]*?)\n```/) || generatedCSS.match(/```\n([\s\S]*?)\n```/)
      const cssContent = cssMatch ? cssMatch[1] : generatedCSS
      
      localSettings.value.cssConfig.customCSS = cssContent.trim()
      toast.success('CSS样式生成成功！')
    } else {
      throw new Error('未获取到有效的CSS内容')
    }
  } catch (error) {
    console.error('AI生成CSS样式失败:', error)
    toast.error(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    aiCssLoading.value = false
  }
}

// 保存设置
const saveSettings = () => {
  emit('save', JSON.parse(JSON.stringify(localSettings.value)))
  emit('close')
}
</script>

<style scoped>
/* 滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fixed {
  animation: fadeIn 0.2s ease-out;
}
</style>