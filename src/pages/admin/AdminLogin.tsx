import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      login(data.token)
      navigate('/admin/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-display mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-accent/20 text-accent p-3 rounded">{error}</div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
