import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../contexts/AdminContext'
import { apiUrl } from '../../lib/api-helper'

export default function AdminContenido() {
  const { token } = useAdmin()
  const [config, setConfig] = useState<any>({})

  useEffect(() => {
    if (token) loadConfig()
  }, [token])

  async function loadConfig() {
    try {
      const res = await fetch(apiUrl('admin-content'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setConfig(data)
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  async function handleSave() {
    try {
      await fetch(apiUrl('admin-content'), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      alert('Configuración guardada')
    } catch (error) {
      console.error('Error saving config:', error)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-4xl font-display mb-8">Contenido</h1>
      <div className="card space-y-6">
        <div>
          <label className="label">Nombre comercial</label>
          <input
            type="text"
            value={config.nombre_comercial || ''}
            onChange={(e) => setConfig({ ...config, nombre_comercial: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Teléfono WhatsApp</label>
          <input
            type="text"
            value={config.whatsapp_phone || ''}
            onChange={(e) => setConfig({ ...config, whatsapp_phone: e.target.value })}
            className="input"
            placeholder="54911..."
          />
        </div>
        <div>
          <label className="label">URL Fallback WhatsApp</label>
          <input
            type="text"
            value={config.whatsapp_fallback_url || ''}
            onChange={(e) => setConfig({ ...config, whatsapp_fallback_url: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Hero Headline</label>
          <input
            type="text"
            value={config.textos?.hero_headline || ''}
            onChange={(e) => setConfig({
              ...config,
              textos: { ...config.textos, hero_headline: e.target.value },
            })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Hero Subheadline</label>
          <textarea
            value={config.textos?.hero_subheadline || ''}
            onChange={(e) => setConfig({
              ...config,
              textos: { ...config.textos, hero_subheadline: e.target.value },
            })}
            className="input"
            rows={3}
          />
        </div>
        <button onClick={handleSave} className="btn-primary">
          Guardar
        </button>
      </div>
    </AdminLayout>
  )
}
