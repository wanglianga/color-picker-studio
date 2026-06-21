import React, { useState, useEffect, useCallback } from 'react'
import { rgbToHex, rgbToHsl, formatColor, getColorName } from '../utils/colorUtils.js'
import './ColorPicker.css'

function ColorPicker() {
  const [color, setColor] = useState({ r: 255, g: 0, b: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [magnifierImage, setMagnifierImage] = useState(null)
  const [format, setFormat] = useState('hex')

  useEffect(() => {
    const api = window.electronAPI?.picker
    if (!api) return

    const unsubscribe = api.onColorUpdate((data) => {
      setPosition({ x: data.x, y: data.y })
      if (data.pixel) {
        setColor({
          r: data.pixel.r,
          g: data.pixel.g,
          b: data.pixel.b
        })
      }
      if (data.magnifierImage) {
        setMagnifierImage(data.magnifierImage)
      }
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const copyColor = useCallback((fmt) => {
    const colorStr = formatColor(color, fmt)
    if (window.electronAPI?.clipboard) {
      window.electronAPI.clipboard.copy(colorStr)
    }
  }, [color])

  const hexColor = rgbToHex(color.r, color.g, color.b)
  const hsl = rgbToHsl(color.r, color.g, color.b)
  const colorName = getColorName(color.r, color.g, color.b)

  return (
    <div className="color-picker-container">
      <div className="magnifier-section">
        <div className="magnifier-wrapper">
          {magnifierImage ? (
            <img
              src={magnifierImage}
              alt="magnifier"
              className="magnifier-image"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="magnifier-placeholder">加载中...</div>
          )}
          <div className="crosshair-h"></div>
          <div className="crosshair-v"></div>
          <div className="crosshair-dot"></div>
        </div>
        <div className="position-info">
          坐标: {position.x}, {position.y}
        </div>
      </div>

      <div className="color-preview-section">
        <div
          className="color-preview"
          style={{ backgroundColor: hexColor }}
        />
        <div className="color-name">{colorName}</div>
      </div>

      <div className="color-formats">
        <div className="format-tabs">
          {['hex', 'rgb', 'hsl'].map((fmt) => (
            <button
              key={fmt}
              className={`format-tab ${format === fmt ? 'active' : ''}`}
              onClick={() => setFormat(fmt)}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="format-value" onClick={() => copyColor(format)}>
          <span className="value-text">{formatColor(color, format)}</span>
          <span className="copy-hint">点击复制</span>
        </div>

        <div className="format-details">
          <div className="detail-row">
            <span className="detail-label">R</span>
            <span className="detail-value">{color.r}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">G</span>
            <span className="detail-value">{color.g}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">B</span>
            <span className="detail-value">{color.b}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">H</span>
            <span className="detail-value">{hsl.h}°</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">S</span>
            <span className="detail-value">{hsl.s}%</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">L</span>
            <span className="detail-value">{hsl.l}%</span>
          </div>
        </div>
      </div>

      <div className="picker-hint">
        点击取色 · 右键/ESC 取消
      </div>
    </div>
  )
}

export default ColorPicker
