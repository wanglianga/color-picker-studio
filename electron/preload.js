import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  picker: {
    start: () => ipcRenderer.send('picker:start'),
    close: () => ipcRenderer.send('picker:close'),
    move: (x, y) => ipcRenderer.send('picker:move', { x, y }),
    confirm: (colorData) => ipcRenderer.send('picker:confirm', colorData),
    getPixelColor: (x, y) => ipcRenderer.invoke('picker:getPixelColor', { x, y }),
    onColorUpdate: (callback) => {
      ipcRenderer.on('color:update', (event, data) => callback(data))
    },
    onColorCapturing: (callback) => {
      ipcRenderer.on('color:capturing', (event, data) => callback(data))
    },
    onColorPicked: (callback) => {
      ipcRenderer.on('color:picked', (event, data) => callback(data))
    }
  },

  clipboard: {
    copy: (text) => ipcRenderer.invoke('clipboard:copy', text),
    read: () => ipcRenderer.invoke('clipboard:read')
  },

  screenshot: {
    capture: (x, y, width, height) => ipcRenderer.invoke('screenshot:capture', { x, y, width, height })
  },

  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key)
  },

  dialog: {
    save: (options) => ipcRenderer.invoke('dialog:save', options),
    open: (options) => ipcRenderer.invoke('dialog:open', options)
  },

  shell: {
    openPath: (path) => ipcRenderer.send('shell:openPath', path)
  },

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  }
})
