import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.NETLIFY_JWT_SECRET || 'change-me-in-production'

function verifyToken(token: string) {
  try {
    return jwt.verify(token, jwtSecret) as { id: string; email: string; role: string }
  } catch {
    return null
  }
}

export const handler: Handler = async (event, context) => {
  const authHeader = event.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) }
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Token inválido' }) }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  if (event.httpMethod === 'GET') {
    try {
      const { data, error } = await supabase
        .from('juancito_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      }
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const body = JSON.parse(event.body || '{}')
      const { id, status, notes_internal } = body

      if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: 'ID requerido' }) }
      }

      const updateData: any = {}
      if (status) updateData.status = status
      if (notes_internal !== undefined) updateData.notes_internal = notes_internal

      const { data: order } = await supabase
        .from('juancito_orders')
        .select('*')
        .eq('id', id)
        .single()

      if (order) {
        // Regenerar mensaje WhatsApp si cambió el estado
        if (status && status !== order.status) {
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

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      }

      return { statusCode: 404, body: JSON.stringify({ error: 'Orden no encontrada' }) }
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      }
    }
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
}
