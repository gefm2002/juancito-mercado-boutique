import { Handler } from '@netlify/functions'
import jwt from 'jsonwebtoken'

const jwtSecret = process.env.NETLIFY_JWT_SECRET || 'change-me-in-production'

function verifyToken(token: string) {
  try {
    return jwt.verify(token, jwtSecret) as { id: string; email: string; role: string }
  } catch {
    return null
  }
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
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

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin: decoded }),
  }
}
