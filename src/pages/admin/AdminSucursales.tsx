import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../contexts/AdminContext'
import { Sucursal } from '../../types'
import { apiUrl } from '../../lib/api-helper'

export default function AdminSucursales() {
  const { token } = useAdmin()
  const [sucursales, setSucursales] = useState<Sucursal[]>([])

  useEffect(() => {
    if (token) loadSucursales()
  }, [token])

  async function loadSucursales() {
    try {
      const res = await fetch(apiUrl('admin/sucursales'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setSucursales(data)
    } catch (error) {
      console.error('Error loading sucursales:', error)
    }
  }

  async function handleSave(sucursales: Sucursal[]) {
    try {
      await fetch(apiUrl('admin/sucursales'), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sucursales),
      })

      loadSucursales()
    } catch (error) {
      console.error('Error saving sucursales:', error)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-4xl font-display mb-8">Sucursales</h1>
      <div className="card">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const newSucursales: Sucursal[] = []
            for (let i = 0; i < sucursales.length; i++) {
              newSucursales.push({
                nombre: formData.get(`nombre_${i}`) as string,
                direccion: formData.get(`direccion_${i}`) as string,
                horarios: formData.get(`horarios_${i}`) as string || '',
                telefono: formData.get(`telefono_${i}`) as string || undefined,
              })
            }
            handleSave(newSucursales)
          }}
          className="space-y-6"
        >
          {sucursales.map((sucursal, idx) => (
            <div key={idx} className="border-b border-border pb-6">
              <h3 className="text-xl font-semibold mb-4">Sucursal {idx + 1}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre</label>
                  <input
                    type="text"
                    name={`nombre_${idx}`}
                    defaultValue={sucursal.nombre}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Dirección</label>
                  <input
                    type="text"
                    name={`direccion_${idx}`}
                    defaultValue={sucursal.direccion}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Horarios</label>
                  <input
                    type="text"
                    name={`horarios_${idx}`}
                    defaultValue={sucursal.horarios}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input
                    type="text"
                    name={`telefono_${idx}`}
                    defaultValue={sucursal.telefono || ''}
                    className="input"
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="submit" className="btn-primary">
            Guardar
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
