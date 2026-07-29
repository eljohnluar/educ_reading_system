// src/components/common/PrivacyPolicy.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './PrivacyPolicy.css'

export default function PrivacyPolicy() {
  const { user, isAdmin } = useAuth()

  // ✅ Determine where to redirect based on user status
  const getBackRoute = () => {
    if (!user) return "/"           // Guest → Landing Page
    if (isAdmin) return "/admin"    // Admin → Admin Dashboard
    return "/dashboard"             // Regular User → Dashboard
  }

  // ✅ Determine label for the link
  const getBackLabel = () => {
    if (!user) return "← Back to Home"
    if (isAdmin) return "← Back to Admin"
    return "← Back to Dashboard"
  }

  return (
    <div className="privacy-policy-page">
      {/* Navbar - Similar to LandingNavbar */}
      <nav className="privacy-navbar">
        <Link to={getBackRoute()} className="privacy-navbar-brand">
          <img
            src="/assets/images/icons/logo.svg"
            alt="Read Well"
            className="privacy-navbar-logo"
            onError={(e) => {
              e.target.src = 'https://placehold.co/36x36/8BC34A/FFFFFF?text=RW'
            }}
          />
          <span className="privacy-navbar-title">
            Read Well <span className="text-gold">English Zone</span>
          </span>
        </Link>

        {/* Back Button */}
        <Link
          to={getBackRoute()}
          className="privacy-navbar-back"
        >
          {getBackLabel()}
        </Link>
      </nav>

      {/* Hero Section - Matching Landing Page */}
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <div className="privacy-hero-badge">Privacy Policy</div>
          <h1 className="privacy-hero-title">
            Your Privacy <span className="highlight">Matters to Us</span>
          </h1>
          <p className="privacy-hero-subtitle">
            Read Well English Zone is committed to protecting your personal information.
            Learn how we collect, use, and safeguard your data.
          </p>
          <p className="privacy-hero-date">Last Updated: July 2026</p>
        </div>
      </section>

      {/* Content - Matching Landing Page Features Style */}
      <section className="privacy-content">
        <div className="privacy-content-inner">
          {/* Section 1 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">1. Information We Collect</h2>
            <p className="privacy-section-text">
              When you create an account and use Read Well English Zone, we collect the following information:
            </p>
            <ul className="privacy-section-list">
              <li><strong>Username</strong> - Your chosen display name</li>
              <li><strong>Email Address</strong> - For account verification, login, and communication</li>
              <li><strong>Profile Picture</strong> - Optional image you upload</li>
              <li><strong>Reading Progress</strong> - Stories read, quiz scores, and levels completed</li>
              <li><strong>Activity Data</strong> - Login times, quiz attempts, and story reading history</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">2. How We Use Your Information</h2>
            <ul className="privacy-section-list">
              <li>To create and manage your account</li>
              <li>To track your reading progress and achievements</li>
              <li>To personalize your learning experience</li>
              <li>To send you important account-related notifications</li>
              <li>To improve our platform and content</li>
              <li>To generate leaderboard rankings</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">3. Data Storage & Security</h2>
            <ul className="privacy-section-list">
              <li>Your data is stored securely on our servers using industry-standard encryption</li>
              <li>Your password is never stored in plain text</li>
              <li>Regular security audits and updates are performed</li>
              <li>You can request data deletion at any time</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">4. Cookies</h2>
            <p className="privacy-section-text">
              We use essential cookies to keep you logged in and remember your preferences. 
              These cookies are necessary for the platform to function properly. 
              You can manage your cookie preferences in your browser settings.
            </p>
            <div className="privacy-cookie-types">
              <div className="privacy-cookie-type">
                <span className="privacy-cookie-dot essential"></span>
                <div>
                  <span className="privacy-cookie-name">Essential</span>
                  <span className="privacy-cookie-desc">Login sessions, security</span>
                </div>
              </div>
              <div className="privacy-cookie-type">
                <span className="privacy-cookie-dot functionality"></span>
                <div>
                  <span className="privacy-cookie-name">Functionality</span>
                  <span className="privacy-cookie-desc">Preferences, theme settings</span>
                </div>
              </div>
              <div className="privacy-cookie-type">
                <span className="privacy-cookie-dot analytics"></span>
                <div>
                  <span className="privacy-cookie-name">Analytics</span>
                  <span className="privacy-cookie-desc">Usage patterns (if enabled)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">5. Your Rights</h2>
            <p className="privacy-section-text">You have the right to:</p>
            <ul className="privacy-section-list">
              <li><strong>Access</strong> - Request a copy of your personal data</li>
              <li><strong>Update</strong> - Correct or update your information anytime</li>
              <li><strong>Delete</strong> - Request account deletion and removal of your data</li>
              <li><strong>Opt-out</strong> - Choose not to receive non-essential communications</li>
              <li><strong>Portability</strong> - Request your data in a portable format</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">6. Children's Privacy</h2>
            <p className="privacy-section-text">
              Read Well English Zone is designed for learners of all ages. We do not knowingly 
              collect personal information from children without parental consent. If you believe 
              we have collected information from a child, please contact us immediately.
            </p>
          </div>

          {/* Section 7 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">7. Changes to This Policy</h2>
            <p className="privacy-section-text">
              We may update this Privacy Policy from time to time. We will notify you of any 
              significant changes by posting the new policy on this page and updating the 
              "Last Updated" date.
            </p>
          </div>

          {/* Section 8 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">8. Contact Us</h2>
            <p className="privacy-section-text">
              If you have any questions, concerns, or requests regarding your privacy, 
              please contact us:
            </p>
            <div className="privacy-contact">
              <div className="privacy-contact-item">
                <div>
                  <p className="privacy-contact-label">Email</p>
                  <a href="mailto:support@readwellzone.com" className="privacy-contact-link">
                    support@readwellzone.com
                  </a>
                </div>
              </div>
              <div className="privacy-contact-item">
                <div>
                  <p className="privacy-contact-label">Website</p>
                  <a href="https://educ-reading-system.vercel.app" className="privacy-contact-link" target="_blank" rel="noopener noreferrer">
                    educ-reading-system.vercel.app
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Matching Landing Page */}
      <footer className="privacy-footer">
        <p>
          © {new Date().getFullYear()}{' '}
          <span className="privacy-footer-brand">Read Well English Zone</span>. All rights reserved.
        </p>
      </footer>
    </div>
  )
}