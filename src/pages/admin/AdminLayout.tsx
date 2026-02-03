import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import { useEffect } from 'react'

export default function AdminLayout() {
  const { isAuthenticated, logout } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex">
        <aside className="w-64 bg-primary min-h-screen p-4">
          <h2 className="text-2xl font-display mb-6">Admin</h2>
          <nav className="space-y-2">
            <Link to="/admin/dashboard" className="block text-fg hover:text-wood transition-colors">
              Dashboard
            </Link>
            <Link to="/admin/productos" className="block text-fg hover:text-wood transition-colors">
              Productos
            </Link>
            <Link to="/admin/categorias" className="block text-fg hover:text-wood transition-colors">
              Categorías
            </Link>
            <Link to="/admin/promos" className="block text-fg hover:text-wood transition-colors">
              Promos
            </Link>
            <Link to="/admin/sucursales" className="block text-fg hover:text-wood transition-colors">
              Sucursales
            </Link>
            <Link to="/admin/ordenes" className="block text-fg hover:text-wood transition-colors">
              Órdenes
            </Link>
            <Link to="/admin/contenido" className="block text-fg hover:text-wood transition-colors">
              Contenido
            </Link>
            <button
              onClick={() => {
                logout()
                navigate('/admin')
              }}
              className="block text-fg hover:text-wood transition-colors w-full text-left"
            >
              Salir
            </button>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
