// Helper para llamar a las API functions
// En desarrollo, usa el proxy de Vite
// En producción, usa las Netlify Functions directamente

const API_BASE = import.meta.env.DEV 
  ? '/api'  // En desarrollo, Vite proxy redirige a netlify dev
  : '/.netlify/functions'  // En producción, Netlify Functions

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Si la respuesta está vacía, lanzar error
    const text = await res.text()
    if (!text) {
      throw new Error('Respuesta vacía del servidor')
    }

    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`Respuesta no es JSON válido: ${text.substring(0, 100)}`)
    }

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`)
    }

    return data
  } catch (error: any) {
    // Si es error de conexión, sugerir usar netlify dev
    if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
      throw new Error('No se puede conectar a las funciones. Ejecuta: npm run dev:full')
    }
    throw error
  }
}
