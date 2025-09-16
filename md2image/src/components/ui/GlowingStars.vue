<template>
  <div class="h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden rounded-md">
    <div class="w-full absolute inset-0 h-screen">
      <div 
        v-for="star in stars" 
        :key="star.id"
        class="absolute h-[1px] w-[1px] bg-white rounded-full animate-pulse"
        :style="{
          top: `${star.top}%`,
          left: `${star.left}%`,
          animationDelay: `${star.delay}s`,
          animationDuration: `${star.duration}s`
        }"
      ></div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Star {
  id: number
  top: number
  left: number
  delay: number
  duration: number
}

const stars = ref<Star[]>([])

const generateStars = () => {
  const newStars: Star[] = []
  for (let i = 0; i < 100; i++) {
    newStars.push({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2
    })
  }
  stars.value = newStars
}

onMounted(() => {
  generateStars()
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>