import { app, BrowserWindow, globalShortcut, ipcMain, screen, clipboard, dialog, shell, desktopCapturer, nativeImage } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs/promises'
import { createColorPickerWindow, closeColorPickerWindow, updateColorPickerPosition, createOverlayWindow, closeOverlayWindow } from './colorPicker.js'
import { createMainWindow } from './mainWindow.js'
import { store } from './store.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow = null
let colorPickerWindow = null
let overlayWindow = null
let isPicking = false
let lastScreenCapture = null
let lastCaptureDisplayId = null
let nativeImageChannelMap = null

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
  overlayWindow = createOverlayWindow(isDev)

  const cursor = screen.getCursorScreenPoint()
  updateColorPickerPosition(colorPickerWindow, cursor.x, cursor.y)
  captureScreen(cursor.x, cursor.y).then(() => {
    captureColorAt(cursor.x, cursor.y)
  })
}

function closePicker() {
  isPicking = false
  closeColorPickerWindow(colorPickerWindow)
  closeOverlayWindow(overlayWindow)
  colorPickerWindow = null
  overlayWindow = null
  lastScreenCapture = null
}

async function captureScreen(x, y) {
  try {
    const display = screen.getDisplayNearestPoint({ x, y })
    const displays = screen.getAllDisplays()
    const displayIndex = displays.findIndex(d => d.id === display.id)

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: display.bounds.width * display.scaleFactor,
        height: display.bounds.height * display.scaleFactor
      }
    })

    let targetSource = sources[0]
    if (sources.length > 1 && displayIndex >= 0) {
      const source = sources.find(s => {
        const displayMatch = s.display_id === display.id.toString() ||
          s.name.includes(`Display ${displayIndex + 1}`) ||
          s.name === display.label
        return displayMatch
      })
      if (source) targetSource = source
    }

    if (targetSource) {
      lastScreenCapture = {
        image: targetSource.thumbnail,
        display: display,
        scaleFactor: display.scaleFactor
      }
      lastCaptureDisplayId = display.id
    }
  } catch (err) {
    console.error('Screen capture error:', err)
  }
}

function getPixelFromCapture(x, y) {
  if (!lastScreenCapture) {
    return { r: 0, g: 0, b: 0, a: 255 }
  }

  const { image, display, scaleFactor } = lastScreenCapture
  const relativeX = (x - display.bounds.x) * scaleFactor
  const relativeY = (y - display.bounds.y) * scaleFactor

  try {
    const bitmap = image.toBitmap()
    const width = image.getSize().width
    const channels = 4
    const pxX = Math.floor(Math.max(0, Math.min(width - 1, relativeX)))
    const pxY = Math.floor(Math.max(0, Math.min(image.getSize().height - 1, relativeY)))
    const offset = (pxY * width + pxX) * channels
    const channelMap = getNativeImageChannelMap()

    return {
      r: bitmap[offset + channelMap.r] || 0,
      g: bitmap[offset + channelMap.g] || 0,
      b: bitmap[offset + channelMap.b] || 0,
      a: bitmap[offset + channelMap.a] || 255
    }
  } catch (err) {
    console.error('Pixel read error:', err)
    return { r: 0, g: 0, b: 0, a: 255 }
  }
}

function getNativeImageChannelMap() {
  if (nativeImageChannelMap) return nativeImageChannelMap

  const probe = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGMQNC4HAAEUALzPozMEAAAAAElFTkSuQmCC').toBitmap()
  const bytes = Array.from(probe.slice(0, 4))
  nativeImageChannelMap = {
    r: bytes.indexOf(0x11),
    g: bytes.indexOf(0x33),
    b: bytes.indexOf(0x77),
    a: bytes.indexOf(0xff)
  }

  if (Object.values(nativeImageChannelMap).some(index => index < 0)) {
    nativeImageChannelMap = { r: 0, g: 1, b: 2, a: 3 }
  }

  return nativeImageChannelMap
}

function getMagnifierRegion(x, y, size = 100) {
  if (!lastScreenCapture) return null

  const { image, display, scaleFactor } = lastScreenCapture
  const halfSize = Math.floor(size / 2)
  const relativeX = (x - display.bounds.x) * scaleFactor
  const relativeY = (y - display.bounds.y) * scaleFactor

  try {
    const cropX = Math.max(0, Math.floor(relativeX - halfSize * scaleFactor))
    const cropY = Math.max(0, Math.floor(relativeY - halfSize * scaleFactor))
    const cropSize = size * scaleFactor

    const cropped = image.crop({
      x: cropX,
      y: cropY,
      width: Math.min(cropSize, image.getSize().width - cropX),
      height: Math.min(cropSize, image.getSize().height - cropY)
    })

    return cropped.resize({ width: size, height: size }).toDataURL()
  } catch (err) {
    console.error('Magnifier crop error:', err)
    return null
  }
}

function getSourceScreenshot() {
  if (!lastScreenCapture) return null
  return lastScreenCapture.image.toDataURL()
}

function captureColorAt(x, y) {
  const display = screen.getDisplayNearestPoint({ x, y })

  if (lastCaptureDisplayId !== display.id || !lastScreenCapture) {
    captureScreen(x, y).then(() => {
      sendColorUpdate(x, y, display)
    })
  } else {
    sendColorUpdate(x, y, display)
  }
}

function sendColorUpdate(x, y, display) {
  if (colorPickerWindow && !colorPickerWindow.isDestroyed()) {
    const pixel = getPixelFromCapture(x, y)
    const magnifierData = getMagnifierRegion(x, y, 200)

    colorPickerWindow.webContents.send('color:update', {
      pixel,
      x,
      y,
      displayId: display.id,
      scaleFactor: display.scaleFactor,
      magnifierImage: magnifierData
    })
  }

  if (overlayWindow && !overlayWindow.isDestroyed()) {
    const pixel = getPixelFromCapture(x, y)
    const magnifierData = getMagnifierRegion(x, y, 160)
    overlayWindow.webContents.send('overlay:update', {
      x,
      y,
      pixel,
      magnifierImage: magnifierData
    })
  }
}

ipcMain.handle('picker:getPixelColor', async (event, { x, y }) => {
  const display = screen.getDisplayNearestPoint({ x, y })
  if (lastCaptureDisplayId !== display.id || !lastScreenCapture) {
    await captureScreen(x, y)
  }
  return getPixelFromCapture(x, y)
})

ipcMain.on('picker:start', () => {
  startPicking()
})

ipcMain.on('picker:close', () => {
  closePicker()
})

ipcMain.on('picker:move', async (event, { x, y }) => {
  if (colorPickerWindow && !colorPickerWindow.isDestroyed()) {
    updateColorPickerPosition(colorPickerWindow, x, y)
    const display = screen.getDisplayNearestPoint({ x, y })
    if (lastCaptureDisplayId !== display.id || !lastScreenCapture) {
      await captureScreen(x, y)
    }
    captureColorAt(x, y)
  }
})

ipcMain.on('picker:confirm', (event, colorData) => {
  const screenshot = getSourceScreenshot()
  const finalData = {
    ...colorData,
    screenshot: screenshot,
    source: '屏幕取色'
  }
  mainWindow.webContents.send('color:picked', finalData)
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
  if (lastCaptureDisplayId !== display.id || !lastScreenCapture) {
    await captureScreen(x, y)
  }

  if (!lastScreenCapture) return null

  const { image, scaleFactor } = lastScreenCapture
  const relativeX = (x - display.bounds.x) * scaleFactor
  const relativeY = (y - display.bounds.y) * scaleFactor

  try {
    const cropped = image.crop({
      x: Math.max(0, Math.floor(relativeX)),
      y: Math.max(0, Math.floor(relativeY)),
      width: Math.floor(width * scaleFactor),
      height: Math.floor(height * scaleFactor)
    })
    return cropped.toDataURL()
  } catch (err) {
    console.error('Screenshot capture error:', err)
    return null
  }
})

ipcMain.handle('file:saveText', async (event, { defaultPath, filters, content }) => {
  try {
    if (typeof content !== 'string') {
      return { success: false, error: 'Invalid file content' }
    }

    const ownerWindow = BrowserWindow.fromWebContents(event.sender) || mainWindow
    const result = await dialog.showSaveDialog(ownerWindow, {
      defaultPath,
      filters
    })

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true }
    }

    await fs.writeFile(result.filePath, content, 'utf-8')
    return { success: true, filePath: result.filePath }
  } catch (err) {
    console.error('File write error:', err)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('file:saveImage', async (event, { defaultPath, filters, dataUrl }) => {
  try {
    const match = typeof dataUrl === 'string' ? dataUrl.match(/^data:image\/(?:png|jpeg|jpg|webp);base64,(.+)$/) : null
    if (!match) {
      return { success: false, error: 'Invalid image data' }
    }

    const ownerWindow = BrowserWindow.fromWebContents(event.sender) || mainWindow
    const result = await dialog.showSaveDialog(ownerWindow, {
      defaultPath,
      filters
    })

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true }
    }

    const buffer = Buffer.from(match[1], 'base64')
    await fs.writeFile(result.filePath, buffer)
    return { success: true, filePath: result.filePath }
  } catch (err) {
    console.error('Image write error:', err)
    return { success: false, error: err.message }
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

ipcMain.on('shell:showItemInFolder', (event, fullPath) => {
  shell.showItemInFolder(fullPath)
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
