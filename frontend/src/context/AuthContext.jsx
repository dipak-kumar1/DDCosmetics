import React, { createContext, useEffect, useState } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('dd_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('dd_token') || null)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = (tokenValue, userObj) => {
    setToken(tokenValue)
    setUser(userObj)
    localStorage.setItem('dd_token', tokenValue)
    localStorage.setItem('dd_user', JSON.stringify(userObj))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('dd_token')
    localStorage.removeItem('dd_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
