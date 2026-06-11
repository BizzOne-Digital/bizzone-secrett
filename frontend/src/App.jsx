import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { isLoggedIn, getUser } from './api'

export default function App() {
  const [authed, setAuthed] = useState(isLoggedIn())
  const [user, setUser] = useState(getUser())

  const handleLogin = (userData) => {
    setUser(userData)
    setAuthed(true)
  }

  const handleLogout = () => {
    setAuthed(false)
    setUser(null)
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
