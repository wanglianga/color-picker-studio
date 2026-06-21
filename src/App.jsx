import React from 'react'
import ColorPicker from './components/ColorPicker.jsx'
import MainApp from './components/MainApp.jsx'
import PickerOverlay from './components/PickerOverlay.jsx'

function App({ isPicker }) {
  const hash = window.location.hash

  if (hash === '#picker') {
    return <ColorPicker />
  }
  if (hash === '#overlay') {
    return <PickerOverlay />
  }
  return <MainApp />
}

export default App
