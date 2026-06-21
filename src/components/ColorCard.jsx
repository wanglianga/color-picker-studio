import React, { useState } from 'react'
import { formatColor } from '../utils/colorUtils.js'
import './ColorCard.css'

function ColorCard({
  color,
  onRemove,
  onAddToPalette,
  onAddToFavorites,
  isFavorite,
  isEditing,
  editName,
  onEditName,
  onSaveName,
  onNameChange,
  onCancelEdit,
  showActions = true
}) {
  const [copiedFormat, setCopiedFormat] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showScreenshot, setShowScreenshot] = useState(false)

  const copyColor = async (format) => {
    const colorStr = formatColor(color.rgb, format)
    if (window.electronAPI?.clipboard) {
      await window.electronAPI.clipboard.copy(colorStr)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 1000)
    }
  }

  const downloadScreenshot = async () => {
    if (!color.screenshot || !window.electronAPI?.file) return

    await window.electronAPI.file.saveImage({
      defaultPath: `${color.name || 'color'}-screenshot.png`,
      filters: [
        { name: 'PNG Image', extensions: ['png'] }
      ],
      dataUrl: color.screenshot
    })
  }

  return (
    <div className="color-card" onMouseLeave={() => { setShowMenu(false); setShowScreenshot(false) }}>
      <div
        className="color-swatch"
        style={{ backgroundColor: color.hex }}
        onClick={() => copyColor('hex')}
        onMouseEnter={() => color.screenshot && setShowScreenshot(true)}
      >
        {copiedFormat && (
          <div className="copy-tooltip">
            Copied {copiedFormat.toUpperCase()}
          </div>
        )}
        {color.screenshot && showScreenshot && (
          <div className="screenshot-preview">
            <img src={color.screenshot} alt="Source screenshot" />
            <div className="screenshot-marker" />
          </div>
        )}
      </div>

      <div className="color-info">
        {isEditing ? (
          <input
            type="text"
            className="color-name-input"
            value={editName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveName()
              if (e.key === 'Escape') onCancelEdit()
            }}
            onBlur={onSaveName}
            autoFocus
          />
        ) : (
          <div className="color-name" onDoubleClick={onEditName}>
            {color.name || 'Unnamed'}
            {color.source && <span className="color-source-tag">{color.source}</span>}
          </div>
        )}
        <div className="color-hex">{color.hex.toUpperCase()}</div>
      </div>

      {showActions && (
        <div className="color-actions">
          <button
            className="action-btn more-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            ...
          </button>

          {showMenu && (
            <div className="action-menu">
              <button onClick={() => copyColor('hex')}>
                Copy HEX
              </button>
              <button onClick={() => copyColor('rgb')}>
                Copy RGB
              </button>
              <button onClick={() => copyColor('hsl')}>
                Copy HSL
              </button>
              {color.screenshot && (
                <>
                  <div className="menu-divider" />
                  <button onClick={downloadScreenshot}>
                    Save source screenshot
                  </button>
                </>
              )}
              <div className="menu-divider" />
              {onAddToPalette && (
                <button onClick={onAddToPalette}>
                  Add to palette
                </button>
              )}
              {onAddToFavorites && (
                <button onClick={onAddToFavorites}>
                  {isFavorite ? 'Remove favorite' : 'Add favorite'}
                </button>
              )}
              {onRemove && (
                <button className="danger" onClick={onRemove}>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ColorCard
