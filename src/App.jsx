import React from 'react'
import ColorPicker from './components/ColorPicker.jsx'
import MainApp from './components/MainApp.jsx'

function App({ isPicker }) {
  if (isPicker) {
    return <ColorPicker />
  }
  return <MainApp />
}

export default App
