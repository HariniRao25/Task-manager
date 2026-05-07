import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }, [])

  const login = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  // listen for global 401 events from api interceptors
  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('app:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('app:unauthorized', handleUnauthorized)
  }, [logout])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
