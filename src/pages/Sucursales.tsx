import { useEffect, useState } from 'react'
import { SiteConfig } from '../types'
import { apiUrl } from '../lib/api-helper'

export default function Sucursales() {
  const [config, setConfig] = useState<SiteConfig | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const res = await fetch(apiUrl('public/config'))
      const data = await res.json()
      setConfig(data)
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display mb-8">Nuestras Sucursales</h1>
      {config && config.sucursales.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {config.sucursales.map((sucursal, idx) => (
            <div key={idx} className="card">
              <h2 className="text-2xl font-semibold mb-4">{sucursal.nombre}</h2>
              <p className="text-muted mb-4">{sucursal.direccion}</p>
              {sucursal.horarios && (
                <p className="text-muted mb-4">{sucursal.horarios}</p>
              )}
              {sucursal.telefono && (
                <p className="text-muted mb-4">Tel: {sucursal.telefono}</p>
              )}
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6Y4uo4qJ2A&q=${encodeURIComponent(sucursal.direccion)}`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="rounded"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted">Cargando sucursales...</div>
      )}
    </div>
  )
}
