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
      const { data, error } = await supabase
        .from('juancito_products')
        .select('*, category:juancito_categories(*)')
        .order('name')

      if (error) throw error

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      }
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}')
      const { data, error } = await supabase
        .from('juancito_products')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
      const { id, ...updateData } = body

      if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: 'ID requerido' }) }
      }

      const { data, error } = await supabase
        .from('juancito_products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      }
    }
  }

  if (event.httpMethod === 'DELETE') {
    try {
      const { id } = JSON.parse(event.body || '{}')

      if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: 'ID requerido' }) }
      }

      const { error } = await supabase.from('juancito_products').delete().eq('id', id)

      if (error) throw error

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
