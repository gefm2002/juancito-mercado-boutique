import { spawn } from 'child_process'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Verificar que las variables de entorno estén configuradas
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY']
const missing = required.filter(key => !process.env[key])

if (missing.length > 0) {
  console.error('❌ Faltan variables de entorno:', missing.join(', '))
  console.error('   Configura .env.local con las credenciales de Supabase')
  process.exit(1)
}

console.log('🚀 Iniciando Netlify Dev para funciones...')
console.log('   Las funciones estarán disponibles en http://localhost:8888/.netlify/functions\n')

// Ejecutar netlify dev
const netlify = spawn('netlify', ['dev'], {
  stdio: 'inherit',
  shell: true,
})

netlify.on('error', (error) => {
  console.error('❌ Error:', error.message)
  console.log('\n💡 Instala Netlify CLI: npm install -g netlify-cli')
  process.exit(1)
})

netlify.on('exit', (code) => {
  process.exit(code || 0)
})
