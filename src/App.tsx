import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Producto from './pages/Producto'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import Sucursales from './pages/Sucursales'
import FAQ from './pages/FAQ'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductos from './pages/admin/AdminProductos'
import AdminCategorias from './pages/admin/AdminCategorias'
import AdminPromos from './pages/admin/AdminPromos'
import AdminSucursales from './pages/admin/AdminSucursales'
import AdminOrdenes from './pages/admin/AdminOrdenes'
import AdminContenido from './pages/admin/AdminContenido'
import { CartProvider } from './contexts/CartContext'
import { AdminProvider } from './contexts/AdminContext'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AdminProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="catalogo" element={<Catalogo />} />
              <Route path="producto/:slug" element={<Producto />} />
              <Route path="carrito" element={<Carrito />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="sucursales" element={<Sucursales />} />
              <Route path="faq" element={<FAQ />} />
            </Route>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/productos" element={<AdminProductos />} />
            <Route path="/admin/categorias" element={<AdminCategorias />} />
            <Route path="/admin/promos" element={<AdminPromos />} />
            <Route path="/admin/sucursales" element={<AdminSucursales />} />
            <Route path="/admin/ordenes" element={<AdminOrdenes />} />
            <Route path="/admin/contenido" element={<AdminContenido />} />
          </Routes>
        </AdminProvider>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
