import React, { useState, useEffect, useCallback } from 'react'
import TitleBar from './TitleBar.jsx'
import Sidebar from './Sidebar.jsx'
import PaletteView from './PaletteView.jsx'
import HistoryView from './HistoryView.jsx'
import FavoritesView from './FavoritesView.jsx'
import ContrastChecker from './ContrastChecker.jsx'
import ExportPanel from './ExportPanel.jsx'
import { generateId } from '../utils/colorUtils.js'
import './MainApp.css'

function MainApp() {
  const [activeView, setActiveView] = useState('palette')
  const [history, setHistory] = useState([])
  const [palettes, setPalettes] = useState([])
  const [favorites, setFavorites] = useState([])
  const [activePalette, setActivePalette] = useState(null)

  useEffect(() => {
    loadData()
    
    const api = window.electronAPI?.picker
    if (api) {
      api.onColorPicked((colorData) => {
        addColorToHistory(colorData)
      })
    }
  }, [])

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

  const addColorToPalette = (colorData, paletteId) => {
    const newColor = {
      id: generateId(),
      ...colorData,
      name: colorData.name || `颜色 ${palettes.find(p => p.id === paletteId)?.colors.length + 1 || 1}`
    }

    setPalettes(prev => {
      const updated = prev.map(palette => {
        if (palette.id === paletteId) {
          return { ...palette, colors: [...palette.colors, newColor] }
        }
        return palette
      })
      saveData('palettes', updated)
      return updated
    })
  }

  const removeColorFromPalette = (colorId, paletteId) => {
    setPalettes(prev => {
      const updated = prev.map(palette => {
        if (palette.id === paletteId) {
          return { ...palette, colors: palette.colors.filter(c => c.id !== colorId) }
        }
        return palette
      })
      saveData('palettes', updated)
      return updated
    })
  }

  const updateColorName = (colorId, paletteId, name) => {
    setPalettes(prev => {
      const updated = prev.map(palette => {
        if (palette.id === paletteId) {
          return {
            ...palette,
            colors: palette.colors.map(c => c.id === colorId ? { ...c, name } : c)
          }
        }
        return palette
      })
      saveData('palettes', updated)
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
      return updated
    })
    setActivePalette(newPalette.id)
  }

  const deletePalette = (paletteId) => {
    setPalettes(prev => {
      const updated = prev.filter(p => p.id !== paletteId)
      saveData('palettes', updated)
      return updated
    })
    if (activePalette === paletteId && palettes.length > 1) {
      setActivePalette(palettes.find(p => p.id !== paletteId)?.id)
    }
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
            startPicker={startPicker}
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
        return <ExportPanel palettes={palettes} />
      default:
        return null
    }
  }

  return (
    <div className="main-app">
      <TitleBar />
      <div className="app-body">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default MainApp
