/**
 * MÓDULO EXTRA: Publicador Automático en Instagram vía Instagram Graph API
 * 
 * Requisitos previos:
 * 1. Cuenta de Instagram Business o Creator vinculada a una Página de Facebook.
 * 2. Aplicación Creada en Meta for Developers (https://developers.facebook.com/).
 * 3. Token de Acceso de Página con permisos: `instagram_basic`, `instagram_content_publish`.
 * 4. Las imágenes deben estar en una URL pública (p. ej., subiéndolas a Cloudinary, AWS S3 o usando ngrok/localtunnel).
 */

import fs from 'fs';
import path from 'path';

// Variables de entorno o configuración
const IG_USER_ID = process.env.IG_USER_ID || 'TU_INSTAGRAM_USER_ID';
const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || 'TU_PAGE_ACCESS_TOKEN';

/**
 * Función genérica para hacer peticiones HTTP a Graph API usando fetch nativo
 */
async function graphApiRequest(endpoint, params = {}) {
  const url = new URL(`https://graph.facebook.com/v19.0/${endpoint}`);
  url.searchParams.append('access_token', ACCESS_TOKEN);
  
  Object.keys(params).forEach(key => {
    if (Array.isArray(params[key])) {
      url.searchParams.append(key, params[key].join(','));
    } else {
      url.searchParams.append(key, params[key]);
    }
  });

  const res = await fetch(url.toString(), { method: 'POST' });
  const data = await res.json();
  
  if (data.error) {
    throw new Error(`[Graph API Error] ${data.error.message}`);
  }
  return data;
}

/**
 * Función Principal para publicar el carrusel
 * @param {Array<string>} imageUrls Array con 6 URLs públicas de las imágenes de /export
 * @param {string} caption Pie de foto o descripción de la publicación
 */
export async function publishCarouselToInstagram(imageUrls, caption) {
  console.log('📲 Iniciando publicación en Instagram Graph API...');

  try {
    // PASO 1: Crear un contenedor para cada imagen individual del carrusel
    const itemContainerIds = [];
    for (let i = 0; i < imageUrls.length; i++) {
      console.log(` 📤 Subiendo diapositiva ${i + 1}/${imageUrls.length}...`);
      const itemResponse = await graphApiRequest(`${IG_USER_ID}/media`, {
        image_url: imageUrls[i],
        is_carousel_item: 'true'
      });
      itemContainerIds.push(itemResponse.id);
    }

    console.log(' 🔗 Creando contenedor padre del Carruseles...');
    // PASO 2: Crear el contenedor principal del Carrusel enlazando todos los ítems
    const carouselResponse = await graphApiRequest(`${IG_USER_ID}/media`, {
      media_type: 'CAROUSEL',
      caption: caption,
      children: itemContainerIds
    });

    const carouselContainerId = carouselResponse.id;

    console.log(' 🚀 Publicando el carrusel en la cuenta...');
    // PASO 3: Publicar el contenedor del carrusel
    const publishResponse = await graphApiRequest(`${IG_USER_ID}/media_publish`, {
      creation_id: carouselContainerId
    });

    console.log(`✅ ¡Carrusel publicado exitosamente! Post ID: ${publishResponse.id}`);
    return publishResponse.id;

  } catch (error) {
    console.error('❌ Error al publicar en Instagram:', error.message);
  }
}

// Ejemplo de uso directo
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log('💡 Ejecuta este módulo proporcionando URLs públicas de las imágenes.');
}
