import fs from 'fs'
import path from 'path'

class Store {
  constructor() {
    this.data = {}
    this.filePath = null
  }

  init(userDataPath) {
    this.filePath = path.join(userDataPath, 'color-picker-storage.json')
    this.load()
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(raw)
      } else {
        this.data = this.getDefaultData()
        this.save()
      }
    } catch (err) {
      console.error('Store load error:', err)
      this.data = this.getDefaultData()
    }
  }

  getDefaultData() {
    return {
      history: [],
      palettes: [],
      favorites: [],
      recentProjects: [],
      exportHistory: [],
      settings: {
        shortcut: 'Alt+Shift+C',
        defaultFormat: 'hex',
        autoCopy: true,
        showMagnifier: true
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
    } catch (err) {
      console.error('Store save error:', err)
    }
  }

  get(key) {
    return this.data[key]
  }

  set(key, value) {
    this.data[key] = value
    this.save()
  }

  delete(key) {
    delete this.data[key]
    this.save()
  }
}

export const store = new Store()
