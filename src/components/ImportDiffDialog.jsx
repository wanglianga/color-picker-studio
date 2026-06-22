import React from 'react'
import './ImportDiffDialog.css'

function ImportDiffDialog({ diff, onApply, onCancel }) {
  const { paletteName, added, modified, deleted, unchanged } = diff
  const totalChanges = added.length + modified.length + deleted.length
  const hasConflicts = totalChanges > 0

  return (
    <div className="import-diff-overlay" onClick={onCancel}>
      <div className="import-diff-modal" onClick={e => e.stopPropagation()}>
        <div className="idiff-header">
          <h3 className="idiff-title">导入差异对比</h3>
          <button className="idiff-close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="idiff-summary">
          <div className="idiff-summary-title">
            色板「{paletteName}」导入差异摘要
          </div>
          <div className="idiff-summary-stats">
            {added.length > 0 && (
              <div className="idiff-stat idiff-stat-add">
                <span className="idiff-stat-num">{added.length}</span>
                <span className="idiff-stat-label">新增颜色</span>
              </div>
            )}
            {modified.length > 0 && (
              <div className="idiff-stat idiff-stat-modify">
                <span className="idiff-stat-num">{modified.length}</span>
                <span className="idiff-stat-label">颜色修改</span>
              </div>
            )}
            {deleted.length > 0 && (
              <div className="idiff-stat idiff-stat-delete">
                <span className="idiff-stat-num">{deleted.length}</span>
                <span className="idiff-stat-label">颜色删除</span>
              </div>
            )}
            {unchanged.length > 0 && (
              <div className="idiff-stat idiff-stat-unchanged">
                <span className="idiff-stat-num">{unchanged.length}</span>
                <span className="idiff-stat-label">未变更</span>
              </div>
            )}
          </div>
          {!hasConflicts && (
            <div className="idiff-no-diff">
              当前色板与导入内容完全一致，无需更新。
            </div>
          )}
        </div>

        {hasConflicts && (
          <div className="idiff-details">
            {added.length > 0 && (
              <div className="idiff-section">
                <h4 className="idiff-section-title idiff-section-add">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  新增颜色 ({added.length})
                </h4>
                <div className="idiff-color-list">
                  {added.map((color, index) => (
                    <div key={index} className="idiff-color-item idiff-item-add">
                      <div
                        className="idiff-color-swatch"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="idiff-color-info">
                        <span className="idiff-color-name">{color.name || `颜色 ${index + 1}`}</span>
                        <span className="idiff-color-hex">{color.hex?.toUpperCase()}</span>
                      </div>
                      <span className="idiff-item-badge idiff-badge-add">新增</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modified.length > 0 && (
              <div className="idiff-section">
                <h4 className="idiff-section-title idiff-section-modify">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                  </svg>
                  颜色修改 ({modified.length})
                </h4>
                <div className="idiff-color-list">
                  {modified.map(({ current, imported }, index) => (
                    <div key={index} className="idiff-color-item idiff-item-modify">
                      <div className="idiff-diff-pair">
                        <div className="idiff-diff-side idiff-diff-old">
                          <div
                            className="idiff-color-swatch"
                            style={{ backgroundColor: current.hex }}
                          />
                          <div className="idiff-color-info">
                            <span className="idiff-color-name">{current.name}</span>
                            <span className="idiff-color-hex old">{current.hex?.toUpperCase()}</span>
                          </div>
                        </div>
                        <span className="idiff-diff-arrow">→</span>
                        <div className="idiff-diff-side idiff-diff-new">
                          <div
                            className="idiff-color-swatch"
                            style={{ backgroundColor: imported.hex }}
                          />
                          <div className="idiff-color-info">
                            <span className="idiff-color-name">{imported.name}</span>
                            <span className="idiff-color-hex new">{imported.hex?.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <span className="idiff-item-badge idiff-badge-modify">已修改</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deleted.length > 0 && (
              <div className="idiff-section">
                <h4 className="idiff-section-title idiff-section-delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  颜色删除 ({deleted.length})
                </h4>
                <div className="idiff-color-list">
                  {deleted.map((color, index) => (
                    <div key={index} className="idiff-color-item idiff-item-delete">
                      <div
                        className="idiff-color-swatch"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="idiff-color-info">
                        <span className="idiff-color-name">{color.name}</span>
                        <span className="idiff-color-hex">{color.hex?.toUpperCase()}</span>
                      </div>
                      <span className="idiff-item-badge idiff-badge-delete">将删除</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="idiff-actions">
          <button className="idiff-btn idiff-btn-cancel" onClick={onCancel}>
            取消
          </button>
          {hasConflicts && (
            <button className="idiff-btn idiff-btn-apply" onClick={onApply}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              应用变更 ({totalChanges} 项)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportDiffDialog
