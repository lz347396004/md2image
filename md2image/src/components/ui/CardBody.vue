<template>
  <div
    :class="cn(
      'h-96 w-96 p-4 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]',
      className
    )"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/utils/cn'

interface Props {
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
})
</script>