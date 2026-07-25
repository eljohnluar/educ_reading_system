import React from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

export default function LandingNavbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'rgba(44, 62, 80, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
        }}
      >
        <img
          src="/assets/images/icons/logo.png"
          alt="Read Well"
          style={{ height: '36px', width: '36px' }}
          onError={(e) => {
            e.target.src = 'https://placehold.co/36x36/8BC34A/FFFFFF?text=RW'
          }}
        />
        <span
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.3px',
          }}
        >
          Read Well{' '}
          <span style={{ color: '#E9D2A9' }}>English Zone</span>
        </span>
      </Link>

      {/* Login Button */}
      <Link
        to="/login"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 28px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #E9D2A9, #d4b988)',
          color: '#2C3E50',
          fontSize: '0.9rem',
          fontWeight: 700,
          textDecoration: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 12px rgba(233, 210, 169, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(233, 210, 169, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(233, 210, 169, 0.3)'
        }}
      >
        Login →
      </Link>
    </nav>
  )
}
