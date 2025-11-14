export function markdownToHtml(markdown: string): string {
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Code blocks
  html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')

  // Lists
  const lines = html.split('\n')
  let inList = false
  let inOrderedList = false
  const processedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Unordered list
    if (line.match(/^- /)) {
      if (!inList) {
        processedLines.push('<ul>')
        inList = true
      }
      line = '<li>' + line.substring(2) + '</li>'
    } else if (inList) {
      processedLines.push('</ul>')
      inList = false
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      if (!inOrderedList) {
        processedLines.push('<ol>')
        inOrderedList = true
      }
      line = '<li>' + line.replace(/^\d+\. /, '') + '</li>'
    } else if (inOrderedList) {
      processedLines.push('</ol>')
      inOrderedList = false
    }

    // Paragraphs
    if (line.trim() && !line.match(/^<[hul]/) && !line.match(/<\/[hul]/)) {
      line = '<p>' + line + '</p>'
    }

    processedLines.push(line)
  }

  if (inList) processedLines.push('</ul>')
  if (inOrderedList) processedLines.push('</ol>')

  html = processedLines.join('\n')

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p>(<[hul])/g, '$1')
  html = html.replace(/(<\/[hulo]l>)<\/p>/g, '$1')

  return html
}
