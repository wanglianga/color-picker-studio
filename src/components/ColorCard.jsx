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

  const copyColor = async (format) => {
    const colorStr = formatColor(color.rgb, format)
    if (window.electronAPI?.clipboard) {
      await window.electronAPI.clipboard.copy(colorStr)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 1000)
    }
  }

  return (
    <div className="color-card" onMouseLeave={() => setShowMenu(false)}>
      <div 
        className="color-swatch"
        style={{ backgroundColor: color.hex }}
        onClick={() => copyColor('hex')}
      >
        {copiedFormat && (
          <div className="copy-tooltip">
            已复制 {copiedFormat.toUpperCase()}
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
            {color.name || '未命名'}
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
            ⋯
          </button>
          
          {showMenu && (
            <div className="action-menu">
              <button onClick={() => copyColor('hex')}>
                复制 HEX
              </button>
              <button onClick={() => copyColor('rgb')}>
                复制 RGB
              </button>
              <button onClick={() => copyColor('hsl')}>
                复制 HSL
              </button>
              <div className="menu-divider" />
              {onAddToPalette && (
                <button onClick={onAddToPalette}>
                  添加到色板
                </button>
              )}
              {onAddToFavorites && (
                <button onClick={onAddToFavorites}>
                  {isFavorite ? '取消收藏' : '加入收藏'}
                </button>
              )}
              {onRemove && (
                <button className="danger" onClick={onRemove}>
                  删除
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
