import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function Carrito() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display mb-8">Carrito</h1>
        <div className="text-center py-12">
          <p className="text-muted mb-4">Tu carrito está vacío</p>
          <Link to="/catalogo" className="btn-primary">
            Ver catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display mb-8">Carrito</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.product_id}-${item.weight_g || ''}`} className="card flex items-center gap-4">
              {item.product.images?.[0] && (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                {item.weight_g && (
                  <p className="text-sm text-muted">{item.weight_g}g</p>
                )}
                <p className="text-accent font-bold">
                  ${item.price.toLocaleString()} {item.quantity > 1 && `x ${item.quantity}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product_id, Number(e.target.value), item.weight_g)}
                  className="w-16 input text-center"
                />
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-accent hover:text-accent/80"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-2xl font-semibold mb-4">Resumen</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Link to="/checkout" className="btn-accent w-full text-center block py-3">
              Finalizar pedido
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
