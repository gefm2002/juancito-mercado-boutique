import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.NETLIFY_JWT_SECRET || 'change-me-in-production'

function verifyToken(token: string) {
  try {
    return jwt.verify(token, jwtSecret) as { id: string; email: string; role: string }
  } catch {
    return null
  }
}

export const handler: Handler = async (event, context) => {
  const authHeader = event.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) }
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Token inválido' }) }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  if (event.httpMethod === 'GET') {
    try {
      const { data } = await supabase
        .from('juancito_site_config')
        .select('*')
        .eq('key', 'sucursales')
        .single()

      const sucursales = data?.value || [
        { nombre: 'Caballito La Plata', direccion: 'Av. La Plata 152, Caballito, CABA' },
        { nombre: 'Caballito Rivadavia', direccion: 'Av. Rivadavia 4546, Caballito, CABA' },
      ]

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sucursales),
      }
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      }
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const body = JSON.parse(event.body || '{}')

      await supabase
        .from('juancito_site_config')
        .upsert({ key: 'sucursales', value: body }, { onConflict: 'key' })

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
      }
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      }
    }
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
}
