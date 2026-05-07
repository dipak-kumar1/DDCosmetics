import React, { createContext, useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('dd_user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      console.error('Failed to parse user from localStorage', e)
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('dd_token') || null)

  // Synchronize token with axios defaults whenever it changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = useCallback((tokenValue, userObj) => {
    setToken(tokenValue)
    setUser(userObj)
    localStorage.setItem('dd_token', tokenValue)
    localStorage.setItem('dd_user', JSON.stringify(userObj))
    // Immediate header update for the very next request
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`
  }, [])

  const logout = useCallback((showToast = true) => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('dd_token')
    localStorage.removeItem('dd_user')
    delete api.defaults.headers.common['Authorization']
    if (showToast) {
      toast.success('Logged out successfully')
    }
  }, [])

  const updateUser = useCallback((userObj) => {
    setUser(userObj)
    localStorage.setItem('dd_user', JSON.stringify(userObj))
  }, [])

  // Handle unauthorized responses globally
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Prevent infinite logout loops if already on login page
          const isLoginPage = window.location.pathname.includes('login')
          if (!isLoginPage) {
            console.warn('Session expired or invalid, logging out...')
            logout(false)
            toast.error('Session expired. Please login again.')
          }
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
