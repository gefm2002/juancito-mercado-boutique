import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function Header() {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-display text-fg hover:text-wood transition-colors">
            Juancito
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-fg hover:text-wood transition-colors">
              Inicio
            </Link>
            <Link to="/catalogo" className="text-fg hover:text-wood transition-colors">
              Catálogo
            </Link>
            <Link to="/sucursales" className="text-fg hover:text-wood transition-colors">
              Sucursales
            </Link>
            <Link to="/faq" className="text-fg hover:text-wood transition-colors">
              FAQ
            </Link>
          </nav>
          <Link
            to="/carrito"
            className="relative btn-primary flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-contrast rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
