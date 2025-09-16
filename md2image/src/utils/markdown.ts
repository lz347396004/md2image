import MarkdownIt from 'markdown-it'
// markdown-it 已内置表格支持，无需额外插件

// 创建MarkdownIt实例，优化配置
const md = new MarkdownIt({
  html: true,        // 允许HTML标签
  breaks: true,      // 启用自动换行
  linkify: true,     // 自动识别链接
  typographer: true, // 启用排版增强功能
  quotes: '""'
})

// 启用所有核心插件
md.enable(['emphasis', 'strikethrough', 'table', 'linkify'])

// 使用 GFM 插件支持 GitHub Flavored Markdown
// 表格支持已内置在 markdown-it 中

// 自定义强调文本渲染（加粗）
md.renderer.rules.strong_open = function () {
  return '<strong class="markdown-strong">'
}

md.renderer.rules.strong_close = function () {
  return '</strong>'
}

// 自定义斜体文本渲染
md.renderer.rules.em_open = function () {
  return '<em class="markdown-em">'
}

md.renderer.rules.em_close = function () {
  return '</em>'
}

// 自定义水平线渲染
md.renderer.rules.hr = function () {
  return '<hr />'
}

// 自定义代码块渲染
md.renderer.rules.code_block = function (tokens, idx, options, env, renderer) {
  const token = tokens[idx]
  const langName = token.info ? ` class="language-${token.info}"` : ''
  
  return `<pre class="code-block"><code${langName}>${md.utils.escapeHtml(token.content)}</code></pre>`
}

// 自定义围栏代码块渲染
md.renderer.rules.fence = function (tokens, idx, options, env, renderer) {
  const token = tokens[idx]
  const info = token.info ? token.info.trim() : ''
  const langName = info ? ` class="language-${info}"` : ''
  
  return `<pre class="code-block"><code${langName}>${md.utils.escapeHtml(token.content)}</code></pre>`
}

// 提取表格函数
export const extractTables = (content: string): { tables: string[], content: string } => {
  const tables: string[] = []
  let processedContent = content
  
  // 匹配Markdown表格的正则表达式 - 支持标准markdown表格格式
  // 表格头行：可以有或没有两端的 |
  // 分隔行：支持 |---|---| 或 ---|--- 或 |:---|---:| 等格式
  // 数据行：可以有或没有两端的 |
  const tableRegex = /^\s*\|?.*\|.*\|?\s*$\n^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$\n(^\s*\|?.*\|.*\|?\s*$\n?)*/gm
  
  let match
  let index = 0
  
  while ((match = tableRegex.exec(content)) !== null) {
    const tableContent = match[0]
    tables.push(tableContent)
    
    // 用占位符替换表格
    processedContent = processedContent.replace(tableContent, `[TABLE_PLACEHOLDER_${index}]`)
    index++
  }
  
  return { tables, content: processedContent }
}

// 用占位符替换表格函数
export const replaceTablesWithPlaceholders = (content: string): { tables: string[], content: string } => {
  return extractTables(content)
}

// 导出渲染函数
export const renderMarkdown = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return ''
  }
  
  try {
    // 渲染Markdown
    const html = md.render(content)
    return html
  } catch (error) {
    console.error('Markdown渲染错误:', error)
    return `<div class="error">Markdown渲染失败</div>`
  }
}

// 导出MarkdownIt实例
export { md }

// 默认导出
export default { renderMarkdown, md, extractTables, replaceTablesWithPlaceholders }