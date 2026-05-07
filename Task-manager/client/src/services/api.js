import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
})

// Attach token from localStorage to every request (keeps header in sync)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Global response handler: on 401 remove credentials and notify app
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      try {
        // dispatch a simple event so the UI can react (logout, redirect)
        window.dispatchEvent(new Event('app:unauthorized'))
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error)
  }
)

export default api
