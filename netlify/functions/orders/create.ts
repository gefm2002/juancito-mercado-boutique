import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const body = JSON.parse(event.body || '{}')
    const { items, customer, fulfillment, payment_method, notes_customer } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Items requeridos' }) }
    }

    if (!customer || !customer.nombre || !customer.apellido || !customer.email || !customer.telefono) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Datos de cliente incompletos' }) }
    }

    if (!fulfillment || !fulfillment.type) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Tipo de entrega requerido' }) }
    }

    if (!payment_method) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Método de pago requerido' }) }
    }

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const discounts = 0
    const total = subtotal - discounts

    // Crear orden
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

    // Generar mensaje WhatsApp
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

    // Actualizar orden con mensaje
    await supabase
      .from('juancito_orders')
      .update({ whatsapp_message: message })
      .eq('id', order.id)

    const whatsappUrl = whatsappPhone
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
      : null

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_number: order.order_number,
        whatsapp_url: whatsappUrl,
        message,
      }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
