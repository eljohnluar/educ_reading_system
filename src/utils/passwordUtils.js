/**
 * Utility functions for evaluating and validating password strength
 */

export const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'At least one uppercase letter (A-Z)', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'At least one lowercase letter (a-z)', regex: /[a-z]/ },
  { id: 'number', label: 'At least one number (0-9)', regex: /[0-9]/ },
  { id: 'special', label: 'At least one special character (!@#$%^&*)', regex: /[^A-Za-z0-9]/ }
]

export function evaluatePassword(password = '') {
  if (!password) {
    return {
      score: 0,
      label: 'Empty',
      color: 'bg-gray-200',
      textColor: 'text-gray-400',
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      },
      isValid: false
    }
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  }

  const passedCount = Object.values(checks).filter(Boolean).length

  let score = 0
  let label = 'Very Weak'
  let color = 'bg-red-500'
  let textColor = 'text-red-500'

  if (passedCount <= 1) {
    score = 1
    label = 'Weak'
    color = 'bg-red-500'
    textColor = 'text-red-500'
  } else if (passedCount === 2 || passedCount === 3) {
    score = 2
    label = 'Fair'
    color = 'bg-amber-500'
    textColor = 'text-amber-500'
  } else if (passedCount === 4) {
    score = 3
    label = 'Good'
    color = 'bg-blue-500'
    textColor = 'text-blue-500'
  } else if (passedCount === 5) {
    score = 4
    label = 'Strong'
    color = 'bg-emerald-500'
    textColor = 'text-emerald-500'
  }

  const isValid = passedCount === 5

  return {
    score,
    passedCount,
    totalChecks: 5,
    label,
    color,
    textColor,
    checks,
    isValid
  }
}

export function validatePassword(password = '') {
  const evaluation = evaluatePassword(password)
  
  if (!evaluation.checks.length) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' }
  }
  if (!evaluation.checks.uppercase) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z).' }
  }
  if (!evaluation.checks.lowercase) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z).' }
  }
  if (!evaluation.checks.number) {
    return { isValid: false, error: 'Password must contain at least one number (0-9).' }
  }
  if (!evaluation.checks.special) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*).' }
  }

  return { isValid: true, error: null }
}
