import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../contexts/AdminContext'
import { Order } from '../../types'

export default function AdminOrdenes() {
  const { token } = useAdmin()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (token) loadOrders()
  }, [token])

  async function loadOrders() {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  async function handleStatusChange(orderId: string, status: string) {
    try {
      await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status }),
      })

      loadOrders()
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  function openWhatsApp(message: string) {
    const configRes = fetch('/api/public/config').then((r) => r.json())
    configRes.then((config) => {
      if (config.whatsapp_phone) {
        window.open(`https://wa.me/${config.whatsapp_phone}?text=${encodeURIComponent(message)}`, '_blank')
      } else {
        navigator.clipboard.writeText(message)
        alert('Mensaje copiado al portapapeles')
        window.open(config.whatsapp_fallback_url || 'https://walink.co/d1b15d', '_blank')
      }
    })
  }

  return (
    <AdminLayout>
      <h1 className="text-4xl font-display mb-8">Órdenes</h1>
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Cliente</th>
              <th className="text-left p-2">Total</th>
              <th className="text-left p-2">Estado</th>
              <th className="text-left p-2">Fecha</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border">
                <td className="p-2">#{order.order_number}</td>
                <td className="p-2">
                  {order.customer.nombre} {order.customer.apellido}
                </td>
                <td className="p-2">${order.totals.total.toLocaleString()}</td>
                <td className="p-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="input"
                  >
                    <option value="new">Nuevo</option>
                    <option value="contacted">Contactado</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="preparing">Preparando</option>
                    <option value="shipped">Enviado</option>
                    <option value="completed">Completado</option>
                    <option value="canceled">Cancelado</option>
                  </select>
                </td>
                <td className="p-2">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {order.whatsapp_message && (
                    <button
                      onClick={() => openWhatsApp(order.whatsapp_message!)}
                      className="btn-outline"
                    >
                      WhatsApp
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
