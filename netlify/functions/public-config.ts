import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
