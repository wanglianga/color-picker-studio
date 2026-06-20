import React from 'react'
import './Sidebar.css'

const navItems = [
  { id: 'palette', label: '色板', icon: 'palette' },
  { id: 'history', label: '历史', icon: 'history' },
  { id: 'favorites', label: '收藏', icon: 'star' },
  { id: 'contrast', label: '对比度', icon: 'contrast' },
  { id: 'export', label: '导出', icon: 'export' }
]

function Sidebar({ activeView, setActiveView }) {
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'palette':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor"/>
            <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor"/>
            <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor"/>
            <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor"/>
            <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10c0 3-2 4-4 4h-2a2 2 0 00-2 2 2 2 0 01-2 2z"/>
          </svg>
        )
      case 'history':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 109-9c0 2-1 3-3 3"/>
            <polyline points="3 4 3 10 9 10"/>
            <line x1="12" y1="8" x2="12" y2="13"/>
            <line x1="12" y1="13" x2="15" y2="15"/>
          </svg>
        )
      case 'star':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        )
      case 'contrast':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a10 10 0 000 20V2z" fill="currentColor"/>
          </svg>
        )
      case 'export':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            {renderIcon(item.icon)}
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <div className="shortcut-hint">
          <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd>
          <span>取色</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
