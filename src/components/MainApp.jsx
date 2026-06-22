import React, { useState, useEffect, useCallback, useRef } from 'react'
import TitleBar from './TitleBar.jsx'
import Sidebar from './Sidebar.jsx'
import PaletteView from './PaletteView.jsx'
import HistoryView from './HistoryView.jsx'
import FavoritesView from './FavoritesView.jsx'
import ContrastChecker from './ContrastChecker.jsx'
import ExportPanel from './ExportPanel.jsx'
import ChangeHistoryPanel from './ChangeHistoryPanel.jsx'
import VersionCompare from './VersionCompare.jsx'
import ImportDiffDialog from './ImportDiffDialog.jsx'
import { generateId } from '../utils/colorUtils.js'
import './MainApp.css'

function MainApp() {
  const [activeView, setActiveView] = useState('palette')
  const [history, setHistory] = useState([])
  const [palettes, setPalettes] = useState([])
  const [favorites, setFavorites] = useState([])
  const [activePalette, setActivePalette] = useState(null)
  const [changeHistory, setChangeHistory] = useState([])
  const [showChangePanel, setShowChangePanel] = useState(false)
  const [compareVersion, setCompareVersion] = useState(null)
  const [importDiff, setImportDiff] = useState(null)

  const palettesRef = useRef(palettes)
  palettesRef.current = palettes

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const api = window.electronAPI?.picker
    if (api) {
      const unsubscribe = api.onColorPicked((colorData) => {
        addColorToHistory(colorData)
        if (activePalette) {
          addColorToPalette(colorData, activePalette, 'picker')
        }
      })

      return () => {
        if (unsubscribe) unsubscribe()
      }
    }
  }, [activePalette])

  const loadData = async () => {
    const api = window.electronAPI?.store
    if (!api) return

    try {
      const historyData = await api.get('history')
      if (historyData) setHistory(historyData)

      const palettesData = await api.get('palettes')
      if (palettesData && palettesData.length > 0) {
        setPalettes(palettesData)
        setActivePalette(palettesData[0].id)
      } else {
        const defaultPalette = {
          id: generateId(),
          name: '默认色板',
          colors: [],
          createdAt: Date.now()
        }
        setPalettes([defaultPalette])
        setActivePalette(defaultPalette.id)
        await api.set('palettes', [defaultPalette])
      }

      const favoritesData = await api.get('favorites')
      if (favoritesData) setFavorites(favoritesData)

      const changeHistoryData = await api.get('changeHistory')
      if (changeHistoryData) setChangeHistory(changeHistoryData)
    } catch (err) {
      console.error('Load data error:', err)
    }
  }

  const saveData = useCallback(async (key, data) => {
    const api = window.electronAPI?.store
    if (api) {
      await api.set(key, data)
    }
  }, [])

  const recordChange = useCallback((action) => {
    const { type, source, paletteId, paletteName, colorId, colorName, before, after } = action
    const snapshot = JSON.parse(JSON.stringify(palettesRef.current))

    const record = {
      id: generateId(),
      timestamp: Date.now(),
      type,
      source: source || 'manual',
      paletteId: paletteId || null,
      paletteName: paletteName || '',
      colorId: colorId || null,
      colorName: colorName || '',
      before: before || null,
      after: after || null,
      snapshot
    }

    setChangeHistory(prev => {
      const updated = [record, ...prev].slice(0, 200)
      saveData('changeHistory', updated)
      return updated
    })
  }, [saveData])

  const addColorToHistory = (colorData) => {
    const newColor = {
      id: generateId(),
      ...colorData
    }

    setHistory(prev => {
      const updated = [newColor, ...prev].slice(0, 100)
      saveData('history', updated)
      return updated
    })
  }

  const addColorToPalette = (colorData, paletteId, source = 'manual') => {
    setPalettes(prev => {
      let targetPalette = prev.find(p => p.id === paletteId)
      const updated = prev.map(palette => {
        if (palette.id === paletteId) {
          const newColor = {
            id: generateId(),
            ...colorData,
            name: colorData.name || `颜色 ${palette.colors.length + 1}`
          }
          targetPalette = palette
          return { ...palette, colors: [...palette.colors, newColor] }
        }
        return palette
      })
      saveData('palettes', updated)

      palettesRef.current = updated
      recordChange({
        type: 'add_color',
        source,
        paletteId,
        paletteName: targetPalette?.name || '',
        colorName: colorData.name || `颜色 ${(targetPalette?.colors?.length || 0) + 1}`,
        before: null,
        after: { hex: colorData.hex, rgb: colorData.rgb, hsl: colorData.hsl }
      })

      return updated
    })
  }

  const removeColorFromPalette = (colorId, paletteId) => {
    setPalettes(prev => {
      let removedColor = null
      let targetPaletteName = ''
      const updated = prev.map(palette => {
        if (palette.id === paletteId) {
          removedColor = palette.colors.find(c => c.id === colorId)
          targetPaletteName = palette.name
          return { ...palette, colors: palette.colors.filter(c => c.id !== colorId) }
        }
        return palette
      })
      saveData('palettes', updated)

      palettesRef.current = updated
      if (removedColor) {
        recordChange({
          type: 'remove_color',
          source: 'manual',
          paletteId,
          paletteName: targetPaletteName,
          colorId,
          colorName: removedColor.name,
          before: { hex: removedColor.hex, rgb: removedColor.rgb, hsl: removedColor.hsl, name: removedColor.name },
          after: null
        })
      }

      return updated
    })
  }

  const updateColorName = (colorId, paletteId, name) => {
    setPalettes(prev => {
      let oldName = ''
      let targetColor = null
      let targetPaletteName = ''
      const updated = prev.map(palette => {
        if (palette.id === paletteId) {
          targetPaletteName = palette.name
          return {
            ...palette,
            colors: palette.colors.map(c => {
              if (c.id === colorId) {
                oldName = c.name
                targetColor = c
                return { ...c, name }
              }
              return c
            })
          }
        }
        return palette
      })
      saveData('palettes', updated)

      palettesRef.current = updated
      if (targetColor) {
        recordChange({
          type: 'rename_color',
          source: 'manual',
          paletteId,
          paletteName: targetPaletteName,
          colorId,
          colorName: name,
          before: { name: oldName },
          after: { name }
        })
      }

      return updated
    })
  }

  const updateColorValue = (colorId, paletteId, newHex, newRgb, newHsl, source = 'manual') => {
    setPalettes(prev => {
      let oldColor = null
      let targetPaletteName = ''
      const updated = prev.map(palette => {
        if (palette.id === paletteId) {
          targetPaletteName = palette.name
          return {
            ...palette,
            colors: palette.colors.map(c => {
              if (c.id === colorId) {
                oldColor = c
                return { ...c, hex: newHex, rgb: newRgb, hsl: newHsl }
              }
              return c
            })
          }
        }
        return palette
      })
      saveData('palettes', updated)

      palettesRef.current = updated
      if (oldColor) {
        recordChange({
          type: 'modify_value',
          source,
          paletteId,
          paletteName: targetPaletteName,
          colorId,
          colorName: oldColor.name,
          before: { hex: oldColor.hex, rgb: oldColor.rgb, hsl: oldColor.hsl },
          after: { hex: newHex, rgb: newRgb, hsl: newHsl }
        })
      }

      return updated
    })
  }

  const addPalette = (name) => {
    const newPalette = {
      id: generateId(),
      name,
      colors: [],
      createdAt: Date.now()
    }

    setPalettes(prev => {
      const updated = [...prev, newPalette]
      saveData('palettes', updated)

      palettesRef.current = updated
      recordChange({
        type: 'add_palette',
        source: 'manual',
        paletteId: newPalette.id,
        paletteName: name,
        before: null,
        after: { name, colorCount: 0 }
      })

      return updated
    })
    setActivePalette(newPalette.id)
  }

  const deletePalette = (paletteId) => {
    setPalettes(prev => {
      const target = prev.find(p => p.id === paletteId)
      const updated = prev.filter(p => p.id !== paletteId)
      saveData('palettes', updated)

      palettesRef.current = updated
      if (target) {
        recordChange({
          type: 'delete_palette',
          source: 'manual',
          paletteId,
          paletteName: target.name,
          before: { name: target.name, colorCount: target.colors.length },
          after: null
        })
      }

      return updated
    })
    if (activePalette === paletteId && palettes.length > 1) {
      setActivePalette(palettes.find(p => p.id !== paletteId)?.id)
    }
  }

  const restoreToVersion = (versionId) => {
    const version = changeHistory.find(v => v.id === versionId)
    if (!version || !version.snapshot) return

    const restored = JSON.parse(JSON.stringify(version.snapshot))
    setPalettes(restored)
    saveData('palettes', restored)

    palettesRef.current = restored
    recordChange({
      type: 'restore',
      source: 'manual',
      paletteName: '恢复版本',
      before: null,
      after: null
    })

    if (restored.length > 0) {
      setActivePalette(restored[0].id)
    }
  }

  const handleImportWithDiff = (importedColors, paletteName) => {
    const currentPalette = palettes.find(p => p.id === activePalette)
    if (!currentPalette) return

    const currentMap = new Map()
    currentPalette.colors.forEach(c => {
      const key = (c.name || '').toLowerCase().replace(/\s+/g, '-')
      currentMap.set(key, c)
    })

    const importedMap = new Map()
    importedColors.forEach(c => {
      const key = (c.name || '').toLowerCase().replace(/\s+/g, '-')
      importedMap.set(key, c)
    })

    const added = []
    const modified = []
    const deleted = []
    const unchanged = []

    importedColors.forEach(c => {
      const key = (c.name || '').toLowerCase().replace(/\s+/g, '-')
      const existing = currentMap.get(key)
      if (!existing) {
        added.push(c)
      } else if (existing.hex.toLowerCase() !== c.hex.toLowerCase()) {
        modified.push({ current: existing, imported: c })
      } else {
        unchanged.push(c)
      }
    })

    currentPalette.colors.forEach(c => {
      const key = (c.name || '').toLowerCase().replace(/\s+/g, '-')
      if (!importedMap.has(key)) {
        deleted.push(c)
      }
    })

    setImportDiff({
      paletteName: paletteName || currentPalette.name,
      added,
      modified,
      deleted,
      unchanged,
      importedColors
    })
  }

  const applyImport = () => {
    if (!importDiff) return

    setPalettes(prev => {
      const updated = prev.map(palette => {
        if (palette.id === activePalette) {
          const merged = [...palette.colors]

          importDiff.added.forEach(c => {
            merged.push({ id: generateId(), ...c })
          })

          importDiff.modified.forEach(({ imported }) => {
            const key = (imported.name || '').toLowerCase().replace(/\s+/g, '-')
            const idx = merged.findIndex(c => (c.name || '').toLowerCase().replace(/\s+/g, '-') === key)
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], hex: imported.hex, rgb: imported.rgb, hsl: imported.hsl }
            }
          })

          importDiff.deleted.forEach(c => {
            const key = (c.name || '').toLowerCase().replace(/\s+/g, '-')
            const idx = merged.findIndex(ci => (ci.name || '').toLowerCase().replace(/\s+/g, '-') === key)
            if (idx >= 0) {
              merged.splice(idx, 1)
            }
          })

          return { ...palette, colors: merged }
        }
        return palette
      })
      saveData('palettes', updated)

      palettesRef.current = updated
      recordChange({
        type: 'import',
        source: 'import',
        paletteId: activePalette,
        paletteName: importDiff.paletteName,
        before: null,
        after: {
          added: importDiff.added.length,
          modified: importDiff.modified.length,
          deleted: importDiff.deleted.length
        }
      })

      return updated
    })

    setImportDiff(null)
  }

  const addToFavorites = (colorData) => {
    const newColor = {
      id: generateId(),
      ...colorData
    }

    setFavorites(prev => {
      const exists = prev.some(c => c.hex === colorData.hex)
      if (exists) return prev
      const updated = [newColor, ...prev]
      saveData('favorites', updated)
      return updated
    })
  }

  const removeFromFavorites = (colorId) => {
    setFavorites(prev => {
      const updated = prev.filter(c => c.id !== colorId)
      saveData('favorites', updated)
      return updated
    })
  }

  const startPicker = () => {
    const api = window.electronAPI?.picker
    if (api) {
      api.start()
    }
  }

  const clearHistory = () => {
    setHistory([])
    saveData('history', [])
  }

  const clearChangeHistory = () => {
    setChangeHistory([])
    saveData('changeHistory', [])
  }

  const toggleChangePanel = () => {
    setShowChangePanel(prev => !prev)
  }

  const openVersionCompare = (version) => {
    setCompareVersion(version)
  }

  const closeVersionCompare = () => {
    setCompareVersion(null)
  }

  const renderContent = () => {
    switch (activeView) {
      case 'palette':
        return (
          <PaletteView
            palettes={palettes}
            activePalette={activePalette}
            setActivePalette={setActivePalette}
            addPalette={addPalette}
            deletePalette={deletePalette}
            addColorToPalette={addColorToPalette}
            removeColorFromPalette={removeColorFromPalette}
            updateColorName={updateColorName}
            updateColorValue={updateColorValue}
            startPicker={startPicker}
            toggleChangePanel={toggleChangePanel}
          />
        )
      case 'history':
        return (
          <HistoryView
            history={history}
            addColorToPalette={addColorToPalette}
            addToFavorites={addToFavorites}
            clearHistory={clearHistory}
            activePalette={activePalette}
          />
        )
      case 'favorites':
        return (
          <FavoritesView
            favorites={favorites}
            removeFromFavorites={removeFromFavorites}
            addColorToPalette={addColorToPalette}
            activePalette={activePalette}
          />
        )
      case 'contrast':
        return <ContrastChecker />
      case 'export':
        return (
          <ExportPanel
            palettes={palettes}
            onImportWithDiff={handleImportWithDiff}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="main-app">
      <TitleBar />
      <div className="app-body">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          changeHistoryCount={changeHistory.length}
          toggleChangePanel={toggleChangePanel}
          showChangePanel={showChangePanel}
        />
        <div className="content-area">
          {renderContent()}
        </div>
        {showChangePanel && (
          <ChangeHistoryPanel
            changeHistory={changeHistory}
            currentPalettes={palettes}
            onCompare={openVersionCompare}
            onRestore={restoreToVersion}
            onClear={clearChangeHistory}
            onClose={() => setShowChangePanel(false)}
          />
        )}
      </div>
      {compareVersion && (
        <VersionCompare
          version={compareVersion}
          currentPalettes={palettes}
          onClose={closeVersionCompare}
          onRestore={restoreToVersion}
        />
      )}
      {importDiff && (
        <ImportDiffDialog
          diff={importDiff}
          onApply={applyImport}
          onCancel={() => setImportDiff(null)}
        />
      )}
    </div>
  )
}

export default MainApp
