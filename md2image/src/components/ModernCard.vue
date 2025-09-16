<template>
  <div class="modern-card" :class="cardClasses">
    <!-- 背景装饰 -->
    <div class="card-background">
      <div class="gradient-overlay"></div>
      <div class="noise-texture"></div>
    </div>
    
    <!-- 卡片头部 -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>
    
    <!-- 卡片内容 -->
    <div class="card-body">
      <slot></slot>
    </div>
    
    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
    
    <!-- 装饰性元素 -->
    <div class="decorative-elements">
      <div class="corner-accent top-left"></div>
      <div class="corner-accent top-right"></div>
      <div class="corner-accent bottom-left"></div>
      <div class="corner-accent bottom-right"></div>
      
      <!-- 动态光效 -->
      <div v-if="glowing" class="glow-effects">
        <div class="glow-line glow-top"></div>
        <div class="glow-line glow-right"></div>
        <div class="glow-line glow-bottom"></div>
        <div class="glow-line glow-left"></div>
        <div class="glow-orb glow-orb-1"></div>
        <div class="glow-orb glow-orb-2"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  variant?: 'default' | 'glass' | 'gradient' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  glowing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  glowing: false
})

const cardClasses = computed(() => {
  const classes = []
  
  classes.push(`variant-${props.variant}`)
  classes.push(`size-${props.size}`)
  
  if (props.glowing) {
    classes.push('glowing')
  }
  
  return classes.join(' ')
})
</script>

<style scoped>
.modern-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

/* 背景层 */
.card-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.noise-texture {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* 内容区域 */
.card-header,
.card-body,
.card-footer {
  position: relative;
  z-index: 1;
}

.card-header {
  padding: 1.5rem 1.5rem 0;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 0 1.5rem 1.5rem;
}

/* 装饰性元素 */
.decorative-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.corner-accent {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.corner-accent.top-left {
  top: 12px;
  left: 12px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.corner-accent.top-right {
  top: 12px;
  right: 12px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.corner-accent.bottom-left {
  bottom: 12px;
  left: 12px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.corner-accent.bottom-right {
  bottom: 12px;
  right: 12px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}

/* 变体样式 */
.variant-default {
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.variant-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.variant-gradient {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.variant-minimal {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* 尺寸变体 */
.size-sm .card-header,
.size-sm .card-body,
.size-sm .card-footer {
  padding: 1rem;
}

.size-sm .card-header {
  padding-bottom: 0;
}

.size-sm .card-footer {
  padding-top: 0;
}

.size-lg .card-header,
.size-lg .card-body,
.size-lg .card-footer {
  padding: 2rem;
}

.size-lg .card-header {
  padding-bottom: 0;
}

.size-lg .card-footer {
  padding-top: 0;
}

/* 发光效果 */
.glowing {
  box-shadow: 
    0 0 30px rgba(59, 130, 246, 0.4),
    0 0 60px rgba(59, 130, 246, 0.2),
    0 0 100px rgba(59, 130, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 20px rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.glowing .corner-accent {
  border-color: rgba(59, 130, 246, 0.7);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}

/* 动态光效 */
.glow-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.glow-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
  animation: glow-pulse 3s ease-in-out infinite;
}

.glow-top {
  top: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  animation-delay: 0s;
}

.glow-right {
  top: 20%;
  bottom: 20%;
  right: 0;
  width: 2px;
  background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.8), transparent);
  animation-delay: 0.75s;
}

.glow-bottom {
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  animation-delay: 1.5s;
}

.glow-left {
  top: 20%;
  bottom: 20%;
  left: 0;
  width: 2px;
  background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.8), transparent);
  animation-delay: 2.25s;
}

.glow-orb {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(59, 130, 246, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
  animation: glow-orb-float 4s ease-in-out infinite;
}

.glow-orb-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.glow-orb-2 {
  bottom: 10%;
  right: 10%;
  animation-delay: 2s;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scaleX(0.8);
  }
  50% {
    opacity: 1;
    transform: scaleX(1.2);
  }
}

@keyframes glow-orb-float {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1) translateY(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.5) translateY(-2px);
  }
}

/* 悬停效果 */
.modern-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.modern-card:hover .corner-accent {
  border-color: rgba(255, 255, 255, 0.4);
}

.glowing:hover {
  box-shadow: 
    0 0 30px rgba(59, 130, 246, 0.4),
    0 0 60px rgba(59, 130, 246, 0.2),
    0 10px 25px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-header,
  .card-body,
  .card-footer {
    padding: 1rem;
  }
  
  .card-header {
    padding-bottom: 0;
  }
  
  .card-footer {
    padding-top: 0;
  }
  
  .corner-accent {
    width: 16px;
    height: 16px;
  }
}
</style>