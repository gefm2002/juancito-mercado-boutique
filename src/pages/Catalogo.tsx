import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Product, Category } from '../types'

export default function Catalogo() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '')
  const [productType, setProductType] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('destacado')

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, productType, sortBy, search])

  async function loadCategories() {
    const { data } = await supabase
      .from('juancito_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (data) setCategories(data)
  }

  async function loadProducts() {
    setLoading(true)
    let query = supabase
      .from('juancito_products')
      .select('*, category:juancito_categories(*)')
      .eq('out_of_stock', false)

    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory)
      if (cat) {
        query = query.eq('category_id', cat.id)
      }
    }

    if (productType) {
      query = query.eq('product_type', productType)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (sortBy === 'destacado') {
      query = query.order('is_featured', { ascending: false }).order('name')
    } else if (sortBy === 'precio-asc') {
      query = query.order('price', { ascending: true })
    } else if (sortBy === 'precio-desc') {
      query = query.order('price', { ascending: false })
    } else {
      query = query.order('name')
    }

    const { data } = await query
    if (data) setProducts(data as Product[])
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display mb-8">Catálogo</h1>

      {/* Filtros */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="input"
          >
            <option value="">Todos los tipos</option>
            <option value="standard">Unitario</option>
            <option value="weighted">Por peso</option>
            <option value="combo">Combo</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            <option value="destacado">Destacados</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="nombre">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* Productos */}
      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted">No se encontraron productos</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/producto/${product.slug}`}
              className="card hover:shadow-lg transition-shadow"
            >
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h3 className="font-semibold mb-2">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-muted mb-2 line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center justify-between">
                {product.product_type === 'weighted' ? (
                  <span className="text-accent font-bold">
                    ${product.price_per_kg?.toLocaleString()}/kg
                  </span>
                ) : (
                  <span className="text-accent font-bold">
                    ${product.price?.toLocaleString()}
                  </span>
                )}
                {product.is_featured && (
                  <span className="text-xs bg-wood text-primary px-2 py-1 rounded">
                    Destacado
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
