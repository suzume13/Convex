import { useState, useEffect } from 'react'
import './Debates.css'

const BASE = 'http://127.0.0.1:8000/api'

export const saveDebateToHistory = (debate) => {
  const history = getDebateHistory()
  const exists = history.find(d => d.id === debate.id)
  if (!exists) {
    localStorage.setItem('convex_debates', JSON.stringify([debate, ...history]))
  }
}

export const getDebateHistory = () => {
  try { return JSON.parse(localStorage.getItem('convex_debates')) || [] }
  catch { return [] }
}

// Track which debates the user CREATED (vs just joined)
export const saveCreatedDebate = (debateId) => {
  const created = getCreatedDebates()
  if (!created.includes(debateId)) {
    localStorage.setItem('convex_created', JSON.stringify([debateId, ...created]))
  }
}

export const getCreatedDebates = () => {
  try { return JSON.parse(localStorage.getItem('convex_created')) || [] }
  catch { return [] }
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      <span className={`status-dot-sm ${status}`} />
      {status === 'open' ? 'Open' : 'Closed'}
    </span>
  )
}

function DebateCard({ debate, onOpen, mine, onDelete }) {
  const date = new Date(debate.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div className={`dcard ${debate.status === 'closed' ? 'dcard-closed' : ''}`}>
      <div className="dcard-top">
        <StatusBadge status={debate.status} />
        {mine && <span className="mine-tag">Mine</span>}
        {debate.is_private
          ? <span className="privacy-tag private">🔒 Private</span>
          : <span className="privacy-tag public">🌐 Public</span>
        }
        <button
          className="dcard-remove-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(debate, mine) }}
          title={mine ? 'Delete debate' : 'Remove from list'}
        >
          ✕
        </button>
      </div>
      <h3 className="dcard-topic">{debate.topic}</h3>
      <div className="dcard-meta">
        <span className="dcard-code">{debate.code}</span>
        <span className="dcard-sep">·</span>
        <span className="dcard-date">{date}</span>
        <span className="dcard-sep">·</span>
        <span className="dcard-args">{debate.argument_count ?? 0} arguments</span>
      </div>
      <button
        className={`dcard-btn ${debate.status === 'open' ? 'open' : 'closed'}`}
        onClick={() => onOpen(debate, mine)}
      >
        {debate.is_private && !mine ? '🔒 ' : ''}
        {debate.status === 'open' ? 'Enter Debate →' : 'View (Closed)'}
      </button>
    </div>
  )
}

// ── Code verification modal ──
function CodeModal({ debate, onConfirm, onCancel }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === debate.code.toUpperCase()) {
      onConfirm()
    } else {
      setError('Incorrect code. Please try again.')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">🔒 Private Debate</h3>
        <p className="modal-desc">Enter the code to access this debate.</p>
        <div className="modal-topic">"{debate.topic}"</div>
        <input
          className="modal-input"
          type="text"
          placeholder="e.g., DBT-4X9Z"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-confirm" onClick={handleSubmit}>Enter Debate</button>
        </div>
      </div>
    </div>
  )
}

// ── Delete / Remove confirmation modal ──
function DeleteModal({ debate, isMine, isCreator, onConfirm, onCancel, loading }) {
  const isPermanent = isMine && isCreator

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">
          {isPermanent ? '🗑️ Delete Debate?' : '✕ Remove from List?'}
        </h3>
        <p className="modal-desc">
          {isPermanent
            ? 'This will permanently delete the debate and all its arguments from the database. This cannot be undone.'
            : 'This will remove the debate from your list. It will still exist for others.'}
        </p>
        <div className="modal-topic">"{debate.topic}"</div>
        {isPermanent && (
          <div className="modal-warning">
            ⚠️ Permanent deletion — all arguments and votes will be lost.
          </div>
        )}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`modal-confirm ${isPermanent ? 'danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? 'Deleting...'
              : isPermanent ? 'Delete Permanently' : 'Remove from List'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Debates({ onOpen, onBack }) {
  const [allDebates, setAllDebates] = useState([])
  const [myDebates, setMyDebates] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [pendingDebate, setPendingDebate] = useState(null)       // for code modal
  const [deleteTarget, setDeleteTarget] = useState(null)         // { debate, isMine, isCreator }
  const [deleteLoading, setDeleteLoading] = useState(false)

  const createdIds = getCreatedDebates()

  useEffect(() => {
    const history = getDebateHistory()
    fetch(`${BASE}/debates/`)
      .then(r => r.json())
      .then(data => {
        const myIds = new Set(history.map(d => d.id))
        setMyDebates(history.map(mine => data.find(d => d.id === mine.id) || mine))
        setAllDebates(data.filter(d => !myIds.has(d.id)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleOpen = (debate, mine) => {
    if (mine) {
      onOpen(debate)
    } else if (debate.is_private) {
      setPendingDebate(debate)
    } else {
      onOpen(debate)
    }
  }

  const handleCodeConfirmed = () => {
    onOpen(pendingDebate)
    setPendingDebate(null)
  }

  const handleDeleteClick = (debate, isMine) => {
    const isCreator = createdIds.includes(debate.id)
    setDeleteTarget({ debate, isMine, isCreator })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const { debate, isMine, isCreator } = deleteTarget
    setDeleteLoading(true)

    try {
      if (isMine && isCreator) {
        // Permanently delete from database
        await fetch(`${BASE}/debates/${debate.id}/`, { method: 'DELETE' })

        // Remove from localStorage too
        const history = getDebateHistory().filter(d => d.id !== debate.id)
        localStorage.setItem('convex_debates', JSON.stringify(history))
        const created = getCreatedDebates().filter(id => id !== debate.id)
        localStorage.setItem('convex_created', JSON.stringify(created))

        setMyDebates(prev => prev.filter(d => d.id !== debate.id))

      } else if (isMine) {
        // Just joined — remove from localStorage only
        const history = getDebateHistory().filter(d => d.id !== debate.id)
        localStorage.setItem('convex_debates', JSON.stringify(history))
        setMyDebates(prev => prev.filter(d => d.id !== debate.id))

      } else {
        // Community debate — hide from list (localStorage dismissed list)
        const dismissed = JSON.parse(localStorage.getItem('convex_dismissed') || '[]')
        localStorage.setItem('convex_dismissed', JSON.stringify([debate.id, ...dismissed]))
        setAllDebates(prev => prev.filter(d => d.id !== debate.id))
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }

    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  const filtered = (list) => {
    if (filter === 'open') return list.filter(d => d.status === 'open')
    if (filter === 'closed') return list.filter(d => d.status === 'closed')
    return list
  }

  return (
    <div className="debates-page">

      {pendingDebate && (
        <CodeModal
          debate={pendingDebate}
          onConfirm={handleCodeConfirmed}
          onCancel={() => setPendingDebate(null)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          debate={deleteTarget.debate}
          isMine={deleteTarget.isMine}
          isCreator={deleteTarget.isCreator}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      <div className="debates-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div>
          <h1 className="debates-title">Debate History</h1>
          <p className="debates-sub">Browse all debates or revisit ones you've joined.</p>
        </div>
        <div className="filter-tabs">
          {['all', 'open', 'closed'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="debates-loading">Loading debates...</div>
      ) : (
        <div className="debates-grid">
          <div className="debates-col">
            <div className="col-header">
              <h2 className="col-title">My Debates</h2>
              <span className="col-count">{filtered(myDebates).length}</span>
            </div>
            <div className="col-underline cyan" />
            {filtered(myDebates).length === 0
              ? <p className="empty-col">No debates yet. Create or join one!</p>
              : filtered(myDebates).map(d => (
                  <DebateCard
                    key={d.id}
                    debate={d}
                    onOpen={handleOpen}
                    mine={true}
                    onDelete={handleDeleteClick}
                  />
                ))
            }
          </div>

          <div className="debates-col">
            <div className="col-header">
              <h2 className="col-title">Community Debates</h2>
              <span className="col-count">{filtered(allDebates).length}</span>
            </div>
            <div className="col-underline blue" />
            {filtered(allDebates).length === 0
              ? <p className="empty-col">No other debates found.</p>
              : filtered(allDebates).map(d => (
                  <DebateCard
                    key={d.id}
                    debate={d}
                    onOpen={handleOpen}
                    mine={false}
                    onDelete={handleDeleteClick}
                  />
                ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default Debates