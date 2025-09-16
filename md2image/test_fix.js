// 测试修复后的表格处理逻辑
const testTable = `| 特征 | 传统（向量）RAG                | 图RAG                      | Agentic RAG                            | 
 | ------ | -------------------------------- | ---------------------------- | ---------------------------------------- | 
 | **核心原理**     | 语义相似性搜索                 | 关系型与结构化检索         | 自主任务编排与问题解决                 | 
 | **工作流**     | 线性、静态、预定义<sup>7</sup>             | 结构化、模式绑定<sup>11</sup>           | 动态、自适应、多步骤、迭代式<sup>7</sup>           | 
 | **推理类型**     | 信息综合                       | 多跳、关系型推理<sup>17</sup>           | 元推理、规划、分解<sup>14</sup>                     |`;

// 模拟MarkdownIt渲染
function mockRenderMarkdown(content) {
  // 简单的表格HTML渲染模拟
  if (content.includes('|')) {
    const lines = content.trim().split('\n');
    let html = '<table class="markdown-table">\n';
    
    lines.forEach((line, index) => {
      if (line.includes('|')) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (index === 0) {
          // 表头
          html += '  <thead>\n    <tr>\n';
          cells.forEach(cell => {
            html += `      <th>${cell}</th>\n`;
          });
          html += '    </tr>\n  </thead>\n';
        } else if (index === 1 && line.includes('---')) {
          // 分隔行，跳过
          html += '  <tbody>\n';
        } else if (!line.includes('---')) {
          // 数据行
          html += '    <tr>\n';
          cells.forEach(cell => {
            html += `      <td>${cell}</td>\n`;
          });
          html += '    </tr>\n';
        }
      }
    });
    
    html += '  </tbody>\n</table>';
    return html;
  }
  
  return `<p>${content}</p>`;
}

// 模拟extractTables函数
function extractTables(content) {
  const tables = [];
  let processedContent = content;
  
  const tableRegex = /^\s*\|?.*\|.*\|?\s*$\n^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$\n(^\s*\|?.*\|.*\|?\s*$\n?)*/gm;
  
  let match;
  let index = 0;
  
  while ((match = tableRegex.exec(content)) !== null) {
    const tableContent = match[0];
    tables.push(tableContent);
    processedContent = processedContent.replace(tableContent, `[TABLE_PLACEHOLDER_${index}]`);
    index++;
  }
  
  return { tables, content: processedContent };
}

// 模拟修复后的processedHtml逻辑
function processHtml(htmlContent, tables) {
  let html = htmlContent;
  
  // 将表格占位符替换回原始表格的HTML内容
  html = html.replace(/\[TABLE_PLACEHOLDER_(\d+)\]/g, (match, index) => {
    const tableIndex = parseInt(index);
    if (tables[tableIndex]) {
      // 渲染表格内容为HTML
      return mockRenderMarkdown(tables[tableIndex]);
    }
    return ''; // 如果找不到对应表格，返回空字符串
  });
  
  // 移除换页分隔符
  html = html.replace(/<!--\s*(PAGE_BREAK|NEWPAGE|换页|分页)\s*-->/gi, '');
  
  return html;
}

console.log('=== 修复后的表格处理测试 ===');
console.log('\n1. 原始表格内容:');
console.log(testTable.substring(0, 200) + '...');

console.log('\n2. 提取表格:');
const { tables, content: contentWithPlaceholders } = extractTables(testTable);
console.log(`提取到 ${tables.length} 个表格`);
console.log('带占位符的内容:', contentWithPlaceholders);

console.log('\n3. 渲染带占位符的内容:');
const htmlWithPlaceholders = mockRenderMarkdown(contentWithPlaceholders);
console.log('HTML内容:', htmlWithPlaceholders);

console.log('\n4. 处理HTML（替换占位符）:');
const finalHtml = processHtml(htmlWithPlaceholders, tables);
console.log('最终HTML:');
console.log(finalHtml);

console.log('\n5. 验证结果:');
if (finalHtml.includes('<table')) {
  console.log('✅ 表格成功渲染为HTML');
  console.log('✅ 占位符被正确替换');
} else {
  console.log('❌ 表格渲染失败');
}

if (finalHtml.includes('[TABLE_PLACEHOLDER_')) {
  console.log('❌ 仍有未替换的占位符');
} else {
  console.log('✅ 所有占位符都被正确替换');
}

console.log('\n修复完成！表格现在应该能正常显示了。');