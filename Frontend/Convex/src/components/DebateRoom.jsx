import React, { useState, useEffect, useCallback } from 'react'
import './DebateRoom.css'
import { fetchArguments, postArgument, castVote, closeDebate } from '../Api'

// ── ARGUMENT CARD ──
function ArgumentCard({ arg, side, onVoteChange }) {
  const [voted, setVoted] = useState(null)  // 'up' | 'down' | null
  const [loading, setLoading] = useState(false)

  const handleVote = async (dir) => {
    if (loading) return
    const value = dir === 'up' ? 1 : -1

    // If clicking same direction → undo with 0 (neutral)
    if (voted === dir) {
      setLoading(true)
      try {
        await castVote(arg.id, 0)
        setVoted(null)
        onVoteChange()
      } finally { setLoading(false) }
      return
    }

    setLoading(true)
    try {
      await castVote(arg.id, value)
      setVoted(dir)
      onVoteChange()
    } finally { setLoading(false) }
  }

  return (
    <div className="arg-card">
      <div className="arg-main">
        <p className="arg-text">{arg.text}</p>
        <div className="arg-meta">
          <span className="arg-author">{arg.author || 'Anonymous'}</span>
          <span className="arg-time">{new Date(arg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <div className="arg-votes">
        <button className="vote-btn more-btn">···</button>
        <button
          className={`vote-btn up ${voted === 'up' ? 'active-up' : ''}`}
          onClick={() => handleVote('up')}
          disabled={loading}
        >↑</button>
        <div className={`vote-count ${side === 'pro' ? 'cyan' : 'blue'}`}>
          <span className="vote-num">{arg.vote_score}</span>
          <span className="vote-label">votes</span>
        </div>
        <button
          className={`vote-btn down ${voted === 'down' ? 'active-down' : ''}`}
          onClick={() => handleVote('down')}
          disabled={loading}
        >↓</button>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ──
function DebateRoom({ debate, onExit }) {
  const [args, setArgs] = useState({ pro: [], con: [] })
  const [side, setSide] = useState('Pro')
  const [argument, setArgument] = useState('')
  const [name, setName] = useState('')
  const [posting, setPosting] = useState(false)
  const [closing, setClosing] = useState(false)
  const [debateStatus, setDebateStatus] = useState(debate.status)

  // ── Load arguments from backend ──
  const loadArguments = useCallback(async () => {
    try {
      const data = await fetchArguments(debate.id)
      setArgs({
        pro: data.filter(a => a.side === 'pro'),
        con: data.filter(a => a.side === 'con'),
      })
    } catch (e) {
      console.error('Failed to load arguments:', e)
    }
  }, [debate.id])

  // Load on mount + poll every 5s for live updates
  useEffect(() => {
    loadArguments()
    const interval = setInterval(loadArguments, 5000)
    return () => clearInterval(interval)
  }, [loadArguments])

  // ── Derived vote totals ──
  const proTotal = args.pro.reduce((sum, a) => sum + Math.max(0, a.vote_score), 0)
  const conTotal = args.con.reduce((sum, a) => sum + Math.max(0, a.vote_score), 0)
  const total = proTotal + conTotal
  const proPct = total === 0 ? 50 : Math.round((proTotal / total) * 100)
  const conPct = 100 - proPct
  const netTilt = proTotal - conTotal

  // ── Post argument ──
  const handlePost = async () => {
    if (!argument.trim() || posting) return
    setPosting(true)
    try {
      await postArgument(debate.id, side, argument.trim(), name.trim())
      setArgument('')
      setName('')
      await loadArguments()
    } catch (e) {
      console.error('Failed to post:', e)
    } finally {
      setPosting(false)
    }
  }

  // ── Close debate ──
  const handleClose = async () => {
    if (!window.confirm('Close this debate? No new arguments can be posted.')) return
    setClosing(true)
    try {
      await closeDebate(debate.id)
      setDebateStatus('closed')
    } catch (e) {
      console.error('Failed to close debate:', e)
    } finally {
      setClosing(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(debate.code)
      .then(() => alert(`Code "${debate.code}" copied!`))
      .catch(() => alert(`Share this code: ${debate.code}`))
  }

  const isClosed = debateStatus === 'closed'

  return (
    <div className="debate-room">

      {/* ── NAVBAR ── */}
      <nav className="dr-nav">
        <div className="dr-nav-left">
          <div className="dr-logo-icon">
            <span className="material-symbols-outlined">chat</span>
          </div>
          <span className="dr-logo-text">Convex</span>
        </div>
        <div className="dr-nav-right">
          <div className="dr-nav-item">
            <span className="material-symbols-outlined nav-icon">person</span>
            <span>Arguments</span>
            <span className="nav-badge">{args.pro.length + args.con.length}</span>
          </div>
          <div className="dr-live-pill">
            <span className={isClosed ? 'closed-dot' : 'live-dot'} />
            {isClosed ? 'Closed' : 'Live'}
          </div>
          <button className="dr-menu-btn">≡</button>
        </div>
      </nav>

      <div className="dr-body">

        {/* ── HEADER CARD ── */}
        <div className="dr-header-card">
          <div className="dr-header-top">
            <div>
              <h1 className="dr-topic">{debate.topic}</h1>
              <div className="dr-code-row">
                <span className="dr-code-label">Debate code:</span>
                <span className="dr-code">{debate.code}</span>
                <button className="dr-copy-btn" onClick={handleCopyCode} title="Copy code">⎘</button>
              </div>
            </div>
            <div className="dr-header-actions">
              <div className={`dr-status-pill ${isClosed ? 'closed' : ''}`}>
                <span className={isClosed ? 'status-dot-closed' : 'status-dot'} />
                {isClosed ? 'CLOSED' : 'OPEN'}
              </div>
              {!isClosed && (
                <button className="dr-close-btn" onClick={handleClose} disabled={closing}>
                  {closing ? 'Closing...' : 'Close Debate'} <span>×</span>
                </button>
              )}
              <button className="dr-exit-btn" onClick={onExit}>← Home</button>
            </div>
          </div>

          {/* ── LIVE VOTE BAR ── */}
          <div className="dr-vote-sides">
            <div className="vote-side">
              <span className="side-label pro">Pro</span>
              <span className="side-num pro">{proTotal}</span>
              <span className="side-sub">votes</span>
            </div>
            <div className="bar-wrap">
              <div className="bar-tilt-label">
                {total === 0
                  ? 'No votes yet'
                  : `Net tilt: ${netTilt >= 0 ? `Pro +${netTilt}` : `Con +${Math.abs(netTilt)}`}`}
              </div>
              <div className="vote-bar-track">
                <div className="vote-bar-fill" style={{ width: `${proPct}%` }} />
                <div className="vote-bar-thumb" style={{ left: `${proPct}%` }} />
              </div>
              <div className="bar-pct-row">
                <span className="pct pro">{proPct}%</span>
                <span className="total-label">Total votes: {total}</span>
                <span className="pct con">{conPct}%</span>
              </div>
            </div>
            <div className="vote-side">
              <span className="side-label con">Con</span>
              <span className="side-num con">{conTotal}</span>
              <span className="side-sub">votes</span>
            </div>
          </div>
        </div>

        {/* ── ARGUMENTS ── */}
        <div className="dr-args-grid">
          <div className="args-col">
            <div className="args-col-header">
              <h2>Pro Arguments</h2>
              <div className="col-underline pro" />
            </div>
            {args.pro.length === 0
              ? <p className="empty-msg">No pro arguments yet. Be the first!</p>
              : args.pro.map(a => (
                  <ArgumentCard key={a.id} arg={a} side="pro" onVoteChange={loadArguments} />
                ))
            }
          </div>
          <div className="args-col">
            <div className="args-col-header">
              <h2>Con Arguments</h2>
              <div className="col-underline con" />
            </div>
            {args.con.length === 0
              ? <p className="empty-msg">No con arguments yet. Be the first!</p>
              : args.con.map(a => (
                  <ArgumentCard key={a.id} arg={a} side="con" onVoteChange={loadArguments} />
                ))
            }
          </div>
        </div>

        {/* ── ADD ARGUMENT ── */}
        {isClosed ? (
          <div className="debate-closed-banner">
            🔒 This debate is closed. No new arguments can be posted.
          </div>
        ) : (
          <div className="dr-add-card">
            <h3 className="add-title">Add Argument</h3>
            <div className="add-body">
              <div className="add-side-col">
                <span className="add-label">Side</span>
                <button className={`side-btn pro-btn ${side === 'Pro' ? 'active' : ''}`} onClick={() => setSide('Pro')}>👍 Pro</button>
                <button className={`side-btn con-btn ${side === 'Con' ? 'active' : ''}`} onClick={() => setSide('Con')}>👎 Con</button>
              </div>
              <div className="add-text-col">
                <span className="add-label">Your argument</span>
                <textarea
                  className="add-textarea"
                  placeholder="Enter your argument..."
                  value={argument}
                  onChange={e => setArgument(e.target.value.slice(0, 1000))}
                />
                <div className="add-hint-row">
                  <span className="add-hint">Make your point clear, respectful, and convincing.</span>
                  <span className="add-char">{argument.length}/1000</span>
                </div>
              </div>
              <div className="add-name-col">
                <span className="add-label">Your name (optional)</span>
                <input
                  className="add-name-input"
                  placeholder="e.g., Alex"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <span className="add-name-hint">This will display with your argument.</span>
              </div>
              <div className="add-submit-col">
                <button
                  className="post-btn"
                  onClick={handlePost}
                  disabled={posting || !argument.trim()}
                >
                  <span className="post-icon">➤</span>
                  {posting ? 'Posting...' : 'Post Argument'}
                </button>
                <p className="post-terms">By posting, you agree to our <a href="#" className="post-link">community guidelines</a>.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="dr-footer">
          <div className="footer-left">
            <span className="footer-live-dot" />
            <span className="footer-live-text">Live updates</span>
            <span className="footer-sep">·</span>
            <span className="footer-sub">Refreshes every 5 seconds</span>
          </div>
          <div className="footer-right">
            <span className="footer-sub">Be respectful. Stay on topic. Change minds.</span>
            <span className="footer-sep">·</span>
            <span className="footer-shield">🛡</span>
            <span className="footer-sub">Community Guidelines</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DebateRoom