import { app, BrowserWindow, globalShortcut, ipcMain, screen, clipboard, dialog, shell } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import { createColorPickerWindow, closeColorPickerWindow, updateColorPickerPosition } from './colorPicker.js'
import { createMainWindow } from './mainWindow.js'
import { store } from './store.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow = null
let colorPickerWindow = null
let isPicking = false

const isDev = process.env.NODE_ENV === 'development'

app.whenReady().then(() => {
  mainWindow = createMainWindow(isDev)
  store.init(app.getPath('userData'))

  globalShortcut.register('Alt+Shift+C', () => {
    toggleColorPicker()
  })

  globalShortcut.register('Escape', () => {
    if (isPicking) {
      closePicker()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow(isDev)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

function toggleColorPicker() {
  if (isPicking) {
    closePicker()
  } else {
    startPicking()
  }
}

function startPicking() {
  isPicking = true
  colorPickerWindow = createColorPickerWindow(isDev)
  
  const cursor = screen.getCursorScreenPoint()
  updateColorPickerPosition(colorPickerWindow, cursor.x, cursor.y)
  captureColorAt(cursor.x, cursor.y)
}

function closePicker() {
  isPicking = false
  closeColorPickerWindow(colorPickerWindow)
  colorPickerWindow = null
}

function captureColorAt(x, y) {
  const display = screen.getDisplayNearestPoint({ x, y })
  const scaleFactor = display.scaleFactor
  
  const captureBounds = {
    x: Math.floor(x - 50),
    y: Math.floor(y - 50),
    width: 100,
    height: 100
  }

  display.workArea
  const actualBounds = {
    x: Math.floor((x - 50) * scaleFactor),
    y: Math.floor((y - 50) * scaleFactor),
    width: Math.floor(100 * scaleFactor),
    height: Math.floor(100 * scaleFactor)
  }

  if (colorPickerWindow && !colorPickerWindow.isDestroyed()) {
    colorPickerWindow.webContents.send('color:capturing', { x, y })
  }

  display.workAreaSize
  const displayBounds = display.bounds
  
  const captureX = Math.max(displayBounds.x, x - 1)
  const captureY = Math.max(displayBounds.y, y - 1)
  
  const allDisplays = screen.getAllDisplays()
  let targetDisplay = display
  
  for (const d of allDisplays) {
    if (x >= d.bounds.x && x < d.bounds.x + d.bounds.width &&
        y >= d.bounds.y && y < d.bounds.y + d.bounds.height) {
      targetDisplay = d
      break
    }
  }

  const relativeX = x - targetDisplay.bounds.x
  const relativeY = y - targetDisplay.bounds.y

  mainWindow.webContents.capturePage({
    x: Math.max(0, relativeX - 50),
    y: Math.max(0, relativeY - 50),
    width: 100,
    height: 100
  }).then(image => {
    if (colorPickerWindow && !colorPickerWindow.isDestroyed()) {
      const imageData = image.toDataURL()
      const centerX = 50
      const centerY = 50
      
      colorPickerWindow.webContents.send('color:update', {
        imageData,
        x,
        y,
        centerX,
        centerY,
        scaleFactor: targetDisplay.scaleFactor
      })
    }
  }).catch(err => {
    console.error('Capture error:', err)
  })
}

ipcMain.handle('picker:getPixelColor', async (event, { x, y }) => {
  const display = screen.getDisplayNearestPoint({ x, y })
  const scaleFactor = display.scaleFactor
  
  const relativeX = x - display.bounds.x
  const relativeY = y - display.bounds.y

  try {
    const image = await mainWindow.webContents.capturePage({
      x: Math.floor(relativeX),
      y: Math.floor(relativeY),
      width: 1,
      height: 1
    })
    
    const bitmap = image.toBitmap()
    const r = bitmap[0]
    const g = bitmap[1]
    const b = bitmap[2]
    const a = bitmap[3] || 255
    
    return { r, g, b, a }
  } catch (err) {
    console.error('Pixel capture error:', err)
    return { r: 0, g: 0, b: 0, a: 255 }
  }
})

ipcMain.on('picker:start', () => {
  startPicking()
})

ipcMain.on('picker:close', () => {
  closePicker()
})

ipcMain.on('picker:move', (event, { x, y }) => {
  if (colorPickerWindow && !colorPickerWindow.isDestroyed()) {
    updateColorPickerPosition(colorPickerWindow, x, y)
    captureColorAt(x, y)
  }
})

ipcMain.on('picker:confirm', (event, colorData) => {
  mainWindow.webContents.send('color:picked', colorData)
  closePicker()
})

ipcMain.handle('clipboard:copy', async (event, text) => {
  clipboard.writeText(text)
  return true
})

ipcMain.handle('clipboard:read', async () => {
  return clipboard.readText()
})

ipcMain.handle('screenshot:capture', async (event, { x, y, width, height }) => {
  const display = screen.getDisplayNearestPoint({ x, y })
  const relativeX = x - display.bounds.x
  const relativeY = y - display.bounds.y

  try {
    const image = await mainWindow.webContents.capturePage({
      x: Math.floor(relativeX),
      y: Math.floor(relativeY),
      width: Math.floor(width),
      height: Math.floor(height)
    })
    return image.toDataURL()
  } catch (err) {
    console.error('Screenshot error:', err)
    return null
  }
})

ipcMain.handle('store:get', async (event, key) => {
  return store.get(key)
})

ipcMain.handle('store:set', async (event, key, value) => {
  store.set(key, value)
  return true
})

ipcMain.handle('store:delete', async (event, key) => {
  store.delete(key)
  return true
})

ipcMain.handle('dialog:save', async (event, { defaultPath, filters }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters
  })
  return result
})

ipcMain.handle('dialog:open', async (event, { filters, properties }) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters,
    properties
  })
  return result
})

ipcMain.on('shell:openPath', (event, path) => {
  shell.openPath(path)
})

ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close()
})

export { mainWindow, colorPickerWindow, isPicking }
