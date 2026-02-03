export type ProductType = 'standard' | 'weighted' | 'combo' | 'apparel' | 'service'

export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  product_type: ProductType
  price: number | null
  price_per_kg: number | null
  min_weight_g: number
  step_weight_g: number
  out_of_stock: boolean
  is_featured: boolean
  images: string[]
  combo_items: ComboItem[] | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface ComboItem {
  product_id: string
  quantity: number
  weight_g?: number
  name?: string
}

export interface CartItem {
  product_id: string
  product: Product
  quantity: number
  weight_g?: number
  price: number
}

export type OrderStatus = 'new' | 'contacted' | 'confirmed' | 'preparing' | 'shipped' | 'completed' | 'canceled'

export interface Order {
  id: string
  order_number: number
  status: OrderStatus
  customer: {
    nombre: string
    apellido: string
    email: string
    telefono: string
  }
  fulfillment: {
    type: 'retiro' | 'envio'
    sucursal?: string
    direccion?: string
    zona?: string
  }
  payment_method: string
  notes_customer: string | null
  notes_internal: string | null
  items: CartItem[]
  totals: {
    subtotal: number
    discounts: number
    total: number
  }
  whatsapp_message: string | null
  created_at: string
  updated_at: string
}

export interface SiteConfig {
  nombre_comercial: string
  sucursales: Sucursal[]
  horarios: Record<string, string>
  metodos_pago: string[]
  envio_retiro: {
    retiro_en_sucursal: boolean
    envio_caba: boolean
    zonas_envio: string[]
  }
  whatsapp_phone: string | null
  whatsapp_fallback_url: string
  textos: {
    hero_headline: string
    hero_subheadline: string
    hero_cta_1: string
    hero_cta_2: string
  }
}

export interface Sucursal {
  nombre: string
  direccion: string
  horarios: string
  telefono?: string
}

export interface Promo {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  sort_order: number
}
