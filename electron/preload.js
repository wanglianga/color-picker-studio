import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  picker: {
    start: () => ipcRenderer.send('picker:start'),
    close: () => ipcRenderer.send('picker:close'),
    move: (x, y) => ipcRenderer.send('picker:move', { x, y }),
    confirm: (colorData) => ipcRenderer.send('picker:confirm', colorData),
    getPixelColor: (x, y) => ipcRenderer.invoke('picker:getPixelColor', { x, y }),
    onColorUpdate: (callback) => {
      const listener = (event, data) => callback(data)
      ipcRenderer.on('color:update', listener)
      return () => ipcRenderer.removeListener('color:update', listener)
    },
    onColorCapturing: (callback) => {
      const listener = (event, data) => callback(data)
      ipcRenderer.on('color:capturing', listener)
      return () => ipcRenderer.removeListener('color:capturing', listener)
    },
    onColorPicked: (callback) => {
      const listener = (event, data) => callback(data)
      ipcRenderer.on('color:picked', listener)
      return () => ipcRenderer.removeListener('color:picked', listener)
    }
  },

  overlay: {
    onUpdate: (callback) => {
      const listener = (event, data) => callback(data)
      ipcRenderer.on('overlay:update', listener)
      return () => ipcRenderer.removeListener('overlay:update', listener)
    }
  },

  clipboard: {
    copy: (text) => ipcRenderer.invoke('clipboard:copy', text),
    read: () => ipcRenderer.invoke('clipboard:read')
  },

  screenshot: {
    capture: (x, y, width, height) => ipcRenderer.invoke('screenshot:capture', { x, y, width, height })
  },

  file: {
    saveText: (options) => ipcRenderer.invoke('file:saveText', options),
    saveImage: (options) => ipcRenderer.invoke('file:saveImage', options)
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
    openPath: (path) => ipcRenderer.send('shell:openPath', path),
    showItemInFolder: (fullPath) => ipcRenderer.send('shell:showItemInFolder', fullPath)
  },

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  }
})
