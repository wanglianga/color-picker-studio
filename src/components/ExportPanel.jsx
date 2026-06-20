import React, { useState } from 'react'
import { formatColor, rgbToHsl } from '../utils/colorUtils.js'
import './ExportPanel.css'

function ExportPanel({ palettes }) {
  const [selectedPalette, setSelectedPalette] = useState(palettes[0]?.id || null)
  const [exportFormat, setExportFormat] = useState('css')
  const [prefix, setPrefix] = useState('--color-')
  const [exportHistory, setExportHistory] = useState([])

  const currentPalette = palettes.find(p => p.id === selectedPalette)

  const generateCSSVariables = () => {
    if (!currentPalette || currentPalette.colors.length === 0) return ''
    
    const variables = currentPalette.colors.map((color, index) => {
      const varName = prefix + (color.name || `color-${index + 1}`).toLowerCase().replace(/\s+/g, '-')
      return `  ${varName}: ${color.hex};`
    }).join('\n')
    
    return `:root {\n${variables}\n}`
  }

  const generateSCSS = () => {
    if (!currentPalette || currentPalette.colors.length === 0) return ''
    
    const variables = currentPalette.colors.map((color, index) => {
      const varName = prefix.replace('--', '$') + (color.name || `color-${index + 1}`).toLowerCase().replace(/\s+/g, '-')
      return `${varName}: ${color.hex};`
    }).join('\n')
    
    return variables
  }

  const generateJSON = () => {
    if (!currentPalette || currentPalette.colors.length === 0) return '[]'
    
    const colors = currentPalette.colors.map((color) => ({
      name: color.name,
      hex: color.hex,
      rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
      hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
      source: color.source || ''
    }))
    
    return JSON.stringify({
      palette: currentPalette.name,
      colors: colors
    }, null, 2)
  }

  const generateTailwind = () => {
    if (!currentPalette || currentPalette.colors.length === 0) return ''
    
    const colors = currentPalette.colors.map((color, index) => {
      const key = (color.name || `color-${index + 1}`).toLowerCase().replace(/\s+/g, '-')
      return `    '${key}': '${color.hex}',`
    }).join('\n')
    
    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {\n${colors}\n      }
    }
  }
}`
  }

  const getExportContent = () => {
    switch (exportFormat) {
      case 'css': return generateCSSVariables()
      case 'scss': return generateSCSS()
      case 'json': return generateJSON()
      case 'tailwind': return generateTailwind()
      default: return generateCSSVariables()
    }
  }

  const copyToClipboard = async () => {
    const content = getExportContent()
    if (window.electronAPI?.clipboard) {
      await window.electronAPI.clipboard.copy(content)
      
      const record = {
        id: Date.now(),
        palette: currentPalette?.name || '',
        format: exportFormat,
        timestamp: Date.now()
      }
      setExportHistory(prev => [record, ...prev].slice(0, 10))
    }
  }

  const downloadFile = async () => {
    if (!window.electronAPI?.dialog) return

    const extensions = {
      css: 'css',
      scss: 'scss',
      json: 'json',
      tailwind: 'js'
    }

    const result = await window.electronAPI.dialog.save({
      defaultPath: `${currentPalette?.name || 'palette'}.${extensions[exportFormat]}`,
      filters: [
        { name: exportFormat.toUpperCase(), extensions: [extensions[exportFormat]] }
      ]
    })

    if (!result.canceled && result.filePath) {
      const fs = window.electronAPI?.fs
      if (fs) {
        await fs.writeFile(result.filePath, getExportContent())
      }
      
      const record = {
        id: Date.now(),
        palette: currentPalette?.name || '',
        format: exportFormat,
        filePath: result.filePath,
        timestamp: Date.now()
      }
      setExportHistory(prev => [record, ...prev].slice(0, 10))
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportContent = getExportContent()

  return (
    <div className="export-panel">
      <div className="view-header">
        <h2 className="view-title">导出色板</h2>
        <p className="view-subtitle">将品牌色板导出为开发可用的格式</p>
      </div>

      <div className="export-content">
        <div className="export-options">
          <div className="option-group">
            <label className="option-label">选择色板</label>
            <select 
              className="option-select"
              value={selectedPalette || ''}
              onChange={(e) => setSelectedPalette(e.target.value)}
            >
              {palettes.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.colors.length})</option>
              ))}
            </select>
          </div>

          <div className="option-group">
            <label className="option-label">导出格式</label>
            <div className="format-tabs">
              {[
                { id: 'css', label: 'CSS 变量' },
                { id: 'scss', label: 'SCSS' },
                { id: 'json', label: 'JSON' },
                { id: 'tailwind', label: 'Tailwind' }
              ].map(format => (
                <button
                  key={format.id}
                  className={`format-tab ${exportFormat === format.id ? 'active' : ''}`}
                  onClick={() => setExportFormat(format.id)}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>

          {(exportFormat === 'css' || exportFormat === 'scss') && (
            <div className="option-group">
              <label className="option-label">变量前缀</label>
              <input
                type="text"
                className="option-input"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="preview-section">
          <div className="preview-header">
            <span className="preview-title">代码预览</span>
            <span className="preview-count">
              {currentPalette?.colors.length || 0} 个颜色
            </span>
          </div>
          <pre className="code-preview">
            <code>{exportContent || '// 暂无颜色，请先添加颜色到色板'}</code>
          </pre>
        </div>

        <div className="export-actions">
          <button className="export-btn primary" onClick={copyToClipboard}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            复制代码
          </button>
          <button className="export-btn secondary" onClick={downloadFile}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载文件
          </button>
        </div>

        {currentPalette && currentPalette.colors.length > 0 && (
          <div className="color-swatches">
            <h3 className="swatches-title">色板预览</h3>
            <div className="swatches-grid">
              {currentPalette.colors.map((color, index) => (
                <div key={color.id} className="swatch-item">
                  <div 
                    className="swatch-color"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="swatch-info">
                    <span className="swatch-name">{color.name || `颜色 ${index + 1}`}</span>
                    <span className="swatch-hex">{color.hex.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {exportHistory.length > 0 && (
          <div className="export-history">
            <h3 className="history-title">最近导出</h3>
            <div className="history-list">
              {exportHistory.map(record => (
                <div key={record.id} className="history-item">
                  <div className="history-icon">
                    {record.format.toUpperCase()}
                  </div>
                  <div className="history-info">
                    <span className="history-name">{record.palette}</span>
                    <span className="history-time">{formatTime(record.timestamp)}</span>
                  </div>
                  {record.filePath && (
                    <button 
                      className="history-locate"
                      onClick={() => window.electronAPI?.shell?.openPath(record.filePath)}
                    >
                      定位
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExportPanel
