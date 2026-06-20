import React from 'react'
import './TitleBar.css'

function TitleBar() {
  const handleMinimize = () => {
    window.electronAPI?.window?.minimize()
  }

  const handleMaximize = () => {
    window.electronAPI?.window?.maximize()
  }

  const handleClose = () => {
    window.electronAPI?.window?.close()
  }

  return (
    <div className="title-bar">
      <div className="title-bar-drag">
        <div className="title-bar-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2C12 2 8 8 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 8 12 2 12 2Z" fill="#e94560"/>
            <circle cx="12" cy="12" r="2" fill="white"/>
          </svg>
        </div>
        <span className="title-bar-title">ColorPicker Studio</span>
      </div>
      <div className="title-bar-controls">
        <button className="title-bar-btn minimize-btn" onClick={handleMinimize}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="0" y="5" width="12" height="2" rx="1"/>
          </svg>
        </button>
        <button className="title-bar-btn maximize-btn" onClick={handleMaximize}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="10" height="10" rx="1"/>
          </svg>
        </button>
        <button className="title-bar-btn close-btn" onClick={handleClose}>
          <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="2" x2="10" y2="10"/>
            <line x1="10" y1="2" x2="2" y2="10"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar
