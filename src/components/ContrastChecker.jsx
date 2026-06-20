import React, { useState, useEffect } from 'react'
import { getContrastRatio, getContrastLevel, hexToRgb, rgbToHex } from '../utils/colorUtils.js'
import './ContrastChecker.css'

function ContrastChecker() {
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#ffffff')
  const [fgInput, setFgInput] = useState('#000000')
  const [bgInput, setBgInput] = useState('#ffffff')

  const fgRgb = hexToRgb(foreground) || { r: 0, g: 0, b: 0 }
  const bgRgb = hexToRgb(background) || { r: 255, g: 255, b: 255 }

  const contrastRatio = getContrastRatio(fgRgb, bgRgb)
  const contrastLevel = getContrastLevel(contrastRatio)

  const handleFgChange = (value) => {
    setFgInput(value)
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setForeground(value)
    }
  }

  const handleBgChange = (value) => {
    setBgInput(value)
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setBackground(value)
    }
  }

  const swapColors = () => {
    setForeground(background)
    setBackground(foreground)
    setFgInput(bgInput)
    setBgInput(fgInput)
  }

  const presetColors = [
    { name: '白底黑字', fg: '#000000', bg: '#ffffff' },
    { name: '深色模式', fg: '#ffffff', bg: '#1a1a2e' },
    { name: '品牌红', fg: '#ffffff', bg: '#e94560' },
    { name: '蓝白配', fg: '#0f3460', bg: '#ffffff' },
  ]

  return (
    <div className="contrast-checker">
      <div className="view-header">
        <h2 className="view-title">对比度检查</h2>
        <p className="view-subtitle">检查文本与背景色的对比度是否符合 WCAG 标准</p>
      </div>

      <div className="contrast-content">
        <div className="color-inputs-section">
          <div className="color-input-group">
            <label className="color-input-label">前景色 / 文字</label>
            <div className="color-input-row">
              <div 
                className="color-preview-box"
                style={{ backgroundColor: foreground }}
              >
                <input
                  type="color"
                  value={foreground}
                  onChange={(e) => {
                    setForeground(e.target.value)
                    setFgInput(e.target.value)
                  }}
                />
              </div>
              <input
                type="text"
                className="color-text-input"
                value={fgInput}
                onChange={(e) => handleFgChange(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <button className="swap-btn" onClick={swapColors}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="7 16 3 12 7 8"/>
              <path d="M3 12h14a4 4 0 014 4"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="17 8 21 12 17 16"/>
              <path d="M21 12H7a4 4 0 00-4 4"/>
            </svg>
          </button>

          <div className="color-input-group">
            <label className="color-input-label">背景色</label>
            <div className="color-input-row">
              <div 
                className="color-preview-box"
                style={{ backgroundColor: background }}
              >
                <input
                  type="color"
                  value={background}
                  onChange={(e) => {
                    setBackground(e.target.value)
                    setBgInput(e.target.value)
                  }}
                />
              </div>
              <input
                type="text"
                className="color-text-input"
                value={bgInput}
                onChange={(e) => handleBgChange(e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        <div className="contrast-result-section">
          <div className="contrast-ratio-display">
            <span className="ratio-value">{contrastRatio.toFixed(2)}</span>
            <span className="ratio-label">: 1</span>
          </div>
          
          <div className="contrast-level-badge" style={{ borderColor: contrastLevel.color, color: contrastLevel.color }}>
            <span className="level-badge" style={{ backgroundColor: contrastLevel.color }}>
              {contrastLevel.level}
            </span>
            <span className="level-label">{contrastLevel.label}</span>
          </div>
        </div>

        <div className="preview-section">
          <div 
            className="preview-box"
            style={{ backgroundColor: background, color: foreground }}
          >
            <p className="preview-large">Aa</p>
            <p className="preview-title">标题文字示例</p>
            <p className="preview-body">
              这是一段正文文字，用于展示在当前配色下的可读性效果。
              良好的对比度可以提升用户体验，确保内容的可访问性。
            </p>
            <p className="preview-small">小号文字示例 - 小字号需要更高的对比度</p>
          </div>
        </div>

        <div className="wcag-standards">
          <h3 className="standards-title">WCAG 标准</h3>
          <div className="standards-grid">
            <div className={`standard-item ${contrastRatio >= 7 ? 'pass' : 'fail'}`}>
              <div className="standard-icon">
                {contrastRatio >= 7 ? '✓' : '✗'}
              </div>
              <div className="standard-info">
                <span className="standard-level">AAA 普通文本</span>
                <span className="standard-req">≥ 7:1</span>
              </div>
            </div>
            <div className={`standard-item ${contrastRatio >= 4.5 ? 'pass' : 'fail'}`}>
              <div className="standard-icon">
                {contrastRatio >= 4.5 ? '✓' : '✗'}
              </div>
              <div className="standard-info">
                <span className="standard-level">AA 普通文本</span>
                <span className="standard-req">≥ 4.5:1</span>
              </div>
            </div>
            <div className={`standard-item ${contrastRatio >= 3 ? 'pass' : 'fail'}`}>
              <div className="standard-icon">
                {contrastRatio >= 3 ? '✓' : '✗'}
              </div>
              <div className="standard-info">
                <span className="standard-level">AA 大文本</span>
                <span className="standard-req">≥ 3:1</span>
              </div>
            </div>
            <div className={`standard-item ${contrastRatio >= 4.5 ? 'pass' : 'fail'}`}>
              <div className="standard-icon">
                {contrastRatio >= 4.5 ? '✓' : '✗'}
              </div>
              <div className="standard-info">
                <span className="standard-level">AAA 大文本</span>
                <span className="standard-req">≥ 4.5:1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="preset-colors">
          <h3 className="preset-title">快速预设</h3>
          <div className="preset-grid">
            {presetColors.map((preset, index) => (
              <button
                key={index}
                className="preset-item"
                onClick={() => {
                  setForeground(preset.fg)
                  setBackground(preset.bg)
                  setFgInput(preset.fg)
                  setBgInput(preset.bg)
                }}
              >
                <div className="preset-preview" style={{ background: `linear-gradient(to right, ${preset.fg} 50%, ${preset.bg} 50%)` }} />
                <span className="preset-name">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContrastChecker
