import { BrowserWindow, screen } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let colorPickerWindow = null

export function createColorPickerWindow(isDev) {
  const displays = screen.getAllDisplays()
  const primaryDisplay = screen.getPrimaryDisplay()
  
  colorPickerWindow = new BrowserWindow({
    width: 280,
    height: 320,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: false,
    hasShadow: true,
    show: false,
    backgroundColor: '#16213e',
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
    colorPickerWindow.show()
  })

  return colorPickerWindow
}

export function closeColorPickerWindow(window) {
  if (window && !window.isDestroyed()) {
    window.close()
  }
  colorPickerWindow = null
}

export function updateColorPickerPosition(window, mouseX, mouseY) {
  if (!window || window.isDestroyed()) return

  const display = screen.getDisplayNearestPoint({ x: mouseX, y: mouseY })
  const workArea = display.workArea
  
  const windowWidth = 280
  const windowHeight = 320
  
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
