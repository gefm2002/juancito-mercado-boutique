import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.NETLIFY_JWT_SECRET || 'change-me-in-production'

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { email, password } = JSON.parse(event.body || '{}')

    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email y contraseña requeridos' }) }
    }

    const { data: admin, error } = await supabase
      .from('juancito_admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Credenciales inválidas' }) }
    }

    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Credenciales inválidas' }) }
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      jwtSecret,
      { expiresIn: '7d' }
    )

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, admin: { id: admin.id, email: admin.email, role: admin.role } }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
