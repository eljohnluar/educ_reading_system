import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import LandingNavbar from './LandingNavbar'
// ❌ Remove: import CookieConsent from '../common/CookieConsent'
import './LandingPage.css'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const features = [
  {
    icon: '🎮',
    title: ' Learning',
    desc: 'Turn reading practice into an exciting adventure with points, levels, and rewards that keep you motivated.',
    bg: 'rgba(139, 195, 74, 0.12)',
    accent: '#8BC34A',
  },
  {
    icon: '📊',
    title: 'Multiple Difficulty Levels',
    desc: 'Progress from Easy to Average to Difficult — each level adapts to your growing comprehension skills.',
    bg: 'rgba(255, 183, 77, 0.12)',
    accent: '#FFB74D',
  },
  {
    icon: '📈',
    title: 'Track Your Progress',
    desc: 'See your scores, completed levels, and reading stats all in one beautiful dashboard.',
    bg: 'rgba(206, 147, 216, 0.12)',
    accent: '#CE93D8',
  },
  {
    icon: '📖',
    title: 'Engaging Stories',
    desc: 'Read curated English stories designed to build vocabulary and comprehension at every level.',
    bg: 'rgba(100, 181, 246, 0.12)',
    accent: '#64B5F6',
  },
  {
    icon: '❓',
    title: 'Interactive Quizzes',
    desc: 'Test your understanding with fun, challenging quizzes after each story to reinforce learning.',
    bg: 'rgba(233, 210, 169, 0.12)',
    accent: '#E9D2A9',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    desc: 'Compete with fellow learners and climb the ranks on the school leaderboard.',
    bg: 'rgba(239, 83, 80, 0.12)',
    accent: '#EF5350',
  },
]

const steps = [
  { emoji: '📝', title: 'Sign Up', desc: 'Create your free account in seconds and set up your learner profile.' },
  { emoji: '📖', title: 'Read Stories', desc: 'Dive into carefully curated English stories matched to your level.' },
  { emoji: '🧠', title: 'Take Quizzes', desc: 'Answer comprehension questions and earn scores to unlock new levels.' },
]

export default function LandingPage() {
  const { user, loading } = useAuth()

  // If the user is already logged in, redirect to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: 0, textAlign: 'left', border: 'none', minHeight: '100vh' }}>
      <LandingNavbar />

      {/* Hero Section */}
      <section className="landing-hero">
        {/* Floating decorative books */}
        <span className="floating-book">📚</span>
        <span className="floating-book">📖</span>
        <span className="floating-book">✏️</span>
        <span className="floating-book">🎓</span>
        <span className="floating-book">📕</span>

        <motion.h1
          className="hero-title"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          Master English Reading,{' '}
          <span className="highlight">One Story at a Time</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          An interactive,  platform that helps students improve their
          English comprehension through engaging stories, quizzes, and
          progressive difficulty levels.
        </motion.p>

        <motion.div
          className="hero-buttons"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          <Link to="/register" className="btn-primary">
             Get Started 
          </Link>
          <Link to="/login" className="btn-secondary">
            Already a member? Login
          </Link>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <motion.section
        className="landing-stats"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="stat-item">
          <div className="stat-number">3<span className="accent">+</span></div>
          <div className="stat-label">Difficulty Levels</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">📖</div>
          <div className="stat-label">Curated Stories</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">🏆</div>
          <div className="stat-label">Live Leaderboard</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">100<span className="accent">%</span></div>
          <div className="stat-label">Free to Use</div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="landing-features">
        <div style={{ textAlign: 'center' }}>
          <motion.span
            className="section-eyebrow"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Features
          </motion.span>
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Everything You Need to Excel
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
          >
            Built to make English reading fun, engaging, and rewarding for learners at every level.
          </motion.p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              style={{ '--card-accent': f.accent }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <div className="feature-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how-it-works">
        <div style={{ textAlign: 'center' }}>
          <motion.span
            className="section-eyebrow"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            How It Works
          </motion.span>
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Start Learning in 3 Simple Steps
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
          >
            Getting started is easy. No complicated setup required.
          </motion.p>
        </div>

        <div className="steps-container">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="step-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className="step-number">{i + 1}</div>
              <div className="step-emoji">{step.emoji}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <h2 className="cta-title">Ready to Begin Your Journey?</h2>
          <p className="cta-subtitle">
            Join students who are already improving their English reading skills through our learning platform.
          </p>
          <br />
          <Link to="/register" className="btn-dark">
             Create Free Account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          © {new Date().getFullYear()}{' '}
          <span className="footer-brand">Read Well English Zone</span>. All rights reserved.
        </p>
      </footer>

      {/* ❌ CookieConsent REMOVED - Now in App.jsx  */}
    </div>
  )
}