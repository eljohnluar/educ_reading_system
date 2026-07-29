import React from 'react'
import { Check, X } from 'lucide-react'
import { evaluatePassword, PASSWORD_REQUIREMENTS } from '../../utils/passwordUtils'

export default function PasswordStrengthMeter({ password = '', showChecklist = true }) {
  if (!password) return null

  const evaluation = evaluatePassword(password)
  const { score, label, color, textColor, checks } = evaluation

  // 4 segments calculation 
  const getSegmentBg = (index) => {
    if (score >= index) {
      return color
    }
    return 'bg-gray-200'
  }

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Strength Bar & Label Header */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-600">Password Strength:</span>
        <span className={`font-semibold ${textColor} transition-colors duration-300`}>
          {label}
        </span>
      </div>

      {/* Meter Bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        <div className={`h-full rounded-full transition-all duration-300 ${getSegmentBg(1)}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${getSegmentBg(2)}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${getSegmentBg(3)}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${getSegmentBg(4)}`} />
      </div>

      {/* Checklist */}
      {showChecklist && (
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-gray-50/80 rounded-lg p-2.5 border border-gray-100">
          {PASSWORD_REQUIREMENTS.map((req) => {
            const isMet = checks[req.id]
            return (
              <div key={req.id} className="flex items-center space-x-1.5 transition-all duration-200">
                {isMet ? (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                    <X className="w-2.5 h-2.5 stroke-[2]" />
                  </span>
                )}
                <span className={`text-[11px] ${isMet ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                  {req.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
