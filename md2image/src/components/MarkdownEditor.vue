<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTheme } from '@/composables/useTheme'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

// 插入文本到编辑器
const insertText = (text: string) => {
  if (!editorView) return
  
  const selection = editorView.state.selection.main
  const transaction = editorView.state.update({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: text
    },
    selection: {
      anchor: selection.from + text.length
    }
  })
  
  editorView.dispatch(transaction)
  editorView.focus()
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { isDark } = useTheme()
const editorContainer = ref<HTMLElement>()
let editorView: EditorView | null = null

// 创建编辑器状态
const createEditorState = (content: string, dark: boolean) => {
  const extensions = [
    basicSetup,
    markdown(),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString()
        if (newContent !== props.modelValue) {
          emit('update:modelValue', newContent)
        }
      }
    }),
    EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      },
      '.cm-content': {
        padding: '16px',
        minHeight: '100%',
        lineHeight: '1.6',
      },
      '.cm-focused': {
        outline: 'none',
      },
      '.cm-editor': {
        height: '100%',
      },
      '.cm-scroller': {
        height: '100%',
      },
      // 亮色模式样式
      ...(!dark && {
        '&': {
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
        },
        '.cm-content': {
          caretColor: 'var(--color-text)',
        },
        '.cm-cursor': {
          borderLeftColor: 'var(--color-text)',
        },
        '.cm-selectionBackground': {
          backgroundColor: 'var(--color-border)',
        },
        '.cm-focused .cm-selectionBackground': {
          backgroundColor: 'var(--color-border)',
        },
        '.cm-gutters': {
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-secondary)',
          border: 'none',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'var(--color-border)',
        },
        '.cm-activeLine': {
          backgroundColor: 'transparent',
        },
      }),
    }),
  ]

  // 暗色模式添加 oneDark 主题
  if (dark) {
    extensions.push(oneDark)
  }

  return EditorState.create({
    doc: content,
    extensions,
  })
}

// 初始化编辑器
const initEditor = async () => {
  if (!editorContainer.value) return

  // 清理现有编辑器
  if (editorView) {
    editorView.destroy()
  }

  await nextTick()

  const state = createEditorState(props.modelValue, isDark.value)
  editorView = new EditorView({
    state,
    parent: editorContainer.value,
  })
}

// 更新编辑器内容
const updateEditorContent = (newContent: string) => {
  if (!editorView) return

  const currentContent = editorView.state.doc.toString()
  if (currentContent !== newContent) {
    const transaction = editorView.state.update({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: newContent,
      },
    })
    editorView.dispatch(transaction)
  }
}

// 监听主题变化
watch(isDark, async () => {
  await initEditor()
}, { flush: 'post' })

// 监听内容变化
watch(
  () => props.modelValue,
  (newValue) => {
    updateEditorContent(newValue)
  }
)

// 组件挂载时初始化编辑器
onMounted(() => {
  initEditor()
})

// 组件卸载时清理编辑器
const cleanup = () => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
}

// 暴露方法
defineExpose({
  cleanup,
  insertText,
})
</script>

<template>
  <div 
    ref="editorContainer" 
    class="h-full w-full overflow-hidden rounded-lg border border-border bg-surface"
  />
</template>

<style scoped>
.editor-container {
  height: 100%;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-background);
}

@media (min-width: 768px) {
  .editor-container {
    border-radius: 8px;
  }
}

:deep(.cm-editor) {
  height: 100%;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.4;
}

@media (min-width: 768px) {
  :deep(.cm-editor) {
    font-size: 14px;
    line-height: 1.5;
  }
}

:deep(.cm-focused) {
  outline: none;
  border-color: var(--color-primary);
}

:deep(.cm-content) {
  padding: 12px;
  min-height: 100%;
}

@media (min-width: 768px) {
  :deep(.cm-content) {
    padding: 16px;
  }
}

:deep(.cm-line) {
  padding: 0;
}

:deep(.cm-cursor) {
  border-left-color: var(--color-text);
}

:deep(.cm-selectionBackground) {
  background: var(--color-primary) !important;
  opacity: 0.2;
}

/* 语法高亮样式 */
:deep(.cm-editor .cm-scroller) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

:deep(.tok-heading) {
  font-weight: bold;
  color: var(--color-primary);
}

:deep(.tok-strong) {
  font-weight: bold;
}

:deep(.tok-emphasis) {
  font-style: italic;
}

:deep(.tok-link) {
  color: var(--color-primary);
  text-decoration: underline;
}

:deep(.tok-monospace) {
  background: var(--color-surface);
  padding: 1px 3px;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
}

@media (min-width: 768px) {
  :deep(.tok-monospace) {
    padding: 2px 4px;
    border-radius: 3px;
  }
}

:deep(.tok-strikethrough) {
  text-decoration: line-through;
}

:deep(.tok-quote) {
  color: var(--color-muted);
  font-style: italic;
}

:deep(.tok-list) {
  color: var(--color-primary);
}

:deep(.tok-meta) {
  color: var(--color-muted);
}
</style>