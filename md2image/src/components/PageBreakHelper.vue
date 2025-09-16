<template>
  <div class="page-break-helper">
    <div class="flex items-center space-x-2">
      <!-- 帮助按钮 -->
      <button 
        @click="showHelp = !showHelp"
        class="px-2 py-1.5 lg:px-4 lg:py-2 bg-text text-background rounded-lg hover:bg-text/90 transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-sm hover:shadow-md"
        title="换页符帮助"
      >
        <HelpCircle class="w-3 h-3 lg:w-4 lg:h-4" />
        <span class="text-xs lg:text-sm font-medium">换页符</span>
      </button>
      
      <!-- 配置按钮 -->
      <button 
        @click="$emit('aiEnhance')"
        class="px-2 py-1.5 lg:px-4 lg:py-2 bg-text text-background rounded-lg hover:bg-text/90 transition-all duration-200 flex items-center space-x-1 lg:space-x-2 shadow-sm hover:shadow-md ml-2"
        title="AI增强"
      >
        <Sparkles class="w-3 h-3 lg:w-4 lg:h-4" />
        <span class="text-xs lg:text-sm font-medium">AI增强</span>
      </button>
    </div>

    <!-- 帮助面板 -->
    <div v-if="showHelp" class="helper-panel">
      <div class="panel-header">
        <h3 class="panel-title">换页标识符使用指南</h3>
        <button @click="showHelp = false" class="close-button">
          <X class="w-4 h-4" />
        </button>
      </div>
      
      <div class="panel-content">
        <p class="description">
          使用以下特殊标识符来分割内容为多个页面：
        </p>
        
        <div class="markers-list">
          <div 
            v-for="marker in pageBreakMarkers" 
            :key="marker.code"
            class="marker-item"
          >
            <div class="marker-info">
              <code class="marker-code">{{ marker.code }}</code>
              <span class="marker-desc">{{ marker.description }}</span>
            </div>
            <button 
              @click="insertMarker(marker.code)"
              class="insert-button"
              title="插入此标识符"
            >
              <Plus class="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div class="tips">
          <h4 class="tips-title">💡 提示：</h4>
          <ul class="tips-list">
            <li>换页标识符不会在最终图片中显示</li>
            <li>可以在编辑器中任意位置插入换页符</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="showConfig" class="config-panel">
      <div class="panel-header">
        <h3 class="panel-title">快速配置提示词</h3>
        <button @click="showConfig = false" class="close-button">
          <X class="w-4 h-4" />
        </button>
      </div>
      
      <div class="panel-content">
        <div class="config-section">
          <label class="config-label">智能分段提示词</label>
          <textarea 
            v-model="localPageBreakPrompt"
            class="config-textarea"
            rows="3"
            placeholder="输入智能分段的提示词..."
          ></textarea>
        </div>
        
        <div class="config-section">
          <label class="config-label">表格美化提示词</label>
          <textarea 
            v-model="localTableBeautifyPrompt"
            class="config-textarea"
            rows="3"
            placeholder="输入表格美化的提示词..."
          ></textarea>
        </div>
        
        <div class="config-section">
          <label class="config-label">图片生成提示词</label>
          <textarea 
            v-model="localImageGenerationPrompt"
            class="config-textarea"
            rows="3"
            placeholder="输入图片生成的提示词..."
          ></textarea>
        </div>
        
        <div class="config-actions">
          <button @click="resetToDefault" class="reset-button">
            重置默认
          </button>
          <button @click="saveConfig" class="save-button">
            保存配置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { HelpCircle, X, Plus, Sparkles } from 'lucide-vue-next'

interface Props {
  settings?: {
    aiConfig: {
      pageBreakPrompt: string
      tableBeautifyPrompt: string
      imageGenerationPrompt: string
    }
  }
}

interface Emits {
  (e: 'insertMarker', marker: string): void
  (e: 'updatePrompts', prompts: {
    pageBreakPrompt: string
    tableBeautifyPrompt: string
    imageGenerationPrompt: string
  }): void
  (e: 'aiEnhance'): void
}

const props = withDefaults(defineProps<Props>(), {
  settings: () => ({
    aiConfig: {
      pageBreakPrompt: '请将以下内容按照逻辑结构进行智能分段，每段内容应该完整且独立。在需要分页的地方插入 <!-- PAGE_BREAK --> 标识符。',
      tableBeautifyPrompt: '请美化以下表格的格式和样式，使其更加清晰易读。',
      imageGenerationPrompt: '请根据以下内容生成相应的图片描述。'
    }
  })
})

const emit = defineEmits<Emits>()

const showHelp = ref(false)
const showConfig = ref(false)

// 本地配置状态
const localPageBreakPrompt = ref('')
const localTableBeautifyPrompt = ref('')
const localImageGenerationPrompt = ref('')

const pageBreakMarkers = [
  {
    code: '<!-- PAGE_BREAK -->',
    description: '换页标识符'
  }
]

const insertMarker = (marker: string) => {
  emit('insertMarker', marker)
  showHelp.value = false
}

// 初始化本地配置
const initLocalConfig = () => {
  localPageBreakPrompt.value = props.settings?.aiConfig.pageBreakPrompt || ''
  localTableBeautifyPrompt.value = props.settings?.aiConfig.tableBeautifyPrompt || ''
  localImageGenerationPrompt.value = props.settings?.aiConfig.imageGenerationPrompt || ''
}

// 保存配置
const saveConfig = () => {
  emit('updatePrompts', {
    pageBreakPrompt: localPageBreakPrompt.value,
    tableBeautifyPrompt: localTableBeautifyPrompt.value,
    imageGenerationPrompt: localImageGenerationPrompt.value
  })
  showConfig.value = false
}

// 重置为默认值
const resetToDefault = () => {
  localPageBreakPrompt.value = '请将以下内容按照逻辑结构进行智能分段，每段内容应该完整且独立。在需要分页的地方插入 <!-- PAGE_BREAK --> 标识符。'
  localTableBeautifyPrompt.value = '请美化以下表格的格式和样式，使其更加清晰易读。'
  localImageGenerationPrompt.value = '请根据以下内容生成相应的图片描述。'
}

// 监听配置面板显示状态，初始化本地配置
watch(showConfig, (newVal) => {
  if (newVal) {
    initLocalConfig()
  }
})

// 监听props变化，更新本地配置
watch(() => props.settings?.aiConfig, () => {
  if (showConfig.value) {
    initLocalConfig()
  }
}, { deep: true })
</script>

<style scoped>
.page-break-helper {
  position: relative;
}

.helper-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  color: rgba(59, 130, 246, 1);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  position: relative;
  overflow: hidden;
}

.helper-button:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
  border-color: rgba(59, 130, 246, 0.5);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
}

.helper-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.helper-button:hover::before {
  left: 100%;
}

.config-button {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.config-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.helper-panel {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 50;
  width: 400px;
  max-width: 90vw;
  margin-top: 0.5rem;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(59, 130, 246, 0.1);
  overflow: hidden;
}

.config-panel {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 50;
  width: 450px;
  max-width: 90vw;
  margin-top: 0.5rem;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(59, 130, 246, 0.1);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1), 
    rgba(139, 92, 246, 0.1)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.close-button {
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.panel-content {
  padding: 1.25rem;
}

.description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.markers-list {
  margin-bottom: 1.5rem;
}

.config-section {
  margin-bottom: 1.5rem;
}

.config-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.config-textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;
}

.config-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.config-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reset-button {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.save-button {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8));
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-button:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(139, 92, 246, 1));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.marker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.marker-item:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.marker-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.marker-item:hover::before {
  transform: scaleX(1);
}

.marker-info {
  flex: 1;
}

.marker-code {
  display: block;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.8125rem;
  color: rgba(34, 197, 94, 1);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08));
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.375rem;
  border: 1px solid rgba(34, 197, 94, 0.2);
  font-weight: 500;
  letter-spacing: 0.025em;
}

.marker-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.insert-button {
  padding: 0.625rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 8px;
  color: rgba(59, 130, 246, 1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.insert-button:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.3));
  color: #ffffff;
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.insert-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.insert-button:active::after {
  width: 100px;
  height: 100px;
}

.usage-example {
  margin-bottom: 1.5rem;
}

.example-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.example-code {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0;
  overflow-x: auto;
  line-height: 1.4;
}

.tips {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.tips-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(59, 130, 246, 0.9);
  margin: 0 0 0.5rem 0;
}

.tips-list {
  margin: 0;
  padding-left: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.tips-list li {
  margin-bottom: 0.25rem;
}

.tips-list code {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.75rem;
  color: rgba(34, 197, 94, 0.8);
  background: rgba(34, 197, 94, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .helper-panel {
    width: 350px;
    right: -50px;
  }
  
  .config-panel {
    width: 350px;
    right: -50px;
  }
  
  .panel-content {
    padding: 1rem;
  }
  
  .marker-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .insert-button {
    align-self: flex-end;
  }
  
  .config-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .reset-button,
  .save-button {
    width: 100%;
  }
}
</style>