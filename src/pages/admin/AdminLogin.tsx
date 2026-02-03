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
      // Intentar con /api (proxy de Vite a netlify dev)
      let res
      try {
        res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
      } catch (fetchError) {
        throw new Error('No se puede conectar a las funciones. Ejecuta: netlify dev (en otra terminal)')
      }

      if (!res.ok) {
        const errorText = await res.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          throw new Error(`Error del servidor: ${errorText.substring(0, 100)}`)
        }
        throw new Error(errorData.error || `Error ${res.status}`)
      }

      const text = await res.text()
      if (!text) {
        throw new Error('Respuesta vacía del servidor. Verifica que netlify dev esté corriendo.')
      }

      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Respuesta no es JSON válido. Verifica que netlify dev esté corriendo en puerto 8888.`)
      }

      if (!data.token) {
        throw new Error('No se recibió token de autenticación')
      }

      login(data.token)
      navigate('/admin/dashboard')
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
            <div className="bg-accent/20 text-accent p-3 rounded">
              {error}
              {error.includes('netlify dev') && (
                <div className="mt-2 text-sm">
                  <p>Ejecuta en otra terminal:</p>
                  <code className="bg-primary/20 p-1 rounded">netlify dev</code>
                </div>
              )}
            </div>
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
