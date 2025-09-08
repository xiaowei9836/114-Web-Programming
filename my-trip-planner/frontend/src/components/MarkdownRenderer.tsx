import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  fontClass?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '', fontClass = '' }) => {
  // 預處理 Markdown 內容，修復連續表格問題
  const preprocessContent = (markdown: string): string => {
    let processed = markdown;
    
    // 1. 標準化表格格式
    processed = processed.replace(/\|\s*\n\s*\|/g, '|\n|');
    
    // 2. 修復表格結構問題
    const lines = processed.split('\n');
    const processedLines: string[] = [];
    let inTable = false;
    let tableColumns = 0;
    let tableStartIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
      
      if (isTableRow && !inTable) {
        // 開始新表格
        inTable = true;
        tableStartIndex = i;
        tableColumns = (line.match(/\|/g) || []).length - 1;
        processedLines.push(line);
      } else if (isTableRow && inTable) {
        // 繼續表格
        const currentColumns = (line.match(/\|/g) || []).length - 1;
        
        if (currentColumns === tableColumns) {
          // 列數匹配，直接添加
          processedLines.push(line);
        } else if (currentColumns < tableColumns) {
          // 列數不足，填充空列
          const parts = line.split('|').filter(part => part.trim());
          while (parts.length < tableColumns) {
            parts.push(' ');
          }
          processedLines.push('|' + parts.join('|') + '|');
        } else {
          // 列數過多，截斷到正確數量
          const parts = line.split('|').filter(part => part.trim());
          processedLines.push('|' + parts.slice(0, tableColumns).join('|') + '|');
        }
      } else if (!isTableRow && inTable) {
        // 檢查是否為表格分隔符行
        if (line.trim().match(/^\|[\s\-:]+\|$/)) {
          // 這是分隔符行，確保列數正確
          const separators = Array(tableColumns).fill('---').join('|');
          processedLines.push('|' + separators + '|');
        } else {
          // 表格結束，添加空行分隔
          inTable = false;
          processedLines.push('');
          processedLines.push(line);
        }
      } else {
        // 非表格行
        processedLines.push(line);
      }
    }
    
    // 3. 修復常見的表格格式問題
    processed = processedLines.join('\n');
    
    // 修復缺少分隔符的表格
    processed = processed.replace(/(\|\s*[^|\n]*\|\s*\n\s*\|[^|\n]*\|\s*\n\s*\|)/g, (match) => {
      // 檢查是否缺少分隔符行
      const lines = match.split('\n');
      if (lines.length >= 2 && !lines[1].trim().match(/^[\|\-\s:]+$/)) {
        // 缺少分隔符，插入一個
        const columns = (lines[0].match(/\|/g) || []).length - 1;
        const separators = Array(columns).fill('---').join('|');
        return lines[0] + '\n|' + separators + '|\n' + lines.slice(1).join('\n');
      }
      return match;
    });
    
    // 4. 在連續表格之間添加更清晰的分隔
    processed = processed.replace(/(\|\s*\n\s*\|[^|\n]*\|\s*\n\s*\|)/g, '\n\n$1');
    
    // 5. 清理多餘的空行
    processed = processed.replace(/\n{3,}/g, '\n\n');
    
    return processed;
  };

  const processedContent = preprocessContent(content);

  return (
    <div 
      className={`markdown-content text-left ${className} ${fontClass}`}
      style={{
        textAlign: 'left',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap'
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // 自定義表格樣式
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <table className="min-w-full text-xs" {...props}>
              {children}
            </table>
          </div>
        ),
        // 自定義表格標題行
        thead: ({ children, ...props }) => (
          <thead className="bg-gray-100" {...props}>
            {children}
          </thead>
        ),
        // 自定義表格標題單元格
        th: ({ children, ...props }) => (
          <th className={`px-2 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-300 ${fontClass}`} {...props}>
            {children}
          </th>
        ),
        // 自定義表格數據行
        tbody: ({ children, ...props }) => (
          <tbody className="bg-white" {...props}>
            {children}
          </tbody>
        ),
        // 自定義表格數據單元格
        td: ({ children, ...props }) => (
          <td className={`px-2 py-2 text-xs text-gray-800 border-b border-gray-200 ${fontClass}`} {...props}>
            {children}
          </td>
        ),
        // 自定義標題樣式
        h1: ({ children, ...props }) => (
          <h1 className={`text-lg font-bold text-gray-900 mt-3 mb-2 ${fontClass}`} {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className={`text-base font-bold text-gray-800 mt-3 mb-2 ${fontClass}`} {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className={`text-sm font-semibold text-gray-700 mt-2 mb-1 ${fontClass}`} {...props}>
            {children}
          </h3>
        ),
        h4: ({ children, ...props }) => (
          <h4 className={`text-sm font-semibold text-gray-600 mt-2 mb-1 ${fontClass}`} {...props}>
            {children}
          </h4>
        ),
        // 自定義段落樣式
        p: ({ children, ...props }) => (
          <p className={`mb-2 text-gray-700 leading-relaxed text-sm text-left ${fontClass}`} {...props}>
            {children}
          </p>
        ),
        // 自定義列表樣式
        ul: ({ children, ...props }) => (
          <ul className={`list-disc list-inside mb-2 space-y-1 text-gray-700 text-sm text-left ${fontClass}`} {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className={`list-decimal list-inside mb-2 space-y-1 text-gray-700 text-sm text-left ${fontClass}`} {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className={`text-gray-700 text-sm text-left ${fontClass}`} {...props}>
            {children}
          </li>
        ),
        // 自定義強調樣式
        strong: ({ children, ...props }) => (
          <strong className={`font-semibold text-gray-900 ${fontClass}`} {...props}>
            {children}
          </strong>
        ),
        em: ({ children, ...props }) => (
          <em className={`italic text-gray-800 ${fontClass}`} {...props}>
            {children}
          </em>
        ),
        // 自定義代碼樣式
        code: ({ children, ...props }) => (
          <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono" {...props}>
            {children}
          </code>
        ),
        // 自定義引用樣式
        blockquote: ({ children, ...props }) => (
          <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-2 bg-indigo-50 text-gray-700 italic text-left" {...props}>
            {children}
          </blockquote>
        ),
        // 自定義分隔線樣式
        hr: ({ ...props }) => (
          <hr className="my-6 border-gray-300" {...props} />
        ),
        // 自定義連結樣式
        a: ({ children, href, ...props }) => (
          <a 
            href={href} 
            className="text-indigo-600 hover:text-indigo-800 underline" 
            target="_blank" 
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
      </div>
  );
};

export default MarkdownRenderer;
