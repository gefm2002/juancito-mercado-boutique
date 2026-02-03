import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../contexts/AdminContext'

export default function AdminDashboard() {
  const { token } = useAdmin()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalCategories: 0,
  })

  useEffect(() => {
    if (token) loadStats()
  }, [token])

  async function loadStats() {
    try {
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const products = await productsRes.json()
      const orders = await ordersRes.json()
      const categories = await categoriesRes.json()

      setStats({
        totalProducts: products.length || 0,
        totalOrders: orders.length || 0,
        pendingOrders: orders.filter((o: any) => ['new', 'contacted', 'confirmed'].includes(o.status)).length || 0,
        totalCategories: categories.length || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-4xl font-display mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Productos</h3>
          <p className="text-3xl font-bold text-accent">{stats.totalProducts}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Categorías</h3>
          <p className="text-3xl font-bold text-accent">{stats.totalCategories}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Órdenes</h3>
          <p className="text-3xl font-bold text-accent">{stats.totalOrders}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Pendientes</h3>
          <p className="text-3xl font-bold text-accent">{stats.pendingOrders}</p>
        </div>
      </div>
    </AdminLayout>
  )
}
