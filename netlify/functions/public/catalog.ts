import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const { data: products, error } = await supabase
      .from('juancito_products')
      .select('*, category:juancito_categories(*)')
      .eq('out_of_stock', false)
      .order('is_featured', { ascending: false })
      .order('name')

    if (error) throw error

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
