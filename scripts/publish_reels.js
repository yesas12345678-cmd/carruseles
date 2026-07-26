/**
 * Módulo de Auto-Publicación de Carruseles Multipágina (6 Diapositivas) en Instagram y TikTok
 */

import fs from 'fs';
import path from 'path';

// Carga automática del archivo .env local
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
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

async function publishInstagramCarousel(caption) {
  if (!IG_USER_ID || IG_USER_ID.includes('TU_')) {
    console.log(' ⚠️ IG_USER_ID no configurado en .env. Saltando Instagram...');
    return;
  }

  const slidesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data.json'), 'utf8'));
  const totalSlides = slidesData.length;
  const childItemIds = [];
  const cacheBuster = Date.now();

  console.log(` 📸 [Instagram] Creando Contenedor de Carrusel Multipágina sin caché (${totalSlides} diapositivas)...`);

  for (let i = 1; i <= totalSlides; i++) {
    const imageUrl = `${PUBLIC_BASE_URL}/api/image?file=slide-${i}.jpg&v=${cacheBuster}`;
    console.log(`  ⏳ Subiendo Diapositiva ${i}/${totalSlides} -> ${imageUrl}`);

    const itemUrl = new URL(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media`);
    itemUrl.searchParams.append('access_token', IG_ACCESS_TOKEN);
    itemUrl.searchParams.append('image_url', imageUrl);
    itemUrl.searchParams.append('is_carousel_item', 'true');

    const itemRes = await fetch(itemUrl.toString(), { method: 'POST' });
    const itemData = await itemRes.json();
    if (itemData.error) throw new Error(`[Instagram Item ${i}] ${itemData.error.message}`);

    childItemIds.push(itemData.id);
  }

  console.log(' ⏳ [Instagram] Uniendo diapositivas en un único Post Carrusel...');
  const carouselUrl = new URL(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media`);
  carouselUrl.searchParams.append('access_token', IG_ACCESS_TOKEN);
  carouselUrl.searchParams.append('media_type', 'CAROUSEL');
  carouselUrl.searchParams.append('children', childItemIds.join(','));
  carouselUrl.searchParams.append('caption', caption);

  const carouselRes = await fetch(carouselUrl.toString(), { method: 'POST' });
  const carouselData = await carouselRes.json();
  if (carouselData.error) throw new Error(`[Instagram Carousel Container] ${carouselData.error.message}`);

  const creationId = carouselData.id;
  console.log(` ⏳ Publicando Carrusel en vivo en el perfil (ID: ${creationId})...`);

  await new Promise(r => setTimeout(r, 5000));

  const publishUrl = new URL(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`);
  publishUrl.searchParams.append('access_token', IG_ACCESS_TOKEN);
  publishUrl.searchParams.append('creation_id', creationId);

  const publishRes = await fetch(publishUrl.toString(), { method: 'POST' });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`[Instagram Publish] ${publishData.error.message}`);

  console.log(`\n🎉 ¡ÉXITO TOTAL EN INSTAGRAM! Carrusel de 6 diapositivas publicado.`);
  console.log(`🔗 ID en Instagram: ${publishData.id}`);
  return publishData.id;
}

async function publishTikTokPost(videoPublicUrl, caption) {
  if (!TIKTOK_ACCESS_TOKEN || TIKTOK_ACCESS_TOKEN.includes('TU_')) {
    console.log(' ⚠️ TIKTOK_ACCESS_TOKEN no configurado en .env. Saltando TikTok...');
    return;
  }

  console.log(' 🎵 [TikTok] Enviando Vídeo del Carrusel a TikTok...');
  
  const directEndpoint = 'https://open.tiktokapis.com/v2/post/publish/video/init/';
  const payload = {
    post_info: {
      title: caption.slice(0, 150),
      privacy_level: 'PUBLIC_TO_EVERYONE',
      disable_comment: false
    },
    source_info: {
      source: 'PULL_FROM_URL',
      video_url: videoPublicUrl
    }
  };

  let res = await fetch(directEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(payload)
  });

  let data = await res.json();

  if (data.error && data.error.code !== 'ok') {
    const inboxEndpoint = 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/';
    const inboxPayload = {
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoPublicUrl
      }
    };
    res = await fetch(inboxEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(inboxPayload)
    });
    data = await res.json();
  }

  if (data.error && data.error.code !== 'ok') {
    throw new Error(`[TikTok API] ${data.error.message || JSON.stringify(data.error)}`);
  }

  console.log(`\n🎉 ¡ÉXITO EN TIKTOK! Vídeo enviado correctamente.`);
  console.log(`🔗 ID de Publicación en TikTok: ${data.data?.publish_id || 'OK'}`);
  return data.data?.publish_id;
}

async function main() {
  const slidesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data.json'), 'utf8'));
  const firstSlideTitle = slidesData[0]?.titulo_hook || 'Carrusel DevOps';
  const sampleCaption = `${firstSlideTitle} 🚀 #DevOps #CyberSecurity #Code @cyber_raw_dev`;
  const videoPublicUrl = `${PUBLIC_BASE_URL}/export/carousel.mp4?v=${Date.now()}`;

  console.log('🚀 Iniciando script de publicación en Redes Sociales (Instagram & TikTok)...');
  try {
    console.log('\n--- 1/2 INSTAGRAM (CARRUSEL MULTIPÁGINA DE 6 DIAPOSITIVAS) ---');
    await publishInstagramCarousel(sampleCaption);

    console.log('\n--- 2/2 TIKTOK ---');
    await publishTikTokPost(videoPublicUrl, sampleCaption);
  } catch (err) {
    console.error('❌ Error durante la publicación:', err.message);
  }
}

main();
