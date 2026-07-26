import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valParts] = trimmed.split('=');
      const val = valParts.join('=').trim();
      if (key && val && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

async function deleteOldPosts() {
  console.log('🗑️  Buscando publicaciones anteriores para eliminar de Instagram...');
  const res = await fetch(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media?access_token=${IG_ACCESS_TOKEN}`);
  const data = await res.json();

  if (!data.data || data.data.length === 0) {
    console.log('No se encontraron publicaciones.');
    return;
  }

  const latestCarouselId = '17941536051288883'; // Mantener el carrusel de 6 diapositivas perfecto

  for (const item of data.data) {
    if (item.id !== latestCarouselId) {
      console.log(` ⏳ Eliminando post de prueba ID: ${item.id}...`);
      const delRes = await fetch(`https://graph.facebook.com/v19.0/${item.id}?access_token=${IG_ACCESS_TOKEN}`, {
        method: 'DELETE'
      });
      const delData = await delRes.json();
      console.log(`  Result:`, delData);
    }
  }

  console.log('✨ Proceso de limpieza finalizado.');
}

deleteOldPosts();
