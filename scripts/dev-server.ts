import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config({ path: '.env.local' })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.NETLIFY_JWT_SECRET || 'change-me-in-production'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' })
    }

    const { data: admin, error } = await supabase
      .from('juancito_admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.json({ token, admin: { id: admin.id, email: admin.email, role: admin.role } })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Helper para verificar token
function verifyToken(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, jwtSecret) as { id: string; email: string; role: string }
  } catch {
    return null
  }
}

// Me endpoint
app.get('/api/admin/me', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  res.json({ admin: decoded })
})

// Products endpoint
app.get('/api/admin/products', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data, error } = await supabase
      .from('juancito_products')
      .select('*, category:juancito_categories(*)')
      .order('name')

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admin/products', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data, error } = await supabase
      .from('juancito_products')
      .insert(req.body)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/admin/products', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { id, ...updateData } = req.body
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' })
    }

    const { data, error } = await supabase
      .from('juancito_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/admin/products', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' })
    }

    const { error } = await supabase.from('juancito_products').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Categories endpoint
app.get('/api/admin/categories', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data, error } = await supabase
      .from('juancito_categories')
      .select('*')
      .order('sort_order')

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admin/categories', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data, error } = await supabase
      .from('juancito_categories')
      .insert(req.body)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/admin/categories', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { id, ...updateData } = req.body
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' })
    }

    const { data, error } = await supabase
      .from('juancito_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/admin/categories', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' })
    }

    const { error } = await supabase.from('juancito_categories').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Orders endpoint
app.get('/api/admin/orders', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data, error } = await supabase
      .from('juancito_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/admin/orders', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { id, status, notes_internal } = req.body
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes_internal !== undefined) updateData.notes_internal = notes_internal

    const { data: order } = await supabase
      .from('juancito_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (order && status && status !== order.status) {
      // Regenerar mensaje WhatsApp
      const customer = order.customer
      const items = order.items
      const totals = order.totals
      const fulfillment = order.fulfillment

      let message = `Hola! Quiero hacer un pedido. Te paso el detalle 👇\n\n`
      message += `*Pedido #${order.order_number}*\n\n`
      message += `*Cliente:*\n`
      message += `${customer.nombre} ${customer.apellido}\n`
      message += `Email: ${customer.email}\n`
      message += `Tel: ${customer.telefono}\n\n`
      message += `*Productos:*\n`
      items.forEach((item: any) => {
        message += `- ${item.product.name}`
        if (item.weight_g) message += ` (${item.weight_g}g)`
        message += ` x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}\n`
      })
      message += `\n*Total: $${totals.total.toLocaleString()}*\n\n`
      message += `*Entrega:*\n`
      if (fulfillment.type === 'retiro') {
        message += `Retiro en: ${fulfillment.sucursal}\n`
      } else {
        message += `Envío a: ${fulfillment.direccion}, ${fulfillment.zona}\n`
      }
      message += `\n*Pago:* ${order.payment_method}\n`
      if (order.notes_customer) {
        message += `\n*Notas:* ${order.notes_customer}\n`
      }
      if (notes_internal) {
        message += `\n*Notas internas:* ${notes_internal}\n`
      }

      updateData.whatsapp_message = message
    }

    const { data, error } = await supabase
      .from('juancito_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Public config endpoint
app.get('/api/public/config', async (req, res) => {
  try {
    const [configRes, promosRes, sucursalesRes] = await Promise.all([
      supabase.from('juancito_site_config').select('*'),
      supabase.from('juancito_promos').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('juancito_site_config').select('*').eq('key', 'sucursales').single(),
    ])

    const config: Record<string, any> = {}
    if (configRes.data) {
      configRes.data.forEach((item) => {
        config[item.key] = item.value
      })
    }

    const sucursales = sucursalesRes.data?.value || config.sucursales || [
      { nombre: 'Caballito La Plata', direccion: 'Av. La Plata 152, Caballito, CABA' },
      { nombre: 'Caballito Rivadavia', direccion: 'Av. Rivadavia 4546, Caballito, CABA' },
    ]

    const faqs = config.faqs || [
      { question: '¿Hacen envíos?', answer: 'Sí, hacemos envíos en CABA. Consultá las zonas disponibles en el checkout.' },
      { question: '¿Puedo pedir para retirar?', answer: 'Sí, podés retirar en cualquiera de nuestras dos sucursales.' },
      { question: '¿Cómo funcionan los productos por peso?', answer: 'Los productos por peso se calculan según la cantidad que elijas. El precio se muestra por kg y se calcula automáticamente.' },
      { question: '¿Con cuánto tiempo pido una tabla?', answer: 'Te recomendamos pedir con 24 horas de anticipación para tablas grandes.' },
      { question: '¿Medios de pago?', answer: 'Aceptamos efectivo, transferencia, tarjetas y Mercado Pago.' },
    ]

    res.json({
      nombre_comercial: config.nombre_comercial || 'Juancito Mercado Boutique',
      sucursales,
      horarios: config.horarios || {},
      metodos_pago: config.metodos_pago || ['efectivo', 'transferencia', 'tarjeta', 'mercado_pago'],
      envio_retiro: config.envio_retiro || {
        retiro_en_sucursal: true,
        envio_caba: true,
        zonas_envio: ['Caballito', 'Flores', 'Almagro', 'Villa Crespo'],
      },
      whatsapp_phone: config.whatsapp_phone || null,
      whatsapp_fallback_url: config.whatsapp_fallback_url || 'https://walink.co/d1b15d',
      textos: config.textos || {
        hero_headline: 'Tu mercado boutique en Caballito',
        hero_subheadline: 'Fiambres, quesos, carnes, vinos y deli. Todo para el almuerzo, la picada o quedar como un campeón.',
        hero_cta_1: 'Ver productos',
        hero_cta_2: 'Pedir por WhatsApp',
      },
      promos: promosRes.data || [],
      faqs,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Public catalog endpoint
app.get('/api/public/catalog', async (req, res) => {
  try {
    const supabaseAnon = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!)
    const { data: products, error } = await supabaseAnon
      .from('juancito_products')
      .select('*, category:juancito_categories(*)')
      .eq('out_of_stock', false)
      .order('is_featured', { ascending: false })
      .order('name')

    if (error) throw error
    res.json(products)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Orders create endpoint
app.post('/api/orders/create', async (req, res) => {
  try {
    const body = req.body
    const { items, customer, fulfillment, payment_method, notes_customer } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items requeridos' })
    }

    if (!customer || !customer.nombre || !customer.apellido || !customer.email || !customer.telefono) {
      return res.status(400).json({ error: 'Datos de cliente incompletos' })
    }

    if (!fulfillment || !fulfillment.type) {
      return res.status(400).json({ error: 'Tipo de entrega requerido' })
    }

    if (!payment_method) {
      return res.status(400).json({ error: 'Método de pago requerido' })
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const discounts = 0
    const total = subtotal - discounts

    const { data: order, error: orderError } = await supabase
      .from('juancito_orders')
      .insert({
        status: 'new',
        customer,
        fulfillment,
        payment_method,
        notes_customer,
        items,
        totals: { subtotal, discounts, total },
      })
      .select()
      .single()

    if (orderError) throw orderError

    const configRes = await supabase.from('juancito_site_config').select('*').eq('key', 'whatsapp_phone').single()
    const whatsappPhone = configRes.data?.value || null
    const fallbackUrl = (await supabase.from('juancito_site_config').select('*').eq('key', 'whatsapp_fallback_url').single()).data?.value || 'https://walink.co/d1b15d'

    let message = `Hola! Quiero hacer un pedido. Te paso el detalle 👇\n\n`
    message += `*Pedido #${order.order_number}*\n\n`
    message += `*Cliente:*\n`
    message += `${customer.nombre} ${customer.apellido}\n`
    message += `Email: ${customer.email}\n`
    message += `Tel: ${customer.telefono}\n\n`
    message += `*Productos:*\n`
    items.forEach((item: any) => {
      message += `- ${item.product.name}`
      if (item.weight_g) message += ` (${item.weight_g}g)`
      message += ` x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}\n`
    })
    message += `\n*Total: $${total.toLocaleString()}*\n\n`
    message += `*Entrega:*\n`
    if (fulfillment.type === 'retiro') {
      message += `Retiro en: ${fulfillment.sucursal}\n`
    } else {
      message += `Envío a: ${fulfillment.direccion}, ${fulfillment.zona}\n`
    }
    message += `\n*Pago:* ${payment_method}\n`
    if (notes_customer) {
      message += `\n*Notas:* ${notes_customer}\n`
    }

    await supabase
      .from('juancito_orders')
      .update({ whatsapp_message: message })
      .eq('id', order.id)

    const whatsappUrl = whatsappPhone
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
      : null

    res.json({
      order_number: order.order_number,
      whatsapp_url: whatsappUrl,
      message,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Promos endpoint
app.get('/api/admin/promos', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data, error } = await supabase
      .from('juancito_promos')
      .select('*')
      .order('sort_order')

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admin/promos', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data, error } = await supabase
      .from('juancito_promos')
      .insert(req.body)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/admin/promos', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { id, ...updateData } = req.body
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' })
    }

    const { data, error } = await supabase
      .from('juancito_promos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/admin/promos', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' })
    }

    const { error } = await supabase.from('juancito_promos').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Sucursales endpoint
app.get('/api/admin/sucursales', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data } = await supabase
      .from('juancito_site_config')
      .select('*')
      .eq('key', 'sucursales')
      .single()

    const sucursales = data?.value || [
      { nombre: 'Caballito La Plata', direccion: 'Av. La Plata 152, Caballito, CABA' },
      { nombre: 'Caballito Rivadavia', direccion: 'Av. Rivadavia 4546, Caballito, CABA' },
    ]

    res.json(sucursales)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/admin/sucursales', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    await supabase
      .from('juancito_site_config')
      .upsert({ key: 'sucursales', value: req.body }, { onConflict: 'key })

    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Content endpoint
app.get('/api/admin/content', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data, error } = await supabase
      .from('juancito_site_config')
      .select('*')

    if (error) throw error

    const config: Record<string, any> = {}
    if (data) {
      data.forEach((item) => {
        config[item.key] = item.value
      })
    }

    res.json(config)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/admin/content', async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    for (const [key, value] of Object.entries(req.body)) {
      await supabase
        .from('juancito_site_config')
        .upsert({ key, value }, { onConflict: 'key' })
    }

    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desarrollo en http://localhost:${PORT}`)
  console.log(`📝 Funciones admin disponibles en http://localhost:${PORT}/api/admin/*`)
  console.log(`\n💡 Asegúrate de que Vite esté corriendo en otra terminal\n`)
})
