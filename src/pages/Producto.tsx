import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'
import { Product } from '../types'

export default function Producto() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [weightG, setWeightG] = useState(500)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (slug) loadProduct()
  }, [slug])

  async function loadProduct() {
    if (!slug) return
    const { data } = await supabase
      .from('juancito_products')
      .select('*, category:juancito_categories(*)')
      .eq('slug', slug)
      .single()

    if (data) {
      setProduct(data as Product)
      if (data.product_type === 'weighted' && data.min_weight_g) {
        setWeightG(data.min_weight_g)
      }
    }
    setLoading(false)
  }

  function handleAddToCart() {
    if (!product) return
    if (product.out_of_stock) return

    if (product.product_type === 'weighted') {
      addItem(product, quantity, weightG)
    } else {
      addItem(product, quantity)
    }
    navigate('/carrito')
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8 text-center">Producto no encontrado</div>
  }

  const images = product.images || []
  const price = product.product_type === 'weighted' && weightG && product.price_per_kg
    ? Math.round((product.price_per_kg * weightG) / 1000)
    : product.price || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería */}
        <div>
          {images.length > 0 && (
            <>
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-full h-20 object-cover rounded ${
                        selectedImage === idx ? 'ring-2 ring-accent' : ''
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover rounded" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-4xl font-display mb-4">{product.name}</h1>
          {product.description && (
            <p className="text-muted mb-6">{product.description}</p>
          )}

          {product.product_type === 'weighted' ? (
            <div className="mb-6">
              <label className="label">Cantidad (gramos)</label>
              <select
                value={weightG}
                onChange={(e) => setWeightG(Number(e.target.value))}
                className="input mb-2"
              >
                <option value={100}>100g</option>
                <option value={200}>200g</option>
                <option value={300}>300g</option>
                <option value={500}>500g</option>
                <option value={1000}>1kg</option>
              </select>
              <p className="text-sm text-muted mb-2">
                Precio por kg: ${product.price_per_kg?.toLocaleString()}
              </p>
              <p className="text-lg font-semibold">
                Precio estimado: ${price.toLocaleString()}
              </p>
            </div>
          ) : product.product_type === 'combo' ? (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Incluye:</h3>
              <ul className="list-disc list-inside text-muted">
                {product.combo_items?.map((item, idx) => (
                  <li key={idx}>
                    {item.name || `Producto ${idx + 1}`} - {item.quantity}x
                    {item.weight_g && ` (${item.weight_g}g)`}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-3xl font-bold text-accent mb-6">
              ${product.price?.toLocaleString()}
            </p>
          )}

          {product.product_type !== 'weighted' && (
            <div className="mb-6">
              <label className="label">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input"
              />
            </div>
          )}

          {product.out_of_stock ? (
            <div className="bg-muted/20 text-muted p-4 rounded text-center">
              Sin stock
            </div>
          ) : (
            <button onClick={handleAddToCart} className="btn-accent w-full text-lg py-3">
              Agregar al carrito
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
