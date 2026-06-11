import React, { useState } from 'react'
import { login, register } from '../api'

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let data
      if (isRegister) {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return }
        data = await register(name.trim(), email.trim(), password)
      } else {
        data = await login(email.trim(), password)
      }
      onLogin(data)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">Bizz<span>1</span></div>
        <div className="login-sub">Business Hub</div>
        <div className="login-title">{isRegister ? 'Create Account' : 'Sign In'}</div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="login-field">
              <label className="login-label">Full Name</label>
              <input className="login-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ahmed Khan" autoComplete="name" />
            </div>
          )}
          <div className="login-field">
            <label className="login-label">Email</label>
            <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@bizz1.com" autoComplete="email" required />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={6} />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="login-toggle">
          {isRegister ? (
            <>Already have an account? <a onClick={() => { setIsRegister(false); setError('') }}>Sign In</a></>
          ) : (
            <>No account yet? <a onClick={() => { setIsRegister(true); setError('') }}>Create One</a></>
          )}
        </div>
      </div>
    </div>
  )
}
