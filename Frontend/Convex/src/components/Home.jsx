import { useState } from 'react'
import './Home.css'


function Home({ onCreate, onJoin, onDebates, onAbout, error }) {
  const [topic, setTopic] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)

  const handleCreate = async () => {
    if (!topic.trim()) return
    setLoading('create')
    await onCreate(topic.trim(), isPrivate)
    setLoading(null)
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setLoading('join')
    await onJoin(joinCode.trim())
    setLoading(null)
  }

  return (
    <div className="home-page">

      {/* ── NAVBAR ── */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <a className="home-nav-brand" href="#">
            <img src={logo} alt="Logo" width="38" height="38" />
            <span className="home-nav-brand-text">Convex</span>
          </a>
          <div className="home-nav-links">
            <button className="home-nav-btn" onClick={onDebates}>Debates</button>
            <button className="home-nav-btn" onClick={onAbout}>About</button>
          </div>
          <p className="home-nav-tagline">Structured, real-time debates</p>
          <button
            className={`home-nav-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`home-nav-drawer ${menuOpen ? 'open' : ''}`}>
        <button className="home-nav-drawer-link" onClick={() => { onDebates(); setMenuOpen(false) }}>Debates</button>
        <button className="home-nav-drawer-link" onClick={() => { onAbout(); setMenuOpen(false) }}>About</button>
      </div>

      {/* ── CONTENT ── */}
      <div className="home-container">
        <div className="hero-section">
          <h1>Welcome to Convex</h1>
          <p>Engage in real-time debates and discussions.</p>
        </div>

        {error && <div className="home-error">{error}</div>}

        <div className="debate-cards-container">

          {/* ── CREATE CARD ── */}
          <div className="debate-card">
            <div className="card-body-custom">
              <span className="material-symbols-outlined icon-wrapper cyan">add</span>
              <h3>Create a new debate</h3>
              <p className="card-subtext">Start a new live debate with a unique code.</p>

              <div className="input-group-custom">
                <label>Debate topic</label>
                <input
                  type="text"
                  placeholder="e.g., AI will mostly benefit humanity"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  disabled={loading === 'create'}
                />
              </div>

              {/* ── PRIVACY TOGGLE ── */}
              <div className="privacy-toggle">
                <button
                  className={`privacy-btn ${!isPrivate ? 'active-public' : ''}`}
                  onClick={() => setIsPrivate(false)}
                  type="button"
                >
                  <span className="material-symbols-outlined">public</span>
                  Public
                </button>
                <button
                  className={`privacy-btn ${isPrivate ? 'active-private' : ''}`}
                  onClick={() => setIsPrivate(true)}
                  type="button"
                >
                  <span className="material-symbols-outlined">lock</span>
                  Private
                </button>
              </div>
              <p className="privacy-hint">
                {isPrivate
                  ? '🔒 Only people with the code can join.'
                  : '🌐 Visible to everyone in community debates.'}
              </p>

              <button
                className="create-btn"
                onClick={handleCreate}
                disabled={loading === 'create' || !topic.trim()}
              >
                {loading === 'create' ? 'Creating...' : 'Create Debate'}
              </button>
            </div>
          </div>

          {/* ── JOIN CARD ── */}
          <div className="debate-card">
            <div className="card-body-custom">
              <span className="material-symbols-outlined icon-wrapper blue">group</span>
              <h3>Join an existing debate</h3>
              <p className="card-subtext">Enter the debate code shared with you.</p>
              <div className="input-group-custom">
                <label>Debate code</label>
                <input
                  type="text"
                  placeholder="e.g., DBT-4X9Z"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  disabled={loading === 'join'}
                />
              </div>
              <button
                className="join-btn"
                onClick={handleJoin}
                disabled={loading === 'join' || !joinCode.trim()}
              >
                {loading === 'join' ? 'Joining...' : 'Join Debate'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home