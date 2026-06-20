import React, { useState, useEffect, useRef, useCallback } from 'react'
import { rgbToHex, rgbToHsl, formatColor, getColorName } from '../utils/colorUtils.js'
import './ColorPicker.css'

function ColorPicker() {
  const [color, setColor] = useState({ r: 255, g: 0, b: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [magnifierImage, setMagnifierImage] = useState(null)
  const [format, setFormat] = useState('hex')
  const [history, setHistory] = useState([])
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const api = window.electronAPI?.picker
    if (!api) return

    api.onColorUpdate((data) => {
      setPosition({ x: data.x, y: data.y })
      setMagnifierImage(data.imageData)
      
      if (canvasRef.current && data.imageData) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data
          
          setColor({
            r: pixelData[0],
            g: pixelData[1],
            b: pixelData[2]
          })
        }
        img.src = data.imageData
      }
    })

    const handleMouseMove = (e) => {
      const screenX = e.screenX
      const screenY = e.screenY
      api.move(screenX, screenY)
    }

    const handleClick = () => {
      const colorData = {
        hex: rgbToHex(color.r, color.g, color.b),
        rgb: { ...color },
        hsl: rgbToHsl(color.r, color.g, color.b),
        name: getColorName(color.r, color.g, color.b),
        timestamp: Date.now(),
        source: '取色器',
        position: { ...position }
      }
      api.confirm(colorData)
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        api.close()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [color, position])

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
    <div className="color-picker-container" ref={containerRef}>
      <div className="magnifier-section">
        <div className="magnifier-wrapper">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="magnifier-canvas"
          />
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
        点击取色 · 按 ESC 取消
      </div>
    </div>
  )
}

export default ColorPicker
