import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../contexts/AdminContext'
import { Category } from '../../types'
import { apiUrl } from '../../lib/api-helper'

export default function AdminCategorias() {
  const { token } = useAdmin()
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Category | null>(null)

  useEffect(() => {
    if (token) loadCategories()
  }, [token])

  async function loadCategories() {
    try {
      const res = await fetch(apiUrl('admin/categories'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  async function handleSave(category: Partial<Category>) {
    try {
      const url = apiUrl('admin/categories')
      const method = editing?.id ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editing?.id ? { id: editing.id, ...category } : category),
      })

      setEditing(null)
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      await fetch(apiUrl('admin/categories'), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-display">Categorías</h1>
        <button
          onClick={() => setEditing({} as Category)}
          className="btn-primary"
        >
          Nueva categoría
        </button>
      </div>

      {editing && (
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editing.id ? 'Editar' : 'Nueva'} Categoría
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleSave({
                name: formData.get('name') as string,
                slug: formData.get('slug') as string,
                sort_order: Number(formData.get('sort_order')),
                image_url: formData.get('image_url') as string || null,
                is_active: formData.get('is_active') === 'on',
              })
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editing.name || ''}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editing.slug || ''}
                  className="input"
                  required
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
                <label className="label">URL Imagen</label>
                <input
                  type="text"
                  name="image_url"
                  defaultValue={editing.image_url || ''}
                  className="input"
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={editing.is_active !== false}
              />
              Activa
            </label>
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
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Slug</th>
              <th className="text-left p-2">Orden</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-border">
                <td className="p-2">{category.name}</td>
                <td className="p-2">{category.slug}</td>
                <td className="p-2">{category.sort_order}</td>
                <td className="p-2">
                  <button
                    onClick={() => setEditing(category)}
                    className="btn-outline mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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
