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
    const { data: categories, error: categoriesError } = await supabase
      .from('juancito_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (categoriesError) throw categoriesError

    const { data: products, error: productsError } = await supabase
      .from('juancito_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (productsError) throw productsError

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categories: categories || [],
        products: products || [],
      }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
