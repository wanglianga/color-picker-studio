import React, { useState } from 'react'
import './ChangeHistoryPanel.css'

const typeLabels = {
  add_color: '添加颜色',
  remove_color: '删除颜色',
  rename_color: '重命名颜色',
  modify_value: '修改色值',
  add_palette: '新建色板',
  delete_palette: '删除色板',
  import: '导入覆盖',
  restore: '恢复版本'
}

const sourceLabels = {
  manual: '手动输入',
  picker: '屏幕取色',
  import: '导入覆盖'
}

const typeIcons = {
  add_color: 'add',
  remove_color: 'remove',
  rename_color: 'rename',
  modify_value: 'modify',
  add_palette: 'add_palette',
  delete_palette: 'delete_palette',
  import: 'import',
  restore: 'restore'
}

function ChangeHistoryPanel({ changeHistory, currentPalettes, onCompare, onRestore, onClear, onClose }) {
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const groupedHistory = changeHistory.reduce((groups, record) => {
    const date = new Date(record.timestamp).toLocaleDateString('zh-CN')
    if (!groups[date]) groups[date] = []
    groups[date].push(record)
    return groups
  }, {})

  const filteredGroups = Object.entries(groupedHistory).reduce((acc, [date, records]) => {
    const filtered = filter === 'all' ? records : records.filter(r => r.type === filter)
    if (filtered.length > 0) {
      acc[date] = filtered
    }
    return acc
  }, {})

  const renderTypeIcon = (type) => {
    const iconMap = {
      add: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
      remove: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
      rename: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ),
      modify: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
        </svg>
      ),
      add_palette: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      delete_palette: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      import: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      ),
      restore: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 109-9c0 2-1 3-3 3"/>
          <polyline points="3 4 3 10 9 10"/>
        </svg>
      )
    }
    return iconMap[typeIcons[type]] || iconMap.modify
  }

  const getTypeClass = (type) => {
    if (type.startsWith('add')) return 'type-add'
    if (type.startsWith('remove') || type.startsWith('delete')) return 'type-remove'
    if (type === 'rename_color') return 'type-rename'
    if (type === 'modify_value') return 'type-modify'
    if (type === 'import') return 'type-import'
    if (type === 'restore') return 'type-restore'
    return ''
  }

  return (
    <div className="change-history-panel">
      <div className="chp-header">
        <h3 className="chp-title">变更历史</h3>
        <div className="chp-header-actions">
          <span className="chp-count">{changeHistory.length} 条记录</span>
          <button className="chp-close-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="chp-filters">
        <button
          className={`chp-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            className={`chp-filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="chp-content">
        {Object.keys(filteredGroups).length > 0 ? (
          Object.entries(filteredGroups).map(([date, records]) => (
            <div key={date} className="chp-group">
              <div className="chp-group-date">{date}</div>
              <div className="chp-timeline">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className={`chp-timeline-item ${getTypeClass(record.type)} ${expandedId === record.id ? 'expanded' : ''}`}
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                  >
                    <div className="chp-timeline-dot" />
                    <div className="chp-timeline-line" />
                    <div className="chp-timeline-content">
                      <div className="chp-record-header">
                        <div className="chp-record-type">
                          <span className={`chp-type-icon ${getTypeClass(record.type)}`}>
                            {renderTypeIcon(record.type)}
                          </span>
                          <span className="chp-type-label">{typeLabels[record.type] || record.type}</span>
                        </div>
                        <span className="chp-record-time">{formatTime(record.timestamp)}</span>
                      </div>

                      <div className="chp-record-detail">
                        {record.paletteName && (
                          <span className="chp-palette-tag">{record.paletteName}</span>
                        )}
                        {record.colorName && (
                          <span className="chp-color-name">{record.colorName}</span>
                        )}
                        <span className={`chp-source-tag source-${record.source}`}>
                          {sourceLabels[record.source] || record.source}
                        </span>
                      </div>

                      {expandedId === record.id && (
                        <div className="chp-record-expanded">
                          {record.before && record.after && record.type === 'modify_value' && (
                            <div className="chp-diff-row">
                              <div className="chp-diff-before">
                                <div
                                  className="chp-diff-swatch"
                                  style={{ backgroundColor: record.before.hex }}
                                />
                                <span className="chp-diff-value">{record.before.hex}</span>
                              </div>
                              <span className="chp-diff-arrow">→</span>
                              <div className="chp-diff-after">
                                <div
                                  className="chp-diff-swatch"
                                  style={{ backgroundColor: record.after.hex }}
                                />
                                <span className="chp-diff-value">{record.after.hex}</span>
                              </div>
                            </div>
                          )}

                          {record.before && record.after && record.type === 'rename_color' && (
                            <div className="chp-diff-row">
                              <span className="chp-diff-before-text">{record.before.name}</span>
                              <span className="chp-diff-arrow">→</span>
                              <span className="chp-diff-after-text">{record.after.name}</span>
                            </div>
                          )}

                          {record.type === 'add_color' && record.after && (
                            <div className="chp-diff-info">
                              <div
                                className="chp-diff-swatch"
                                style={{ backgroundColor: record.after.hex }}
                              />
                              <span>{record.after.hex}</span>
                            </div>
                          )}

                          {record.type === 'remove_color' && record.before && (
                            <div className="chp-diff-info removed">
                              <div
                                className="chp-diff-swatch"
                                style={{ backgroundColor: record.before.hex }}
                              />
                              <span>{record.before.hex}</span>
                            </div>
                          )}

                          {record.type === 'import' && record.after && (
                            <div className="chp-diff-info">
                              <span className="chp-import-summary">
                                +{record.after.added} 修改{record.after.modified} -{record.after.deleted}
                              </span>
                            </div>
                          )}

                          <div className="chp-record-actions">
                            <button
                              className="chp-action-btn compare-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                onCompare(record)
                              }}
                            >
                              对比当前
                            </button>
                            <button
                              className="chp-action-btn restore-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                onRestore(record.id)
                              }}
                            >
                              恢复至此
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="chp-empty">
            <div className="chp-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12a9 9 0 109-9c0 2-1 3-3 3"/>
                <polyline points="3 4 3 10 9 10"/>
              </svg>
            </div>
            <p className="chp-empty-text">暂无变更记录</p>
            <p className="chp-empty-hint">修改颜色后，变更会自动记录在这里</p>
          </div>
        )}
      </div>

      {changeHistory.length > 0 && (
        <div className="chp-footer">
          <button className="chp-clear-btn" onClick={onClear}>
            清空历史
          </button>
        </div>
      )}
    </div>
  )
}

export default ChangeHistoryPanel
