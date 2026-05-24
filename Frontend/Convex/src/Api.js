const BASE = 'https://convex-backend-jvog.onrender.com/api'

// ── DEBATES ──

export const createDebate = async (topic, isPrivate) => {
  const res = await fetch(`${BASE}/debates/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, is_private: isPrivate }),
  })
  if (!res.ok) throw new Error('Failed to create debate')
  return res.json()
}

export const joinDebateByCode = async (code) => {
  const res = await fetch(`${BASE}/debates/join/${code.toUpperCase()}/`)
  if (res.status === 404) throw new Error('Debate not found. Check the code and try again.')
  if (!res.ok) throw new Error('Failed to join debate')
  return res.json()
}

export const closeDebate = async (id) => {
  const res = await fetch(`${BASE}/debates/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'closed' }),
  })
  if (!res.ok) throw new Error('Failed to close debate')
  return res.json()
}

// ── ARGUMENTS ──

export const fetchArguments = async (debateId) => {
  const res = await fetch(`${BASE}/debates/${debateId}/arguments/`)
  if (!res.ok) throw new Error('Failed to fetch arguments')
  return res.json()
}

export const postArgument = async (debateId, side, text, author) => {
  const res = await fetch(`${BASE}/arguments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      debate: debateId,
      side: side.toLowerCase(),
      text,
      author: author || null,
    }),
  })
  if (!res.ok) throw new Error('Failed to post argument')
  return res.json()
}

// ── VOTES ──

export const castVote = async (argumentId, value) => {
  const res = await fetch(`${BASE}/votes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ argument: argumentId, value }),
  })
  if (!res.ok) throw new Error('Failed to cast vote')
  return res.json()
}