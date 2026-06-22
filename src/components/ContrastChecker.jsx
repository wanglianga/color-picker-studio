import React, { useState, useEffect, useMemo } from 'react'
import {
  getContrastRatio,
  getContrastLevel,
  hexToRgb,
  rgbToHex,
  getApplicableFontSizes,
  getNotRecommendedScenarios,
  generateContrastSuggestions,
  getReadabilityDescription
} from '../utils/colorUtils.js'
import './ContrastChecker.css'

function ContrastChecker() {
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#ffffff')
  const [fgInput, setFgInput] = useState('#000000')
  const [bgInput, setBgInput] = useState('#ffffff')
  const [targetLevel, setTargetLevel] = useState('AA')

  const fgRgb = hexToRgb(foreground) || { r: 0, g: 0, b: 0 }
  const bgRgb = hexToRgb(background) || { r: 255, g: 255, b: 255 }

  const contrastRatio = getContrastRatio(fgRgb, bgRgb)
  const contrastLevel = getContrastLevel(contrastRatio)
  const readability = getReadabilityDescription(contrastRatio)
  const applicableFontSizes = getApplicableFontSizes(contrastRatio)
  const notRecommendedScenarios = getNotRecommendedScenarios(contrastRatio)

  const targetRatio = targetLevel === 'AAA' ? 7 : targetLevel === 'AA' ? 4.5 : 3
  const suggestions = useMemo(() => {
    return generateContrastSuggestions(fgRgb, bgRgb, targetRatio)
  }, [fgRgb, bgRgb, targetRatio])

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

  const applySuggestion = (suggestion) => {
    if (suggestion.type === 'foreground') {
      setForeground(suggestion.suggestedHex)
      setFgInput(suggestion.suggestedHex)
    } else {
      setBackground(suggestion.suggestedHex)
      setBgInput(suggestion.suggestedHex)
    }
  }

  const presetColors = [
    { name: '白底黑字', fg: '#000000', bg: '#ffffff' },
    { name: '深色模式', fg: '#ffffff', bg: '#1a1a2e' },
    { name: '品牌红', fg: '#ffffff', bg: '#e94560' },
    { name: '蓝白配', fg: '#0f3460', bg: '#ffffff' },
    { name: '低对比示例', fg: '#888888', bg: '#aaaaaa' },
    { name: '品牌色测试', fg: '#e94560', bg: '#16213e' },
  ]

  const fontSizes = [
    { key: 'normalText', label: '普通文本', icon: 'Aa', size: '14px' },
    { key: 'largeText', label: '大标题', icon: 'Aa', size: '24px' },
    { key: 'boldText', label: '粗体文本', icon: 'Aa', size: '14px bold' },
    { key: 'iconGraphic', label: '图标/图形', icon: '◆', size: '图形' },
  ]

  return (
    <div className="contrast-checker">
      <div className="view-header">
        <h2 className="view-title">对比度检查</h2>
        <p className="view-subtitle">检查文本与背景色的对比度是否符合 WCAG 标准，并获取智能优化建议</p>
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

          <div className="contrast-level-info">
            <div className="contrast-level-badge" style={{ borderColor: contrastLevel.color, color: contrastLevel.color }}>
              <span className="level-badge" style={{ backgroundColor: contrastLevel.color }}>
                {contrastLevel.level}
              </span>
              <span className="level-label">{contrastLevel.label}</span>
            </div>
            <div className="readability-grade">可读性：<strong>{readability.grade}</strong></div>
            <p className="readability-desc">{readability.description}</p>
          </div>
        </div>

        <div className="target-level-section">
          <span className="target-level-label">目标等级：</span>
          <div className="target-level-tabs">
            {[
              { key: 'AA Large', label: 'AA 大文本', ratio: 3 },
              { key: 'AA', label: 'AA 普通', ratio: 4.5 },
              { key: 'AAA', label: 'AAA', ratio: 7 },
            ].map((level) => (
              <button
                key={level.key}
                className={`target-level-tab ${targetLevel === level.key ? 'active' : ''} ${contrastRatio >= level.ratio ? 'pass' : ''}`}
                onClick={() => setTargetLevel(level.key)}
              >
                {level.label}
                <span className="target-ratio">≥ {level.ratio}:1</span>
              </button>
            ))}
          </div>
        </div>

        <div className="readability-detail-section">
          <h3 className="section-title">可读性评估</h3>
          <div className="readability-detail-grid">
            <div className="readability-detail-item">
              <span className="detail-icon">👥</span>
              <div>
                <div className="detail-label">适用人群</div>
                <div className="detail-value">{readability.audience}</div>
              </div>
            </div>
            <div className="readability-detail-item">
              <span className="detail-icon">⏱️</span>
              <div>
                <div className="detail-label">阅读时长</div>
                <div className="detail-value">{readability.duration}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="font-size-section">
          <h3 className="section-title">适用字号</h3>
          <div className="font-size-grid">
            {fontSizes.map(({ key, label, icon, size }) => {
              const info = applicableFontSizes[key]
              return (
                <div
                  key={key}
                  className={`font-size-card ${info.pass ? 'pass' : 'fail'}`}
                >
                  <div className="font-size-header">
                    <span className="font-size-icon" style={{ fontSize: key === 'largeText' ? '28px' : '16px', fontWeight: key === 'boldText' ? '700' : '400' }}>
                      {icon}
                    </span>
                    <span className={`font-size-status ${info.pass ? 'pass' : 'fail'}`}>
                      {info.pass ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="font-size-label">{label}</div>
                  <div className="font-size-req">{size}</div>
                  <div className="font-size-note">{info.note}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="preview-section">
          <h3 className="section-title">实时预览</h3>
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
            <button className="preview-btn" style={{ backgroundColor: foreground, color: background }}>
              按钮示例
            </button>
          </div>
        </div>

        <div className="wcag-standards">
          <h3 className="section-title">WCAG 标准</h3>
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

        <div className="scenarios-section">
          <h3 className="section-title">
            {notRecommendedScenarios[0]?.level === 'success' ? '适用场景' : '不推荐场景'}
          </h3>
          <div className="scenarios-list">
            {notRecommendedScenarios.map((scenario, idx) => (
              <div key={idx} className={`scenario-item ${scenario.level}`}>
                <span className="scenario-icon">
                  {scenario.level === 'success' ? '✓' : scenario.level === 'warning' ? '⚠' : '✗'}
                </span>
                <div className="scenario-content">
                  <div className="scenario-text">{scenario.text}</div>
                  <div className="scenario-detail">{scenario.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions-section">
            <div className="suggestions-header">
              <h3 className="section-title">智能配色建议</h3>
              <span className="suggestions-badge">对比度不足 · 同色系微调</span>
            </div>
            <p className="suggestions-desc">
              以下建议在保持色相（品牌色）不变的前提下，通过微调明度或饱和度来提升对比度。
            </p>
            <div className="suggestions-list">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="suggestion-card">
                  <div className="suggestion-header">
                    <div className="suggestion-label-row">
                      <span className="suggestion-type-badge">
                        {suggestion.type === 'foreground' ? '文字色' : '背景色'}
                      </span>
                      <span className="suggestion-label">{suggestion.label}</span>
                    </div>
                    <div
                      className="suggestion-level-badge"
                      style={{ backgroundColor: suggestion.level.color }}
                    >
                      {suggestion.level.level}
                    </div>
                  </div>

                  <div className="suggestion-preview-row">
                    <div className="suggestion-color-compare">
                      <div className="color-compare-item">
                        <div
                          className="color-compare-swatch original"
                          style={{ backgroundColor: suggestion.originalHex }}
                        />
                        <span className="color-compare-label">原颜色</span>
                        <span className="color-compare-hex">{suggestion.originalHex.toUpperCase()}</span>
                      </div>
                      <div className="color-compare-arrow">→</div>
                      <div className="color-compare-item">
                        <div
                          className="color-compare-swatch suggested"
                          style={{ backgroundColor: suggestion.suggestedHex }}
                        />
                        <span className="color-compare-label">建议色</span>
                        <span className="color-compare-hex">{suggestion.suggestedHex.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="suggestion-ratio-display">
                      <span className="suggestion-ratio-value">{suggestion.ratio.toFixed(2)}</span>
                      <span className="suggestion-ratio-label">: 1</span>
                    </div>
                  </div>

                  <div className="suggestion-preview-text"
                    style={{
                      backgroundColor: suggestion.type === 'background' ? suggestion.suggestedHex : background,
                      color: suggestion.type === 'foreground' ? suggestion.suggestedHex : foreground
                    }}
                  >
                    调整后的文字预览效果
                  </div>

                  <div className="suggestion-details">
                    <div className="suggestion-change">
                      <span className="suggestion-change-label">调整方式：</span>
                      <span className="suggestion-change-value">{suggestion.change}</span>
                    </div>
                    <div className="suggestion-brand">
                      <span className="suggestion-brand-icon">🎨</span>
                      <span className="suggestion-brand-text">{suggestion.preservesBrand}</span>
                    </div>
                  </div>

                  <button
                    className="apply-suggestion-btn"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    应用此建议
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="preset-colors">
          <h3 className="section-title">快速预设</h3>
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
