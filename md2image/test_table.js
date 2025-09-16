// 测试实际的分页逻辑
const testTable = `| 特征 | 传统（向量）RAG                | 图RAG                      | Agentic RAG                            | 
 | ------ | -------------------------------- | ---------------------------- | ---------------------------------------- | 
 | **核心原理**     | 语义相似性搜索                 | 关系型与结构化检索         | 自主任务编排与问题解决                 | 
 | **工作流**     | 线性、静态、预定义<sup>7</sup>             | 结构化、模式绑定<sup>11</sup>           | 动态、自适应、多步骤、迭代式<sup>7</sup>           | 
 | **推理类型**     | 信息综合                       | 多跳、关系型推理<sup>17</sup>           | 元推理、规划、分解<sup>14</sup>                     | 
 | **数据源**     | 单一向量数据库<sup>9</sup>                 | 知识图谱 + 向量数据库<sup>6</sup>      | 多个异构数据源（数据库、API、网络）<sup>19</sup>    | 
 | **工具集成**     | 无                             | 与图数据库查询语言紧密耦合 | 核心特性；动态工具选择与使用<sup>14</sup>           | 
 | **适应性**     | 低；静态流程<sup>9</sup>                   | 中；可更新图，但流程固定   | 高；从交互中学习，自适应策略<sup>9</sup>           | 
 | **可解释性**     | 低；基于向量邻近度             | 高；可通过图路径追溯<sup>15</sup>       | 中至低；因代理的"思考过程"可能不透明<sup>12</sup> | 
 | **实施复杂性**     | 低                             | 高（需图谱建模）<sup>11</sup>           | 非常高（需代理/工具设计、编排）<sup>12</sup>        | 
 | **运营成本**     | 低（LLM调用/Token较少）<sup>22</sup>        | 中（图数据库成本）         | 高（推理、工具使用的多次LLM调用）<sup>28</sup>      | 
 | **响应延迟**     | 低                             | 中至高（复杂查询）         | 高（多个串行步骤）<sup>27</sup>                     | 
 | **主要用例**     | 问答、文档搜索、简单聊天机器人<sup>11</sup> | 欺诈检测、供应链、科学研究<sup>11</sup> | 企业助理、自动化商业智能、复杂支持<sup>30</sup>     |`;

// 模拟HomePage.vue中的splitIntoPages函数
function splitIntoPages(content) {
  if (!content.trim()) return [];
  
  // 定义特殊的换页标识符
  const pageBreakMarkers = [
    '<!-- PAGE_BREAK -->',
    '<!-- NEWPAGE -->',
    '<!-- 换页 -->',
    '<!-- 分页 -->'
  ];
  
  // 检查是否包含任何换页标识符
  const hasPageBreak = pageBreakMarkers.some(marker => content.includes(marker));
  
  console.log('检查换页标识符:', hasPageBreak);
  
  if (hasPageBreak) {
    console.log('发现换页标识符，使用换页分割');
    const pageBreakRegex = /<!--\s*(PAGE_BREAK|NEWPAGE|换页|分页)\s*-->/gi;
    const parts = content.split(pageBreakRegex);
    const pages = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]?.trim();
      if (part && 
          part.length > 0 && 
          !['PAGE_BREAK', 'NEWPAGE', '换页', '分页'].includes(part.toUpperCase())) {
        pages.push(part);
      }
    }
    
    return pages.filter(page => page.length > 0);
  }
  
  console.log('未发现换页标识符，使用智能分页');
  
  // 智能分页：基于内容长度和结构
  const lines = content.split('\n');
  const pages = [];
  let currentPage = [];
  let currentLength = 0;
  const maxPageLength = 1500;
  const minPageLength = 300;
  
  console.log(`总行数: ${lines.length}`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length;
    
    console.log(`第${i + 1}行: "${line}" (长度: ${lineLength})`);
    
    // 检查是否是一级标题
    if (line.startsWith('# ')) {
      console.log('  -> 发现一级标题');
      if (currentPage.length > 0 && currentLength > minPageLength) {
        console.log('  -> 开始新页面（一级标题）');
        pages.push(currentPage.join('\n').trim());
        currentPage = [line];
        currentLength = lineLength;
        continue;
      }
    }
    
    // 检查是否需要分页
    if (currentLength > maxPageLength && 
        (line.startsWith('#') || line.trim() === '') && 
        currentPage.length > 0) {
      console.log('  -> 开始新页面（长度限制）');
      pages.push(currentPage.join('\n').trim());
      currentPage = line.trim() === '' ? [] : [line];
      currentLength = line.trim() === '' ? 0 : lineLength;
      continue;
    }
    
    currentPage.push(line);
    currentLength += lineLength + 1;
    console.log(`  -> 当前页面长度: ${currentLength}`);
  }
  
  // 添加最后一页
  if (currentPage.length > 0) {
    console.log('添加最后一页');
    pages.push(currentPage.join('\n').trim());
  }
  
  console.log(`最终分页数: ${pages.length}`);
  return pages.length > 0 ? pages : [content.trim()];
}

// 模拟replaceTablesWithPlaceholders函数
function replaceTablesWithPlaceholders(content) {
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

console.log('=== 完整分页流程测试 ===');
console.log('\n1. 原始内容:');
console.log(`内容长度: ${testTable.length}`);

console.log('\n2. 分页处理:');
const rawPages = splitIntoPages(testTable);

console.log('\n3. 表格提取处理:');
rawPages.forEach((pageContent, index) => {
  console.log(`\n页面 ${index + 1}:`);
  console.log(`内容长度: ${pageContent.length}`);
  console.log('内容预览:', pageContent.substring(0, 100) + '...');
  
  const { content: processedContent, tables } = replaceTablesWithPlaceholders(pageContent);
  console.log(`提取到 ${tables.length} 个表格`);
  console.log('处理后内容:', processedContent.substring(0, 100) + '...');
});

console.log('\n4. 结果总结:');
console.log(`总页数: ${rawPages.length}`);
if (rawPages.length > 1) {
  console.log('❌ 表格被意外分页了!');
  rawPages.forEach((page, index) => {
    console.log(`页面 ${index + 1} 长度: ${page.length}`);
  });
} else {
  console.log('✅ 表格保持在同一页');
}