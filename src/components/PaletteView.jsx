import React, { useState } from 'react'
import ColorCard from './ColorCard.jsx'
import './PaletteView.css'

function PaletteView({
  palettes,
  activePalette,
  setActivePalette,
  addPalette,
  deletePalette,
  addColorToPalette,
  removeColorFromPalette,
  updateColorName,
  updateColorValue,
  startPicker,
  toggleChangePanel
}) {
  const [showNewPalette, setShowNewPalette] = useState(false)
  const [newPaletteName, setNewPaletteName] = useState('')
  const [editingColor, setEditingColor] = useState(null)
  const [editName, setEditName] = useState('')

  const currentPalette = palettes.find(p => p.id === activePalette)

  const handleAddPalette = () => {
    if (newPaletteName.trim()) {
      addPalette(newPaletteName.trim())
      setNewPaletteName('')
      setShowNewPalette(false)
    }
  }

  const handleEditName = (colorId, currentName) => {
    setEditingColor(colorId)
    setEditName(currentName)
  }

  const handleSaveName = (colorId) => {
    if (editName.trim()) {
      updateColorName(colorId, activePalette, editName.trim())
    }
    setEditingColor(null)
  }

  const handlePickerClick = () => {
    startPicker()
  }

  return (
    <div className="palette-view">
      <div className="palette-header">
        <div className="palette-tabs">
          {palettes.map((palette) => (
            <div
              key={palette.id}
              className={`palette-tab ${activePalette === palette.id ? 'active' : ''}`}
              onClick={() => setActivePalette(palette.id)}
            >
              <span className="palette-tab-name">{palette.name}</span>
              <span className="palette-tab-count">{palette.colors.length}</span>
              {palettes.length > 1 && (
                <button
                  className="palette-tab-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePalette(palette.id)
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {showNewPalette ? (
            <div className="new-palette-input">
              <input
                type="text"
                value={newPaletteName}
                onChange={(e) => setNewPaletteName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPalette()}
                placeholder="色板名称"
                autoFocus
              />
              <button onClick={handleAddPalette}>✓</button>
              <button onClick={() => setShowNewPalette(false)}>✕</button>
            </div>
          ) : (
            <button className="add-palette-btn" onClick={() => setShowNewPalette(true)}>
              + 新建
            </button>
          )}
        </div>
      </div>

      <div className="palette-content">
        {currentPalette && currentPalette.colors.length > 0 ? (
          <div className="colors-grid">
            {currentPalette.colors.map((color) => (
              <ColorCard
                key={color.id}
                color={color}
                onRemove={() => removeColorFromPalette(color.id, activePalette)}
                isEditing={editingColor === color.id}
                editName={editName}
                onEditName={() => handleEditName(color.id, color.name)}
                onSaveName={() => handleSaveName(color.id)}
                onNameChange={setEditName}
                onCancelEdit={() => setEditingColor(null)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-palette">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="13.5" cy="6.5" r="1.5"/>
                <circle cx="17.5" cy="10.5" r="1.5"/>
                <circle cx="8.5" cy="7.5" r="1.5"/>
                <circle cx="6.5" cy="12.5" r="1.5"/>
                <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10c0 3-2 4-4 4h-2a2 2 0 00-2 2 2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p className="empty-text">色板还是空的</p>
            <p className="empty-hint">点击下方按钮开始取色</p>
          </div>
        )}
      </div>

      <div className="palette-footer">
        <button className="picker-btn" onClick={handlePickerClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10c0 3-2 4-4 4h-2a2 2 0 00-2 2 2 2 0 01-2 2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>开始取色</span>
          <kbd>Alt+Shift+C</kbd>
        </button>
        <button className="change-panel-btn" onClick={toggleChangePanel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
          </svg>
          变更历史
        </button>
      </div>
    </div>
  )
}

export default PaletteView
