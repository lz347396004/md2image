<template>
  <div class="glowing-card-container" :class="containerClass">
    <!-- 发光边框效果 -->
    <div class="glowing-border" :class="glowClass"></div>
    
    <!-- 卡片内容 -->
    <div class="card-content" :class="contentClass">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  glowColor?: string
  intensity?: 'low' | 'medium' | 'high'
  rounded?: boolean
  containerClass?: string
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  glowColor: 'blue',
  intensity: 'medium',
  rounded: true,
  containerClass: '',
  contentClass: ''
})

const glowClass = computed(() => {
  const classes = []
  
  // 发光颜色
  switch (props.glowColor) {
    case 'blue':
      classes.push('glow-blue')
      break
    case 'purple':
      classes.push('glow-purple')
      break
    case 'green':
      classes.push('glow-green')
      break
    case 'orange':
      classes.push('glow-orange')
      break
    default:
      classes.push('glow-blue')
  }
  
  // 发光强度
  classes.push(`intensity-${props.intensity}`)
  
  // 圆角
  if (props.rounded) {
    classes.push('rounded')
  }
  
  return classes.join(' ')
})
</script>

<style scoped>
.glowing-card-container {
  position: relative;
  display: inline-block;
}

.glowing-border {
  position: absolute;
  inset: 0;
  padding: 2px;
  background: linear-gradient(45deg, transparent, currentColor, transparent);
  border-radius: inherit;
  opacity: 0.8;
  animation: rotate 3s linear infinite;
}

.glowing-border.rounded {
  border-radius: 12px;
}

.card-content {
  position: relative;
  background: #0a0a0a;
  border-radius: inherit;
  padding: 1.5rem;
  z-index: 1;
}

.glowing-border.rounded + .card-content {
  border-radius: 10px;
}

/* 发光颜色变体 */
.glow-blue {
  color: #3b82f6;
  filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
}

.glow-purple {
  color: #8b5cf6;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
}

.glow-green {
  color: #10b981;
  filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.5));
}

.glow-orange {
  color: #f59e0b;
  filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.5));
}

/* 发光强度变体 */
.intensity-low {
  opacity: 0.4;
}

.intensity-medium {
  opacity: 0.7;
}

.intensity-high {
  opacity: 1;
}

/* 旋转动画 */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 悬停效果 */
.glowing-card-container:hover .glowing-border {
  opacity: 1;
  filter: brightness(1.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-content {
    padding: 1rem;
  }
}
</style>