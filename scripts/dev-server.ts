import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config({ path: '.env.local' })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.NETLIFY_JWT_SECRET || 'change-me-in-production'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' })
    }

    const { data: admin, error } = await supabase
      .from('juancito_admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.json({ token, admin: { id: admin.id, email: admin.email, role: admin.role } })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Me endpoint
app.get('/api/admin/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: string }
    res.json({ admin: decoded })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

// Proxy para otras funciones (redirigir a netlify dev si está disponible)
app.all('/api/*', async (req, res) => {
  try {
    const path = req.path.replace('/api', '/.netlify/functions')
    const proxyRes = await fetch(`http://localhost:8888${path}`, {
      method: req.method,
      headers: req.headers as any,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const data = await proxyRes.text()
    res.status(proxyRes.status).send(data)
  } catch {
    res.status(503).json({ error: 'Netlify Functions no disponibles. Ejecuta: netlify dev' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desarrollo en http://localhost:${PORT}`)
  console.log(`📝 Funciones admin disponibles en http://localhost:${PORT}/api/admin/*`)
  console.log(`\n💡 Asegúrate de que Vite esté corriendo en otra terminal\n`)
})
