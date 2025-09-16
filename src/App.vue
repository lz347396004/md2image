<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Markdown to Image Converter</h1>
    <div class="grid grid-cols-2 gap-8">
      <div class="markdown-input">
        <h2 class="text-xl font-semibold mb-4">Input Markdown</h2>
        <textarea
          v-model="markdownText"
          class="w-full h-64 p-4 border rounded"
          placeholder="Enter your markdown here..."
        ></textarea>
        <button
          @click="convertToImage"
          class="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Convert to Image
        </button>
      </div>
      <div class="preview">
        <h2 class="text-xl font-semibold mb-4">Preview</h2>
        <div
          v-if="previewHtml"
          class="preview-content p-4 border rounded"
          v-html="previewHtml"
        ></div>
        <div v-else class="p-4 border rounded text-gray-500">
          Preview will appear here
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const markdownText = ref('')
const previewHtml = ref('')

async function convertToImage() {
  const formData = new FormData()
  const blob = new Blob([markdownText.value], { type: 'text/plain' })
  formData.append('file', blob, 'content.md')

  try {
    const response = await fetch('http://localhost:8000/api/convert', {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    previewHtml.value = data.html
  } catch (error) {
    console.error('Error converting markdown:', error)
  }
}
</script>

<style>
.preview-content {
  max-height: 500px;
  overflow-y: auto;
}
</style>