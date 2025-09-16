<script setup lang="ts">
import type { TableData } from '@/types'

interface Props {
  tableData: TableData
  index: number
}

defineProps<Props>()
</script>

<template>
  <div class="table-wrapper">
    <!-- 发光边框效果 -->
    <div class="glow-border"></div>
    
    <div class="table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th v-for="(header, index) in tableData.headers" :key="index" class="table-header">
              <span class="header-content">{{ header }}</span>
              <div class="header-glow"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in tableData.rows" :key="rowIndex" class="table-row">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="table-cell">
              <span class="cell-content">{{ cell }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 装饰性底部 -->
    <div class="table-footer">
      <div class="footer-accent"></div>
      <div class="corner-decorations">
        <div class="corner-dot"></div>
        <div class="corner-dot"></div>
        <div class="corner-dot"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glow-border {
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, 
    transparent, 
    rgba(59, 130, 246, 0.5), 
    rgba(139, 92, 246, 0.5), 
    transparent
  );
  border-radius: 18px;
  opacity: 0.6;
  animation: rotate-glow 4s linear infinite;
  z-index: -1;
}

@keyframes rotate-glow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table-container {
  position: relative;
  overflow-x: auto;
  z-index: 1;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.table-header {
  position: relative;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.2) 0%, 
    rgba(139, 92, 246, 0.2) 100%
  );
  padding: 1.25rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  position: relative;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  z-index: 2;
}

.header-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1), 
    rgba(139, 92, 246, 0.1)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.table-header:hover .header-glow {
  opacity: 1;
}

.table-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-1px);
}

.table-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.table-cell {
  padding: 1rem 1.5rem;
  position: relative;
}

.cell-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.table-footer {
  position: relative;
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(59, 130, 246, 0.8), 
    rgba(139, 92, 246, 0.8), 
    transparent
  );
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.corner-decorations {
  display: flex;
  gap: 0.5rem;
}

.corner-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(45deg, 
    rgba(59, 130, 246, 0.8), 
    rgba(139, 92, 246, 0.8)
  );
  animation: dot-pulse 1.5s ease-in-out infinite;
}

.corner-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.corner-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%, 100% { 
    opacity: 0.4;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 悬停效果增强 */
.table-wrapper:hover .glow-border {
  opacity: 1;
  animation-duration: 2s;
}

.table-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(59, 130, 246, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-header,
  .table-cell {
    padding: 0.875rem 1rem;
  }
  
  .header-content {
    font-size: 0.75rem;
  }
  
  .cell-content {
    font-size: 0.8125rem;
  }
  
  .table-footer {
    padding: 0.75rem 1rem;
  }
}

/* 自定义滚动条 */
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, 
    rgba(59, 130, 246, 0.6), 
    rgba(139, 92, 246, 0.6)
  );
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, 
    rgba(59, 130, 246, 0.8), 
    rgba(139, 92, 246, 0.8)
  );
}
</style>