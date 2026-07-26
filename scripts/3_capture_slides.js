import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import ffmpegStatic from 'ffmpeg-static';
import { execSync } from 'child_process';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EXPORT_DIR = path.join(process.cwd(), 'export');
const PUBLIC_EXPORT_DIR = path.join(process.cwd(), 'public', 'export');
const DATA_FILE = path.join(process.cwd(), 'data.json');

async function captureCarousel() {
  console.log('📸 Iniciando Módulo de Captura con Puppeteer (JPEG HD + Vídeo MP4)...');

  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ Error: No se encontró data.json. Ejecuta primero npm run generate.');
    process.exit(1);
  }

  const slidesData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const totalSlides = slidesData.length;

  if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_EXPORT_DIR)) fs.mkdirSync(PUBLIC_EXPORT_DIR, { recursive: true });

  const puppeteerOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();

  await page.setViewport({
    width: 1080,
    height: 1350,
    deviceScaleFactor: 2
  });

  console.log(`🖼️  Generando ${totalSlides} capturas de pantalla en formato JPEG HD...`);

  for (let i = 1; i <= totalSlides; i++) {
    const slideUrl = `${BASE_URL}?slide=${i}`;
    console.log(`⏳ Capturando Slide ${i}/${totalSlides} -> ${slideUrl}`);

    await page.goto(slideUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const slideElement = await page.$('#slide-container');

    if (slideElement) {
      const outputPath = path.join(EXPORT_DIR, `slide-${i}.jpg`);
      const publicPath = path.join(PUBLIC_EXPORT_DIR, `slide-${i}.jpg`);
      await slideElement.screenshot({
        path: outputPath,
        type: 'jpeg',
        quality: 95
      });
      fs.copyFileSync(outputPath, publicPath);
      console.log(`  ✅ Guardado: export/slide-${i}.jpg`);
    }
  }

  await browser.close();

  // Generar vídeo MP4 animado de 1080x1350 para TikTok
  console.log(' 🎬 Compilando vídeo MP4 para TikTok...');
  const mp4ExportPath = path.join(EXPORT_DIR, 'carousel.mp4');
  const mp4PublicPath = path.join(PUBLIC_EXPORT_DIR, 'carousel.mp4');

  const ffmpegCmd = `ffmpeg -y -framerate 1/2.5 -i "${path.join(EXPORT_DIR, 'slide-%d.jpg')}" -c:v libx264 -r 30 -pix_fmt yuv420p -vf scale=1080:1350 "${mp4ExportPath}"`;
  
  try {
    execSync(ffmpegCmd);
  } catch (e) {
    const fallbackCmd = `"${ffmpegStatic}" -y -framerate 1/2.5 -i "${path.join(EXPORT_DIR, 'slide-%d.jpg')}" -c:v libx264 -r 30 -pix_fmt yuv420p -vf scale=1080:1350 "${mp4ExportPath}"`;
    execSync(fallbackCmd);
  }

  fs.copyFileSync(mp4ExportPath, mp4PublicPath);

  console.log(`\n🎉 ¡Captura y Video MP4 finalizados con éxito!`);
  console.log(`📁 Imágenes y Vídeo listos en: ${EXPORT_DIR}`);
}

captureCarousel();
