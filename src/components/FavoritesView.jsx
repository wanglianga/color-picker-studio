import React from 'react'
import ColorCard from './ColorCard.jsx'
import './FavoritesView.css'

function FavoritesView({ favorites, removeFromFavorites, addColorToPalette, activePalette }) {
  return (
    <div className="favorites-view">
      <div className="view-header">
        <h2 className="view-title">我的收藏</h2>
        <span className="history-count">{favorites.length} 个颜色</span>
      </div>

      <div className="favorites-content">
        {favorites.length > 0 ? (
          <div className="colors-grid">
            {favorites.map((color) => (
              <ColorCard
                key={color.id}
                color={color}
                onAddToPalette={() => addColorToPalette(color, activePalette)}
                onAddToFavorites={() => removeFromFavorites(color.id)}
                isFavorite={true}
                onRemove={() => removeFromFavorites(color.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <p className="empty-text">还没有收藏</p>
            <p className="empty-hint">点击颜色卡片的更多选项，将喜欢的颜色加入收藏</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesView
