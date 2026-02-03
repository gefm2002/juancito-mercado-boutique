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
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

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

  try {
    const { path } = JSON.parse(event.body || '{}')

    if (!path) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Path requerido' }) }
    }

    // Eliminar archivo del storage
    const { error } = await supabase.storage
      .from('juancito_product_images')
      .remove([path])

    if (error) {
      throw error
    }

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
