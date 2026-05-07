import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/register', { name, email, password })
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 shadow rounded">
        <h2 className="text-2xl font-semibold mb-6">Create an account</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" type="email" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded" type="password" required />
          </div>
          <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Register</button>
        </form>
        <p className="text-sm mt-4">Already have an account? <Link to="/login" className="text-indigo-600">Sign in</Link></p>
      </div>
    </div>
  )
}
