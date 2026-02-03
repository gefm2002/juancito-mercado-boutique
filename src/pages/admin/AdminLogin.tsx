import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import { supabase } from '../../lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'change-me-in-production'

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
      // En desarrollo, usar Supabase directamente
      // En producción, usar Netlify Functions
      if (import.meta.env.DEV) {
        // Login directo con Supabase (solo en desarrollo)
        const { data: admin, error: supabaseError } = await supabase
          .from('juancito_admins')
          .select('*')
          .eq('email', email.toLowerCase())
          .eq('is_active', true)
          .single()

        if (supabaseError || !admin) {
          throw new Error('Credenciales inválidas')
        }

        // Verificar password (necesitamos bcrypt en el cliente, mejor usar función)
        // Por ahora, usar función pero con mejor manejo de errores
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          const errorText = await res.text()
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            throw new Error('No se puede conectar a las funciones. Ejecuta: npm install -g netlify-cli && netlify dev')
          }
          throw new Error(errorData.error || 'Error al iniciar sesión')
        }

        const data = await res.json()
        login(data.token)
        navigate('/admin/dashboard')
      } else {
        // En producción, usar función normalmente
        const res = await fetch('/.netlify/functions/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Error al iniciar sesión')
        }

        const data = await res.json()
        login(data.token)
        navigate('/admin/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
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
