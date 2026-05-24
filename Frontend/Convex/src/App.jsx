import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import DebateRoom from './components/DebateRoom'
import About from './components/About'
import Debates from './components/Debates'
import { saveDebateToHistory, saveCreatedDebate } from './components/Debates'
import { createDebate, joinDebateByCode } from './api'

function App() {
  const [page, setPage] = useState('home')
  const [debate, setDebate] = useState(null)
  const [error, setError] = useState('')

  const openDebate = (debateData) => {
    setDebate(debateData)
    setPage('debate')
  }

  const handleCreate = async (topic, isPrivate) => {
    try {
      setError('')
      const data = await createDebate(topic, isPrivate)
      saveDebateToHistory(data)
      saveCreatedDebate(data.id)  // mark as created by this user
      openDebate(data)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleJoin = async (code) => {
    try {
      setError('')
      const data = await joinDebateByCode(code)
      if (data.status === 'closed') {
        setError('This debate is closed and no longer accepting arguments.')
        return
      }
      saveDebateToHistory(data)  // joined via code → save, but NOT marked as created
      openDebate(data)
    } catch (e) {
      setError(e.message)
    }
  }

  const goHome = () => { setPage('home'); setDebate(null); setError('') }
  const goDebates = () => setPage('debates')
  const goAbout = () => setPage('about')

  if (page === 'debate' && debate) {
    return <DebateRoom debate={debate} onExit={goHome} />
  }

  if (page === 'debates') {
    return <Debates onOpen={openDebate} onBack={goHome} />
  }

  if (page === 'about') {
    return <About onBack={goHome} />
  }

  return (
    <Home
      onCreate={handleCreate}
      onJoin={handleJoin}
      onDebates={goDebates}
      onAbout={goAbout}
      error={error}
    />
  )
}

export default App