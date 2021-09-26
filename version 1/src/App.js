import React from 'react'
import './App.css'
import VideoChatContainer from './VideoChatContainer'
import 'webrtc-adapter'

function App () {
  return (
    <div className='app'>
      <h1>Call Me Up</h1>
      <h2>WebRTC + Firebase</h2>
      <VideoChatContainer/>
    </div>
  )
}

export default App
