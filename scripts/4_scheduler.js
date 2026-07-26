import cron from 'node-cron';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

/**
 * HORARIOS DE PUBLICACIÓN DIARIA (5 REELS AL DÍA)
 * 1. 09:00 AM
 * 2. 12:00 PM
 * 3. 03:00 PM (15:00)
 * 4. 06:00 PM (18:00)
 * 5. 09:00 PM (21:00)
 */
const SCHEDULES = [
  { time: '0 9 * * *', label: 'Mañana (09:00)' },
  { time: '0 12 * * *', label: 'Mediodía (12:00)' },
  { time: '0 15 * * *', label: 'Tarde (15:00)' },
  { time: '0 18 * * *', label: 'Tarde-Noche (18:00)' },
  { time: '0 21 * * *', label: 'Noche (21:00)' }
];

async function runPublishWorkflow(slotLabel) {
  console.log(`\n⏰ [${new Date().toLocaleString()}] Ejecutando workflow de publicación (${slotLabel})...`);
  
  try {
    // 1. Generar guion del Reel con Ollama local
    console.log(' 🤖 Paso 1: Generando contenido del Reel con Ollama...');
    await execPromise('node scripts/1_generate_content.js "DevOps y Ciberseguridad"');

    // 2. Renderizar imágenes / vídeos en formato Maximalista
    console.log(' 📸 Paso 2: Renderizando imágenes maximalistas...');
    await execPromise('node scripts/3_capture_slides.js');

    // 3. Publicar en Instagram y TikTok
    console.log(' 📲 Paso 3: Publicando Reel en Instagram y TikTok...');
    await execPromise('node scripts/publish_reels.js');

    console.log(`✅ [${slotLabel}] ¡Publicación ejecutada con éxito!`);
  } catch (error) {
    console.error(`❌ Error en el workflow de publicación (${slotLabel}):`, error.message);
  }
}

console.log('🤖 Motor Cron Iniciado: Programando 5 publicaciones diarias en Instagram y TikTok...');
console.log('📅 Horarios programados: 09:00, 12:00, 15:00, 18:00, 21:00');

SCHEDULES.forEach(slot => {
  cron.schedule(slot.time, () => {
    runPublishWorkflow(slot.label);
  });
  console.log(`  ⏰ Alarma activada para: ${slot.label} [cron: "${slot.time}"]`);
});

// Opción para probar ejecución inmediata desde la línea de comandos
if (process.argv.includes('--now')) {
  console.log('🚀 Modo manual activado: Ejecutando 1 publicación de prueba ahora mismo...');
  runPublishWorkflow('Test Manual Inmediato');
}
