// Helper para obtener la ruta base de las API según el entorno
export function getApiBase(): string {
  // En desarrollo, usa el proxy de Vite (/api)
  // En producción, usa las Netlify Functions (/.netlify/functions)
  return import.meta.env.DEV ? '/api' : '/.netlify/functions'
}

// Helper para construir URLs de API
export function apiUrl(endpoint: string): string {
  // Remover el / inicial si existe para evitar doble slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${getApiBase()}/${cleanEndpoint}`
}
