import React from 'react'
import './About.css'

function About({ onBack }) {
  return (
    <div className="about-page">

      {/* ── BACK BUTTON ── */}
      <div className="about-topbar">
        <button className="about-back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="about-container">

        {/* ── WHAT IS CONVEX ── */}
        <div className="about-card">
          <div className="about-section">
            <div className="about-icon-wrap cyan">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <div className="about-text">
              <h2 className="about-heading">What is Convex?</h2>
              <p className="about-desc">
                Convex is a structured live debate platform that helps people
                exchange ideas, challenge perspectives, and see how opinions
                shift in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="about-divider" />

        {/* ── HOW IT WORKS ── */}
        <div className="about-card">
          <div className="about-section">
            <div className="about-icon-wrap blue">
              <span className="material-symbols-outlined">settings</span>
            </div>
            <div className="about-text">
              <h2 className="about-heading">How it works</h2>
              <p className="about-desc">Three simple steps to better debates.</p>
            </div>
          </div>

          <div className="steps-row">
            <div className="step-item">
              <div className="step-icon-wrap">
                <span className="material-symbols-outlined">group_add</span>
              </div>
              <div className="step-body">
                <div className="step-title-row">
                  <span className="step-num">1</span>
                  <span className="step-title">Create or join<br />a debate</span>
                </div>
                <p className="step-desc">Start a new debate or enter a code to join an existing one.</p>
              </div>
            </div>

            <span className="step-arrow">→</span>

            <div className="step-item">
              <div className="step-icon-wrap">
                <span className="material-symbols-outlined">chat_bubble</span>
              </div>
              <div className="step-body">
                <div className="step-title-row">
                  <span className="step-num">2</span>
                  <span className="step-title">Post<br />arguments</span>
                </div>
                <p className="step-desc">Share your perspective, respond to others, and keep it respectful.</p>
              </div>
            </div>

            <span className="step-arrow">→</span>

            <div className="step-item">
              <div className="step-icon-wrap">
                <span className="material-symbols-outlined">bar_chart</span>
              </div>
              <div className="step-body">
                <div className="step-title-row">
                  <span className="step-num">3</span>
                  <span className="step-title">Vote and watch<br />the tilt move</span>
                </div>
                <p className="step-desc">Upvote or downvote ideas and see the persuasion shift live.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-divider" />

        {/* ── MVP LIMITATIONS ── */}
        <div className="about-card">
          <div className="about-section">
            <div className="about-icon-wrap purple">
              <span className="material-symbols-outlined">info</span>
            </div>
            <div className="about-text">
              <h2 className="about-heading">MVP limitations</h2>
              <p className="about-desc">Convex is an MVP. Here's what to know:</p>
            </div>
          </div>

          <div className="limits-row">
            <div className="limit-card">
              <div className="limit-icon-wrap">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div>
                <p className="limit-title">No full authentication</p>
                <p className="limit-desc">Debates are anonymous and not tied to accounts.</p>
              </div>
            </div>

            <div className="limit-card">
              <div className="limit-icon-wrap">
                <span className="material-symbols-outlined">podcasts</span>
              </div>
              <div>
                <p className="limit-title">Simple live updates</p>
                <p className="limit-desc">Real-time features use polling for now.</p>
              </div>
            </div>

            <div className="limit-card">
              <div className="limit-icon-wrap">
                <span className="material-symbols-outlined">desktop_windows</span>
              </div>
              <div>
                <p className="limit-title">Local & demo focused</p>
                <p className="limit-desc">Built for demonstration and learning purposes.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="about-footer">
        <span className="footer-text">Made with curiosity and clarity.</span>
        <span className="footer-heart">💙</span>
        <a href="#" className="footer-link">Convex Team</a>
      </footer>

    </div>
  )
}

export default About