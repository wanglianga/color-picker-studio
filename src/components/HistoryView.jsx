import React from 'react'
import ColorCard from './ColorCard.jsx'
import './HistoryView.css'

function HistoryView({ history, addColorToPalette, addToFavorites, clearHistory, activePalette }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    return date.toLocaleDateString()
  }

  const groupedHistory = history.reduce((groups, color) => {
    const date = new Date(color.timestamp).toLocaleDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(color)
    return groups
  }, {})

  return (
    <div className="history-view">
      <div className="view-header">
        <h2 className="view-title">历史记录</h2>
        <div className="view-header-actions">
          <span className="history-count">{history.length} 个颜色</span>
          {history.length > 0 && (
            <button className="clear-btn" onClick={clearHistory}>
              清空
            </button>
          )}
        </div>
      </div>

      <div className="history-content">
        {history.length > 0 ? (
          Object.entries(groupedHistory).map(([date, colors]) => (
            <div key={date} className="history-group">
              <div className="history-group-date">{date}</div>
              <div className="colors-grid">
                {colors.map((color) => (
                  <ColorCard
                    key={color.id}
                    color={color}
                    onAddToPalette={() => addColorToPalette(color, activePalette)}
                    onAddToFavorites={() => addToFavorites(color)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12a9 9 0 109-9c0 2-1 3-3 3"/>
                <polyline points="3 4 3 10 9 10"/>
                <line x1="12" y1="8" x2="12" y2="13"/>
                <line x1="12" y1="13" x2="15" y2="15"/>
              </svg>
            </div>
            <p className="empty-text">暂无历史记录</p>
            <p className="empty-hint">开始取色后，颜色会自动记录在这里</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryView
