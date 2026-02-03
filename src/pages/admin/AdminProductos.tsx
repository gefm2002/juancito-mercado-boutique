import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../contexts/AdminContext'
import { Product, Category } from '../../types'

export default function AdminProductos() {
  const { token } = useAdmin()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)

  useEffect(() => {
    if (token) {
      loadProducts()
      loadCategories()
    }
  }, [token])

  async function loadProducts() {
    try {
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProducts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading products:', error)
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  async function handleSave(product: Partial<Product>) {
    try {
      const url = editing?.id ? '/api/admin/products' : '/api/admin/products'
      const method = editing?.id ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editing?.id ? { id: editing.id, ...product } : product),
      })

      setEditing(null)
      loadProducts()
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  if (loading) {
    return <AdminLayout><div>Cargando...</div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-display">Productos</h1>
        <button
          onClick={() => setEditing({} as Product)}
          className="btn-primary"
        >
          Nuevo producto
        </button>
      </div>

      {editing && (
        <ProductForm
          product={editing}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Categoría</th>
              <th className="text-left p-2">Tipo</th>
              <th className="text-left p-2">Precio</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border">
                <td className="p-2">{product.name}</td>
                <td className="p-2">{categories.find((c) => c.id === product.category_id)?.name || '-'}</td>
                <td className="p-2">{product.product_type}</td>
                <td className="p-2">
                  {product.product_type === 'weighted'
                    ? `$${product.price_per_kg?.toLocaleString()}/kg`
                    : `$${product.price?.toLocaleString()}`}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => setEditing(product)}
                    className="btn-outline mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
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

function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
}: {
  product: Partial<Product>
  categories: Category[]
  onSave: (product: Partial<Product>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    category_id: product.category_id || '',
    product_type: product.product_type || 'standard',
    price: product.price || null,
    price_per_kg: product.price_per_kg || null,
    min_weight_g: product.min_weight_g || 100,
    step_weight_g: product.step_weight_g || 100,
    out_of_stock: product.out_of_stock || false,
    is_featured: product.is_featured || false,
    images: product.images || [],
    combo_items: product.combo_items || null,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="card mb-8">
      <h2 className="text-2xl font-semibold mb-4">
        {product.id ? 'Editar' : 'Nuevo'} Producto
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="input"
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Categoría</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="input"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tipo</label>
            <select
              value={formData.product_type}
              onChange={(e) => setFormData({ ...formData, product_type: e.target.value as any })}
              className="input"
            >
              <option value="standard">Standard</option>
              <option value="weighted">Weighted</option>
              <option value="combo">Combo</option>
            </select>
          </div>
        </div>
        {formData.product_type === 'weighted' ? (
          <div>
            <label className="label">Precio por kg *</label>
            <input
              type="number"
              value={formData.price_per_kg || ''}
              onChange={(e) => setFormData({ ...formData, price_per_kg: Number(e.target.value) })}
              className="input"
              required
            />
          </div>
        ) : (
          <div>
            <label className="label">Precio *</label>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="input"
              required
            />
          </div>
        )}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.out_of_stock}
              onChange={(e) => setFormData({ ...formData, out_of_stock: e.target.checked })}
            />
            Sin stock
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            />
            Destacado
          </label>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">
            Guardar
          </button>
          <button type="button" onClick={onCancel} className="btn-outline">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
