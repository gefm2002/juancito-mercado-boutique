import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { SiteConfig } from '../types'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    payment_method: '',
    fulfillment_type: 'retiro' as 'retiro' | 'envio',
    sucursal: '',
    direccion: '',
    zona: '',
    notes: '',
  })

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const res = await fetch('/api/public/config')
      const data = await res.json()
      setConfig(data)
      if (data.sucursales.length > 0) {
        setFormData((prev) => ({ ...prev, sucursal: data.sucursales[0].nombre }))
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
          },
          fulfillment: {
            type: formData.fulfillment_type,
            sucursal: formData.fulfillment_type === 'retiro' ? formData.sucursal : undefined,
            direccion: formData.fulfillment_type === 'envio' ? formData.direccion : undefined,
            zona: formData.fulfillment_type === 'envio' ? formData.zona : undefined,
          },
          payment_method: formData.payment_method,
          notes_customer: formData.notes,
        }),
      })

      const data = await res.json()

      if (data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank')
      } else if (data.message) {
        navigator.clipboard.writeText(data.message)
        alert('Mensaje copiado al portapapeles')
        window.open(config?.whatsapp_fallback_url || 'https://walink.co/d1b15d', '_blank')
      }

      clearCart()
      navigate('/')
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error al crear el pedido. Por favor intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display mb-8">Checkout</h1>
        <div className="text-center py-12">
          <p className="text-muted mb-4">Tu carrito está vacío</p>
          <button onClick={() => navigate('/catalogo')} className="btn-primary">
            Ver catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Datos de contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Apellido *</label>
                <input
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Retiro o envío</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.fulfillment_type === 'retiro'}
                  onChange={() => setFormData({ ...formData, fulfillment_type: 'retiro' })}
                />
                Retiro en sucursal
              </label>
              {formData.fulfillment_type === 'retiro' && config && (
                <select
                  value={formData.sucursal}
                  onChange={(e) => setFormData({ ...formData, sucursal: e.target.value })}
                  className="input"
                  required
                >
                  {config.sucursales.map((suc, idx) => (
                    <option key={idx} value={suc.nombre}>
                      {suc.nombre} - {suc.direccion}
                    </option>
                  ))}
                </select>
              )}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.fulfillment_type === 'envio'}
                  onChange={() => setFormData({ ...formData, fulfillment_type: 'envio' })}
                />
                Envío a domicilio
              </label>
              {formData.fulfillment_type === 'envio' && (
                <>
                  <input
                    type="text"
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Barrio / Zona"
                    value={formData.zona}
                    onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                    className="input"
                    required
                  />
                </>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Forma de pago *</h2>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="input"
              required
            >
              <option value="">Seleccionar</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="mercado_pago">Mercado Pago</option>
            </select>
          </div>

          <div className="card">
            <label className="label">Notas (opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent w-full text-lg py-3"
          >
            {loading ? 'Procesando...' : 'Finalizar pedido'}
          </button>
        </form>

        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-2xl font-semibold mb-4">Resumen</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.weight_g || ''}`} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} {item.weight_g && `(${item.weight_g}g)`} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
