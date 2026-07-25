// src/components/common/Footer.jsx
import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-cream/30 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Read Well English Zone. All rights reserved.
        </p>
      </div>
    </footer>
  )
}