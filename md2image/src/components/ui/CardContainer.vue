<template>
  <div 
    ref="containerRef"
    class="py-20 flex items-center justify-center"
    :style="{
      perspective: '1000px'
    }"
  >
    <div
      ref="cardRef"
      class="flex items-center justify-center relative transition-all duration-200 ease-linear"
      :style="{
        transform: `rotateY(${rotateX}deg) rotateX(${rotateY}deg)`,
        transformStyle: 'preserve-3d'
      }"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  className?: string
  containerClassName?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  containerClassName: ''
})

const containerRef = ref<HTMLElement>()
const cardRef = ref<HTMLElement>()
const rotateX = ref(0)
const rotateY = ref(0)
const isMouseEntered = ref(false)

const handleMouseMove = (e: MouseEvent) => {
  if (!isMouseEntered.value || !containerRef.value) return
  
  const { left, top, width, height } = containerRef.value.getBoundingClientRect()
  const x = (e.clientX - left - width / 2) / 25
  const y = (e.clientY - top - height / 2) / 25
  rotateY.value = x
  rotateX.value = -y
}

const handleMouseEnter = () => {
  isMouseEntered.value = true
}

const handleMouseLeave = () => {
  isMouseEntered.value = false
  rotateX.value = 0
  rotateY.value = 0
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('mousemove', handleMouseMove)
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<style scoped>
.card-container {
  perspective: 1000px;
}
</style>