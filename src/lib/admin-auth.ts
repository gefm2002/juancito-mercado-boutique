// Helper para autenticación admin
// Usa el servidor de desarrollo local o Netlify Functions
import { apiUrl } from './api-helper'

export async function adminLogin(email: string, password: string) {
  const res = await fetch(apiUrl('admin-login'), {
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
      throw new Error('No se puede conectar al servidor. Ejecuta: npm run dev:server (en otra terminal)')
    }
    throw new Error(errorData.error || `Error ${res.status}`)
  }

  return await res.json()
}
