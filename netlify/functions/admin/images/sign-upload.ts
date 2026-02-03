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
  if (event.httpMethod !== 'POST') {
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
    const { filename, contentType } = JSON.parse(event.body || '{}')

    if (!filename) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Filename requerido' }) }
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (contentType && !allowedTypes.includes(contentType)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Tipo de archivo no permitido' }) }
    }

    // Generar path único
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = filename.split('.').pop() || 'jpg'
    const path = `${timestamp}-${random}.${extension}`

    // Generar signed URL para upload
    const { data, error } = await supabase.storage
      .from('juancito_product_images')
      .createSignedUploadUrl(path, {
        upsert: false
      })

    if (error) {
      throw error
    }

    // También generar la URL pública para después
    const { data: publicUrl } = supabase.storage
      .from('juancito_product_images')
      .getPublicUrl(path)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signedUrl: data.signedUrl,
        token: data.token,
        path,
        publicUrl: publicUrl.publicUrl,
      }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
