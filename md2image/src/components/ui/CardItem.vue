<template>
  <div
    :class="cn(className)"
    :style="{
      transform: `translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/utils/cn'

interface Props {
  as?: string
  className?: string
  translateX?: number
  translateY?: number
  translateZ?: number
  rotateX?: number
  rotateY?: number
  rotateZ?: number
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  className: '',
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0
})
</script>