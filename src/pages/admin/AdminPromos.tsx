import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../contexts/AdminContext'
import { Promo } from '../../types'

function AdminPromos() {

export default function AdminPromos() {
  const { token } = useAdmin()
  const [promos, setPromos] = useState<Promo[]>([])
  const [editing, setEditing] = useState<Promo | null>(null)

  useEffect(() => {
    if (token) loadPromos()
  }, [token])

  async function loadPromos() {
    try {
      const res = await fetch('/api/admin/promos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setPromos(data)
    } catch (error) {
      console.error('Error loading promos:', error)
    }
  }

  async function handleSave(promo: Partial<Promo>) {
    try {
      const url = '/api/admin/promos'
      const method = editing?.id ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editing?.id ? { id: editing.id, ...promo } : promo),
      })

      setEditing(null)
      loadPromos()
    } catch (error) {
      console.error('Error saving promo:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta promo?')) return

    try {
      await fetch('/api/admin/promos', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      loadPromos()
    } catch (error) {
      console.error('Error deleting promo:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-display">Promos</h1>
        <button
          onClick={() => setEditing({} as Promo)}
          className="btn-primary"
        >
          Nueva promo
        </button>
      </div>

      {editing && (
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editing.id ? 'Editar' : 'Nueva'} Promo
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleSave({
                title: formData.get('title') as string,
                description: formData.get('description') as string || null,
                image_url: formData.get('image_url') as string || null,
                link_url: formData.get('link_url') as string || null,
                is_active: formData.get('is_active') === 'on',
                sort_order: Number(formData.get('sort_order')),
              })
            }}
            className="space-y-4"
          >
            <div>
              <label className="label">Título *</label>
              <input
                type="text"
                name="title"
                defaultValue={editing.title || ''}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea
                name="description"
                defaultValue={editing.description || ''}
                className="input"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">URL Imagen</label>
                <input
                  type="text"
                  name="image_url"
                  defaultValue={editing.image_url || ''}
                  className="input"
                />
              </div>
              <div>
                <label className="label">URL Link</label>
                <input
                  type="text"
                  name="link_url"
                  defaultValue={editing.link_url || ''}
                  className="input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Orden</label>
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={editing.sort_order || 0}
                  className="input"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 mt-8">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editing.is_active !== false}
                  />
                  Activa
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                Guardar
              </button>
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2">Título</th>
              <th className="text-left p-2">Link</th>
              <th className="text-left p-2">Orden</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((promo) => (
              <tr key={promo.id} className="border-b border-border">
                <td className="p-2">{promo.title}</td>
                <td className="p-2">{promo.link_url || '-'}</td>
                <td className="p-2">{promo.sort_order}</td>
                <td className="p-2">
                  <button
                    onClick={() => setEditing(promo)}
                    className="btn-outline mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="btn-accent"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
