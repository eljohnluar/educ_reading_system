import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Read Well English Zone. All rights reserved.
      </div>
    </footer>
  )
}