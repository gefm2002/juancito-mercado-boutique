import * as dotenv from 'dotenv'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

async function applyMigrations() {
  console.log('📦 Preparando migrations para ejecución...\n')

  const migrationPath = join(process.cwd(), 'supabase/migrations/001_init.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  // Crear un archivo HTML que abra el SQL Editor con el contenido
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Supabase SQL Editor - Juancito</title>
  <meta charset="utf-8">
</head>
<body>
  <h1>SQL para ejecutar en Supabase</h1>
  <p>1. Ve a: <a href="https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota/sql/new" target="_blank">SQL Editor</a></p>
  <p>2. Copia el SQL de abajo</p>
  <p>3. Pega en el editor y ejecuta (Cmd/Ctrl + Enter)</p>
  <textarea id="sql" style="width: 100%; height: 80vh; font-family: monospace; font-size: 12px;">${migrationSQL}</textarea>
  <button onclick="copySQL()">Copiar SQL</button>
  <script>
    function copySQL() {
      document.getElementById('sql').select();
      document.execCommand('copy');
      alert('SQL copiado al portapapeles!');
    }
  </script>
</body>
</html>`

  const htmlPath = join(process.cwd(), 'migration-helper.html')
  writeFileSync(htmlPath, htmlContent)

  console.log('✅ Archivo helper creado: migration-helper.html')
  console.log('\n📝 Para ejecutar las migrations:')
  console.log('   1. Abre migration-helper.html en tu navegador')
  console.log('   2. O ve directamente a: https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota/sql/new')
  console.log('   3. Copia el contenido de: supabase/migrations/001_init.sql')
  console.log('   4. Pega en el SQL Editor')
  console.log('   5. Ejecuta (Cmd/Ctrl + Enter)\n')
  
  console.log('💡 El SQL está listo en: supabase/migrations/001_init.sql\n')
}

applyMigrations().catch(console.error)
