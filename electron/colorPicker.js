import { BrowserWindow, screen } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let colorPickerWindow = null
let overlayWindow = null

export function createColorPickerWindow(isDev) {
  colorPickerWindow = new BrowserWindow({
    width: 280,
    height: 340,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: false,
    hasShadow: true,
    show: false,
    backgroundColor: '#16213e',
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    colorPickerWindow.loadURL('http://localhost:5173#picker')
  } else {
    colorPickerWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'picker'
    })
  }

  colorPickerWindow.once('ready-to-show', () => {
    colorPickerWindow.showInactive()
  })

  colorPickerWindow.setIgnoreMouseEvents(true, { forward: true })

  return colorPickerWindow
}

export function createOverlayWindow(isDev) {
  const displays = screen.getAllDisplays()
  let minX = 0, minY = 0, maxX = 0, maxY = 0

  for (const d of displays) {
    minX = Math.min(minX, d.bounds.x)
    minY = Math.min(minY, d.bounds.y)
    maxX = Math.max(maxX, d.bounds.x + d.bounds.width)
    maxY = Math.max(maxY, d.bounds.y + d.bounds.height)
  }

  overlayWindow = new BrowserWindow({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    focusable: true,
    hasShadow: false,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    overlayWindow.loadURL('http://localhost:5173#overlay')
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'overlay'
    })
  }

  overlayWindow.once('ready-to-show', () => {
    overlayWindow.show()
    overlayWindow.focus()
  })

  return overlayWindow
}

export function closeColorPickerWindow(window) {
  if (window && !window.isDestroyed()) {
    window.close()
  }
  colorPickerWindow = null
}

export function closeOverlayWindow(window) {
  if (window && !window.isDestroyed()) {
    window.setClosable(true)
    window.close()
  }
  overlayWindow = null
}

export function updateColorPickerPosition(window, mouseX, mouseY) {
  if (!window || window.isDestroyed()) return

  const display = screen.getDisplayNearestPoint({ x: mouseX, y: mouseY })
  const workArea = display.workArea

  const windowWidth = 280
  const windowHeight = 340

  let x = mouseX + 20
  let y = mouseY + 20

  if (x + windowWidth > workArea.x + workArea.width) {
    x = mouseX - windowWidth - 20
  }

  if (y + windowHeight > workArea.y + workArea.height) {
    y = mouseY - windowHeight - 20
  }

  x = Math.max(workArea.x, x)
  y = Math.max(workArea.y, y)

  window.setPosition(Math.floor(x), Math.floor(y))
}

export function getColorPickerWindow() {
  return colorPickerWindow
}

export function getOverlayWindow() {
  return overlayWindow
}
