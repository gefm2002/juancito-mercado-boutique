import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-display text-fg mb-4">Juancito</h3>
            <p className="text-muted text-sm">
              Tu mercado boutique en Caballito. Fiambres, quesos, carnes, vinos y deli.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-fg mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/catalogo" className="hover:text-wood transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/sucursales" className="hover:text-wood transition-colors">
                  Sucursales
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-wood transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-fg mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Av. La Plata 152, Caballito</li>
              <li>Av. Rivadavia 4546, Caballito</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-4 text-center">
          <p className="text-xs text-muted">
            Diseño y desarrollo por{' '}
            <a
              href="https://structura.com.ar/"
              target="_blank"
              rel="noopener"
              className="text-muted hover:text-wood underline transition-colors"
            >
              Structura
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
