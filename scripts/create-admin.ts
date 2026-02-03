import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import * as readline from 'readline'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function createAdmin() {
  console.log('👤 Crear nuevo admin\n')

  const email = await question('Email: ')
  const password = await question('Contraseña: ')

  if (!email || !password) {
    console.error('Email y contraseña son requeridos')
    rl.close()
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('juancito_admins')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'admin',
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating admin:', error)
  } else {
    console.log(`✅ Admin creado: ${data.email}`)
  }

  rl.close()
}

createAdmin()
