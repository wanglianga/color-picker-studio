import React, { useMemo } from 'react'
import './VersionCompare.css'

function VersionCompare({ version, currentPalettes, onClose, onRestore }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const diffResult = useMemo(() => {
    const snapshotPalettes = version.snapshot || []
    const currentPalettesCopy = currentPalettes

    const diffs = []

    const allPaletteIds = new Set([
      ...snapshotPalettes.map(p => p.id),
      ...currentPalettesCopy.map(p => p.id)
    ])

    allPaletteIds.forEach(paletteId => {
      const oldPalette = snapshotPalettes.find(p => p.id === paletteId)
      const newPalette = currentPalettesCopy.find(p => p.id === paletteId)

      if (!oldPalette && newPalette) {
        diffs.push({
          paletteId,
          paletteName: newPalette.name,
          type: 'palette_added',
          colors: newPalette.colors.map(c => ({ ...c, changeType: 'added' }))
        })
        return
      }

      if (oldPalette && !newPalette) {
        diffs.push({
          paletteId,
          paletteName: oldPalette.name,
          type: 'palette_removed',
          colors: oldPalette.colors.map(c => ({ ...c, changeType: 'removed' }))
        })
        return
      }

      const colorDiffs = []
      const oldColorMap = new Map(oldPalette.colors.map(c => [c.id, c]))
      const newColorMap = new Map(newPalette.colors.map(c => [c.id, c]))

      oldPalette.colors.forEach(oldColor => {
        const newColor = newColorMap.get(oldColor.id)
        if (!newColor) {
          colorDiffs.push({ ...oldColor, changeType: 'removed' })
        } else {
          const changes = []
          if (oldColor.hex !== newColor.hex) changes.push('hex')
          if (oldColor.name !== newColor.name) changes.push('name')
          if (changes.length > 0) {
            colorDiffs.push({
              ...newColor,
              changeType: 'modified',
              changes,
              oldHex: oldColor.hex,
              oldName: oldColor.name
            })
          }
        }
      })

      newPalette.colors.forEach(newColor => {
        if (!oldColorMap.has(newColor.id)) {
          colorDiffs.push({ ...newColor, changeType: 'added' })
        }
      })

      if (colorDiffs.length > 0) {
        diffs.push({
          paletteId,
          paletteName: newPalette.name,
          type: 'palette_modified',
          colors: colorDiffs
        })
      }
    })

    return diffs
  }, [version, currentPalettes])

  const oldPalette = (version.snapshot || []).find(p => p.id === version.paletteId)
  const newPalette = currentPalettes.find(p => p.id === version.paletteId)

  return (
    <div className="version-compare-overlay" onClick={onClose}>
      <div className="version-compare-modal" onClick={e => e.stopPropagation()}>
        <div className="vc-header">
          <h3 className="vc-title">版本对比</h3>
          <button className="vc-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="vc-meta">
          <div className="vc-meta-item">
            <span className="vc-meta-label">变更时间</span>
            <span className="vc-meta-value">{formatTime(version.timestamp)}</span>
          </div>
          <div className="vc-meta-item">
            <span className="vc-meta-label">变更类型</span>
            <span className="vc-meta-value">{version.type}</span>
          </div>
          <div className="vc-meta-item">
            <span className="vc-meta-label">变更来源</span>
            <span className={`vc-source-tag source-${version.source}`}>
              {version.source === 'manual' ? '手动输入' : version.source === 'picker' ? '屏幕取色' : '导入覆盖'}
            </span>
          </div>
        </div>

        <div className="vc-compare-panels">
          <div className="vc-panel vc-panel-old">
            <div className="vc-panel-header">
              <span className="vc-panel-title">历史版本</span>
              <span className="vc-panel-time">{formatTime(version.timestamp)}</span>
            </div>
            <div className="vc-panel-content">
              {oldPalette ? (
                <div className="vc-color-list">
                  {oldPalette.colors.map(color => {
                    const diffEntry = diffResult.find(d => d.paletteId === oldPalette.id)
                    const changedColor = diffEntry?.colors.find(c => c.id === color.id)
                    const isModified = changedColor?.changeType === 'modified'
                    const isRemoved = changedColor?.changeType === 'removed'

                    return (
                      <div
                        key={color.id}
                        className={`vc-color-item ${isModified ? 'vc-modified' : ''} ${isRemoved ? 'vc-removed' : ''}`}
                      >
                        <div
                          className="vc-color-swatch"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="vc-color-info">
                          <span className="vc-color-name">{color.name}</span>
                          <span className="vc-color-hex">{color.hex.toUpperCase()}</span>
                        </div>
                        {isModified && <span className="vc-change-badge vc-badge-modified">已修改</span>}
                        {isRemoved && <span className="vc-change-badge vc-badge-removed">已删除</span>}
                      </div>
                    )
                  })}
                  {oldPalette.colors.length === 0 && (
                    <div className="vc-empty-palette">色板为空</div>
                  )}
                </div>
              ) : (
                <div className="vc-empty-palette">色板不存在于历史版本</div>
              )}
            </div>
          </div>

          <div className="vc-divider">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div className="vc-panel vc-panel-new">
            <div className="vc-panel-header">
              <span className="vc-panel-title">当前版本</span>
              <span className="vc-panel-time">当前</span>
            </div>
            <div className="vc-panel-content">
              {newPalette ? (
                <div className="vc-color-list">
                  {newPalette.colors.map(color => {
                    const diffEntry = diffResult.find(d => d.paletteId === newPalette.id)
                    const changedColor = diffEntry?.colors.find(c => c.id === color.id)
                    const isModified = changedColor?.changeType === 'modified'
                    const isAdded = changedColor?.changeType === 'added'

                    return (
                      <div
                        key={color.id}
                        className={`vc-color-item ${isModified ? 'vc-modified' : ''} ${isAdded ? 'vc-added' : ''}`}
                      >
                        <div
                          className="vc-color-swatch"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="vc-color-info">
                          <span className="vc-color-name">{color.name}</span>
                          <span className="vc-color-hex">{color.hex.toUpperCase()}</span>
                        </div>
                        {isModified && <span className="vc-change-badge vc-badge-modified">已修改</span>}
                        {isAdded && <span className="vc-change-badge vc-badge-added">新增</span>}
                      </div>
                    )
                  })}
                  {newPalette.colors.length === 0 && (
                    <div className="vc-empty-palette">色板为空</div>
                  )}
                </div>
              ) : (
                <div className="vc-empty-palette">色板已被删除</div>
              )}
            </div>
          </div>
        </div>

        {diffResult.length > 0 && (
          <div className="vc-diff-summary">
            <h4 className="vc-diff-title">变更摘要</h4>
            <div className="vc-diff-list">
              {diffResult.map(diff => (
                <div key={diff.paletteId} className="vc-diff-palette">
                  <span className="vc-diff-palette-name">{diff.paletteName}</span>
                  <div className="vc-diff-stats">
                    {diff.colors.filter(c => c.changeType === 'added').length > 0 && (
                      <span className="vc-stat vc-stat-add">
                        +{diff.colors.filter(c => c.changeType === 'added').length} 新增
                      </span>
                    )}
                    {diff.colors.filter(c => c.changeType === 'modified').length > 0 && (
                      <span className="vc-stat vc-stat-modify">
                        ~{diff.colors.filter(c => c.changeType === 'modified').length} 修改
                      </span>
                    )}
                    {diff.colors.filter(c => c.changeType === 'removed').length > 0 && (
                      <span className="vc-stat vc-stat-remove">
                        -{diff.colors.filter(c => c.changeType === 'removed').length} 删除
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="vc-actions">
          <button className="vc-btn vc-btn-cancel" onClick={onClose}>关闭</button>
          <button className="vc-btn vc-btn-restore" onClick={() => onRestore(version.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 109-9c0 2-1 3-3 3"/>
              <polyline points="3 4 3 10 9 10"/>
            </svg>
            恢复至此版本
          </button>
        </div>
      </div>
    </div>
  )
}

export default VersionCompare
