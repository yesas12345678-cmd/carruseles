/**
 * Renderiza el vídeo vertical animado (1080x1920, 9:16) para TikTok / Reels.
 * Abre /video, congela todas las animaciones CSS (@keyframes) y avanza el reloj
 * frame a frame, enviando cada captura a ffmpeg. Resultado determinista y sin tirones.
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const FPS = Number(process.env.VIDEO_FPS || 30);
const EXPORT_DIR = path.join(process.cwd(), 'export');
const PUBLIC_EXPORT_DIR = path.join(process.cwd(), 'public', 'export');
const OUTPUT = path.join(EXPORT_DIR, 'video.mp4');

function ffmpegBinary() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return 'ffmpeg';
  } catch {
    return ffmpegStatic;
  }
}

async function renderVideo() {
  console.log('🎬 Renderizando vídeo animado 1080x1920...');
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_EXPORT_DIR, { recursive: true });

  const launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(`${BASE_URL}/video`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(async () => { await document.fonts.ready; });

  // Congela animaciones y ajusta títulos que desborden el ancho
  const duration = await page.evaluate(() => {
    document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 0; });
    document.querySelectorAll('.fit').forEach((el) => {
      let size = parseFloat(getComputedStyle(el).fontSize);
      // offsetWidth ignora los transforms de las animaciones (scrollWidth no)
      const widest = () => Math.max(...[...el.querySelectorAll('.word')].map((w) => w.offsetWidth));
      while (widest() > el.clientWidth && size > 36) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }
    });
    return parseFloat(document.getElementById('video-root').dataset.duration);
  });

  const totalFrames = Math.ceil(duration * FPS);
  console.log(`⏱️  Duración: ${duration.toFixed(1)}s -> ${totalFrames} frames a ${FPS} fps`);

  const ffmpeg = spawn(ffmpegBinary(), [
    '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', OUTPUT
  ], { stdio: ['pipe', 'ignore', 'inherit'] });
  const ffmpegDone = new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg salió con código ${code}`))));
  });

  const root = await page.$('#video-root');
  for (let f = 0; f < totalFrames; f++) {
    const ms = (f / FPS) * 1000;
    await page.evaluate((t) => {
      document.getAnimations().forEach((a) => { a.currentTime = t; });
    }, ms);
    const frame = await root.screenshot({ type: 'jpeg', quality: 92 });
    if (!ffmpeg.stdin.write(frame)) await new Promise((r) => ffmpeg.stdin.once('drain', r));
    if (f % FPS === 0) process.stdout.write(`\r  🎞️  ${Math.round((f / totalFrames) * 100)}%`);
  }
  ffmpeg.stdin.end();
  await ffmpegDone;
  await browser.close();

  fs.copyFileSync(OUTPUT, path.join(PUBLIC_EXPORT_DIR, 'video.mp4'));
  console.log(`\n✅ Vídeo listo: ${OUTPUT}`);
}

renderVideo().catch((err) => {
  console.error('❌ Error renderizando el vídeo:', err.message);
  process.exit(1);
});
