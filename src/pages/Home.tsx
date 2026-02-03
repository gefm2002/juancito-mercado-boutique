import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SiteConfig, Promo, Category, Product } from '../types'

export default function Home() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [promos, setPromos] = useState<Promo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [menuDelDia, setMenuDelDia] = useState<Product[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const apiBase = import.meta.env.DEV ? '/api' : '/.netlify/functions'
      const [configRes, promosRes, categoriesRes] = await Promise.all([
        fetch(`${apiBase}/public-config`).then((r) => r.json()),
        supabase.from('juancito_promos').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('juancito_categories').select('*').eq('is_active', true).order('sort_order').limit(6),
      ])

      if (configRes) setConfig(configRes)
      if (promosRes.data) setPromos(promosRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)

      // Cargar menú del día
      const menuCategory = categoriesRes.data?.find((c: Category) => c.slug === 'menu-del-dia')
      if (menuCategory) {
        const menuRes = await supabase
          .from('juancito_products')
          .select('*, category:juancito_categories(*)')
          .eq('category_id', menuCategory.id)
          .limit(5)
        if (menuRes.data) setMenuDelDia(menuRes.data as Product[])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[600px] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero.jpg)' }}>
        <div className="absolute inset-0 bg-primary/80"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-display text-fg mb-4">
            {config?.textos?.hero_headline || 'Tu mercado boutique en Caballito'}
          </h1>
          <p className="text-xl text-fg/90 mb-8">
            {config?.textos?.hero_subheadline || 'Fiambres, quesos, carnes, vinos y deli. Todo para el almuerzo, la picada o quedar como un campeón.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogo" className="btn-accent text-lg px-8 py-3">
              {config?.textos?.hero_cta_1 || 'Ver productos'}
            </Link>
            <a
              href={config?.whatsapp_phone ? `https://wa.me/${config.whatsapp_phone}` : config?.whatsapp_fallback_url || 'https://walink.co/d1b15d'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-lg px-8 py-3"
            >
              {config?.textos?.hero_cta_2 || 'Pedir por WhatsApp'}
            </a>
          </div>
        </div>
      </section>

      {/* Banners Promo */}
      {promos.length > 0 && (
        <section className="py-8 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promos.map((promo) => (
                <Link
                  key={promo.id}
                  to={promo.link_url || '#'}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">{promo.title}</h3>
                  {promo.description && <p className="text-muted">{promo.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorías Destacadas */}
      {categories.length > 0 && (
        <section className="py-16 bg-bg">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display text-center mb-8">Categorías</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/catalogo?categoria=${category.slug}`}
                  className="card text-center hover:shadow-lg transition-shadow"
                >
                  {category.image_url && (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menú del Día */}
      {menuDelDia.length > 0 && (
        <section className="py-16 bg-wood/10">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display text-center mb-8">Menú del Día</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {menuDelDia.map((product) => (
                <Link
                  key={product.id}
                  to={`/producto/${product.slug}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <p className="text-accent font-bold">${product.price?.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tablas y Picadas */}
      <section className="py-16 bg-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display text-center mb-8">Tablas y Picadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/catalogo?categoria=tablas-y-picadas" className="card hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Tabla Clásica</h3>
              <p className="text-muted mb-4">Para 2-4 personas</p>
              <p className="text-accent font-bold text-lg">Desde $46.000</p>
            </Link>
            <Link to="/catalogo?categoria=tablas-y-picadas" className="card hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Tabla Especial</h3>
              <p className="text-muted mb-4">Para 4-6 personas</p>
              <p className="text-accent font-bold text-lg">Desde $54.000</p>
            </Link>
            <Link to="/catalogo?categoria=tablas-y-picadas" className="card hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Tabla Grande</h3>
              <p className="text-muted mb-4">Para 8-12 personas</p>
              <p className="text-accent font-bold text-lg">Desde $96.000</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Sucursales */}
      {config && config.sucursales.length > 0 && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display text-center mb-8">Nuestras Sucursales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.sucursales.map((sucursal, idx) => (
                <div key={idx} className="card">
                  <h3 className="text-xl font-semibold mb-2">{sucursal.nombre}</h3>
                  <p className="text-muted mb-4">{sucursal.direccion}</p>
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(sucursal.direccion)}&hl=es&z=14&output=embed`}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded mb-4"
                  />
                  <Link to="/sucursales" className="btn-primary">
                    Cómo llegar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
