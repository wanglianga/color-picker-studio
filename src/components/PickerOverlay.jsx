import React, { useEffect, useState } from 'react'
import { rgbToHex, rgbToHsl, getColorName } from '../utils/colorUtils.js'
import './PickerOverlay.css'

function PickerOverlay() {
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [pixel, setPixel] = useState({ r: 0, g: 0, b: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      const api = window.electronAPI?.picker
      if (api) {
        api.move(e.screenX, e.screenY)
      }
      setCursor({ x: e.screenX, y: e.screenY })
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
      })

      return () => {
        if (unsubscribe) unsubscribe()
      }
    }
  }, [])

  const hexColor = rgbToHex(pixel.r, pixel.g, pixel.b)

  return (
    <div className="picker-overlay" style={{ cursor: 'crosshair' }}>
      <div
        className="crosshair-cursor"
        style={{
          left: cursor.x,
          top: cursor.y
        }}
      >
        <div className="cursor-h"></div>
        <div className="cursor-v"></div>
        <div
          className="cursor-color-preview"
          style={{ backgroundColor: hexColor }}
        />
      </div>
    </div>
  )
}

export default PickerOverlay
