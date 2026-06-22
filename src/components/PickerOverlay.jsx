import React, { useEffect, useState, useRef } from 'react'
import { rgbToHex, rgbToHsl, getColorName } from '../utils/colorUtils.js'
import './PickerOverlay.css'

function PickerOverlay() {
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [pixel, setPixel] = useState({ r: 0, g: 0, b: 0 })
  const [magnifierImage, setMagnifierImage] = useState(null)
  const [recentColors, setRecentColors] = useState([])
  const gridCanvasRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const api = window.electronAPI?.picker
      if (api) {
        api.move(e.screenX, e.screenY)
      }
      setCursor({ x: e.clientX, y: e.clientY })
    }

    const handleClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const api = window.electronAPI?.picker
      if (api) {
        const colorData = {
          hex: rgbToHex(pixel.r, pixel.g, pixel.b),
          rgb: { ...pixel },
          hsl: rgbToHsl(pixel.r, pixel.g, pixel.b),
          name: getColorName(pixel.r, pixel.g, pixel.b),
          timestamp: Date.now(),
          position: { x: e.screenX, y: e.screenY }
        }
        setRecentColors(prev => {
          const exists = prev.some(c => c.hex === colorData.hex)
          if (exists) return prev
          const updated = [colorData, ...prev].slice(0, 8)
          return updated
        })
        api.confirm(colorData)
      }
    }

    const handleKeyDown = (e) => {
      e.preventDefault()
      if (e.key === 'Escape') {
        const api = window.electronAPI?.picker
        if (api) api.close()
      }
    }

    const handleRightClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const api = window.electronAPI?.picker
      if (api) api.close()
    }

    document.body.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('click', handleClick, true)
    document.body.addEventListener('contextmenu', handleRightClick)
    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('click', handleClick, true)
      document.body.removeEventListener('contextmenu', handleRightClick)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [pixel])

  useEffect(() => {
    const api = window.electronAPI?.overlay
    if (api) {
      const unsubscribe = api.onUpdate((data) => {
        setCursor({ x: data.x - window.screenX, y: data.y - window.screenY })
        if (data.pixel) {
          setPixel(data.pixel)
        }
        if (data.magnifierImage) {
          setMagnifierImage(data.magnifierImage)
        }
      })

      return () => {
        if (unsubscribe) unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    const canvas = gridCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = 160
    const pixelSize = 10
    const pixels = size / pixelSize

    ctx.clearRect(0, 0, size, size)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 0.5

    for (let i = 0; i <= pixels; i++) {
      const pos = i * pixelSize
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(size, pos)
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(233, 69, 96, 0.9)'
    ctx.lineWidth = 1
    ctx.strokeRect(size / 2 - pixelSize / 2, size / 2 - pixelSize / 2, pixelSize, pixelSize)
  }, [magnifierImage])

  const hexColor = rgbToHex(pixel.r, pixel.g, pixel.b)
  const hsl = rgbToHsl(pixel.r, pixel.g, pixel.b)
  const colorName = getColorName(pixel.r, pixel.g, pixel.b)

  const infoBoxLeft = cursor.x + 30
  const infoBoxTop = cursor.y + 30
  const shouldFlipX = infoBoxLeft + 260 > window.innerWidth
  const shouldFlipY = infoBoxTop + 320 > window.innerHeight

  return (
    <div className="picker-overlay" style={{ cursor: 'none' }}>
      <div
        className="magnifier-container"
        style={{
          left: cursor.x,
          top: cursor.y,
          transform: `translate(-50%, calc(-100% - 20px))`
        }}
      >
        <div className="magnifier-box">
          {magnifierImage ? (
            <img
              src={magnifierImage}
              alt="magnifier"
              className="magnifier-img"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="magnifier-loading">...</div>
          )}
          <canvas
            ref={gridCanvasRef}
            width={160}
            height={160}
            className="pixel-grid-canvas"
          />
          <div className="magnifier-crosshair-center" />
        </div>
      </div>

      <div
        className="crosshair-cursor"
        style={{
          left: cursor.x,
          top: cursor.y
        }}
      >
        <div className="cursor-h"></div>
        <div className="cursor-v"></div>
      </div>

      <div
        className="picker-info-box"
        style={{
          left: shouldFlipX ? cursor.x - 270 : cursor.x + 25,
          top: shouldFlipY ? cursor.y - 320 : cursor.y + 25
        }}
      >
        <div className="info-color-section">
          <div className="info-color-preview" style={{ backgroundColor: hexColor }} />
          <div className="info-color-details">
            <div className="info-color-name">{colorName}</div>
            <div className="info-color-hex">{hexColor.toUpperCase()}</div>
          </div>
        </div>

        <div className="info-color-values">
          <div className="info-value-row">
            <span className="info-value-label">RGB</span>
            <span className="info-value-text">{pixel.r}, {pixel.g}, {pixel.b}</span>
          </div>
          <div className="info-value-row">
            <span className="info-value-label">HSL</span>
            <span className="info-value-text">{hsl.h}°, {hsl.s}%, {hsl.l}%</span>
          </div>
          <div className="info-value-row">
            <span className="info-value-label">坐标</span>
            <span className="info-value-text">{cursor.x}, {cursor.y}</span>
          </div>
        </div>

        {recentColors.length > 0 && (
          <div className="info-recent-section">
            <div className="info-recent-title">最近取样</div>
            <div className="info-recent-colors">
              {recentColors.map((color, idx) => (
                <div
                  key={idx}
                  className="recent-color-swatch"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex.toUpperCase()}
                />
              ))}
            </div>
          </div>
        )}

        <div className="picker-hint-text">
          <span>点击取色</span>
          <span className="hint-separator">·</span>
          <span>Esc 退出</span>
        </div>
      </div>
    </div>
  )
}

export default PickerOverlay
