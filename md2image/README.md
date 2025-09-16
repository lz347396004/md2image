# MD2Image - AI 驱动的 Markdown 可视化图文生成器

一个现代化的 Markdown 编辑器和图片生成工具，支持将 Markdown 内容转换为高质量的图片，适用于社交媒体分享、文档展示等场景。

## ✨ 功能特性

### 📝 编辑功能
- **实时预览**: Markdown 内容实时渲染预览
- **多页面管理**: 支持多页面内容编辑和管理
- **语法高亮**: 完整的 Markdown 语法支持
- **自动保存**: 内容自动保存到本地存储

### 🎨 样式定制
- **主题切换**: 支持亮色/暗色模式切换
- **自定义样式**: 支持自定义 CSS 样式
- **字体设置**: 多种字体选择和大小调整
- **预设方案**: 内置多种样式预设方案

### 🖼️ 图片生成
- **高质量输出**: 生成高分辨率 PNG 图片
- **批量下载**: 支持多页面批量导出
- **背景定制**: 支持自定义背景颜色和图片
- **尺寸控制**: 灵活的图片尺寸设置

### 🔧 预览控制
- **缩放功能**: 支持图片缩放查看（5%-300%）
- **适应窗口**: 智能适应容器尺寸
- **拖拽移动**: 支持图片拖拽查看
- **状态锁定**: 预览状态跨页面保持

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **Markdown 解析**: markdown-it
- **图片生成**: modern-screenshot
- **状态管理**: Vue Composition API
- **路由**: Vue Router
- **图标**: Lucide Vue

## 📦 安装运行

### 环境要求
- Node.js >= 16.0.0
- npm 或 yarn 或 pnpm

### 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发运行
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 构建部署
```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

## 🚀 使用说明

### 基本使用
1. 在左侧编辑器中输入 Markdown 内容
2. 右侧实时预览渲染效果
3. 点击"生成图片"按钮生成图片
4. 使用"下载"按钮保存图片

### 多页面管理
1. 点击"添加页面"创建新页面
2. 使用页面导航切换不同页面
3. 支持页面重命名和删除
4. 使用"全部下载"批量导出所有页面

### 样式定制
1. 点击"样式"按钮打开样式面板
2. 选择预设样式方案或自定义设置
3. 调整字体、颜色、间距等参数
4. 实时预览样式效果

### 预览控制
- **缩放**: 使用 +/- 按钮或鼠标滚轮缩放
- **适应窗口**: 点击"适应窗口"按钮自动调整尺寸
- **重置**: 点击"1:1"按钮恢复原始尺寸
- **拖拽**: 按住鼠标拖拽移动图片位置

## 📁 项目结构

```
md2image/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── MarkdownEditor.vue    # Markdown 编辑器
│   │   ├── MarkdownPoster.vue    # 图片生成器
│   │   ├── SettingsDialog.vue    # 设置对话框
│   │   └── ...
│   ├── composables/         # 组合式函数
│   │   └── useTheme.ts          # 主题管理
│   ├── utils/              # 工具函数
│   │   ├── markdown.ts          # Markdown 处理
│   │   └── api.ts              # API 接口
│   ├── pages/              # 页面组件
│   └── style.css           # 全局样式
├── public/                 # 静态资源
└── ...
```

## 🎯 核心特性

### Markdown 支持
- 标题、段落、列表
- 代码块和行内代码
- 表格、链接、图片
- 引用、分割线
- 自定义 HTML 标签

### 图片生成
- 基于 DOM 到图片的转换技术
- 支持复杂样式和布局
- 高质量矢量图形渲染
- 自定义背景和尺寸

### 响应式设计
- 适配桌面和移动设备
- 灵活的布局系统
- 触摸友好的交互

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Markdown 语法指南](https://www.markdownguide.org/)

---

**享受 Markdown 创作的乐趣！** 🎉
