import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Vídeo vertical 1080x1920 (9:16) animado con @keyframes CSS.
// Todas las animaciones están sincronizadas a un reloj global: el script
// scripts/5_render_video.js pausa la página y avanza `currentTime` frame a frame.

const NEON = '#39FF14';

function sceneDuration(slide, index, total) {
  const words = `${slide.titulo_hook} ${slide.texto_desarrollo}`.split(/\s+/).length;
  if (index === 0) return 5.5; // Hook corto: engancha rápido
  const base = 2.2 + words * 0.17; // Tiempo de lectura
  const dur = Math.min(8, Math.max(4.5, base));
  return index === total - 1 ? dur + 1 : dur;
}

const css = `
  .video-root { width:1080px; height:1920px; position:relative; overflow:hidden; background:#000; color:#fff; }
  .layer { position:absolute; inset:0; }

  /* Ventana de visibilidad de cada escena (fill-mode none = oculta fuera de su tramo) */
  .scene { opacity:0; visibility:hidden; animation-name:sceneWindow; animation-timing-function:linear; animation-fill-mode:none; }
  @keyframes sceneWindow { 0%,100% { opacity:1; visibility:visible; } }

  @keyframes glitchIn {
    0%   { transform:translateX(-60px) skewX(18deg); filter:hue-rotate(90deg) contrast(2); clip-path:inset(20% 0 55% 0); }
    25%  { transform:translateX(40px) skewX(-10deg); clip-path:inset(60% 0 10% 0); }
    50%  { transform:translateX(-15px); clip-path:inset(5% 0 70% 0); }
    75%  { transform:translateX(8px); clip-path:inset(0 0 0 0); filter:none; }
    100% { transform:none; clip-path:inset(0 0 0 0); filter:none; }
  }
  @keyframes glitchOut {
    0%   { transform:none; opacity:1; clip-path:inset(0 0 0 0); }
    40%  { transform:translateX(30px) skewX(-15deg); clip-path:inset(40% 0 30% 0); }
    100% { transform:translateX(-120px) scale(1.08); opacity:0; clip-path:inset(48% 0 48% 0); }
  }
  @keyframes wordSlam {
    0%   { opacity:0; transform:scale(2.4) translateY(-30px) rotate(-4deg); filter:blur(10px); }
    55%  { opacity:1; transform:scale(0.92) rotate(1deg); filter:blur(0); }
    100% { opacity:1; transform:none; }
  }
  @keyframes lineIn {
    0%   { opacity:0; transform:translateY(40px); clip-path:inset(0 100% 0 0); }
    100% { opacity:1; transform:none; clip-path:inset(0 0 0 0); }
  }
  @keyframes boxIn {
    0%   { opacity:0; transform:translateY(80px) scale(0.96); box-shadow:0 0 0 ${NEON}; }
    100% { opacity:1; transform:none; box-shadow:18px 18px 0 ${NEON}; }
  }
  @keyframes emojiPop {
    0%   { transform:scale(0) rotate(-35deg); }
    60%  { transform:scale(1.25) rotate(8deg); }
    100% { transform:scale(1) rotate(0); }
  }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-18px); } }
  @keyframes flash { 0% { opacity:0.7; } 100% { opacity:0; } }
  @keyframes progress { from { transform:scaleX(0); } to { transform:scaleX(1); } }
  @keyframes bigNum { from { transform:translate(-50%,-50%) scale(1.25); opacity:0; } 15% { opacity:0.14; } to { transform:translate(-50%,-50%) scale(1); opacity:0.14; } }
  @keyframes gridScroll { from { background-position:0 0; } to { background-position:0 240px; } }
  @keyframes scanSweep { from { transform:translateY(-200px); } to { transform:translateY(2100px); } }
  @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
  @keyframes blink { 0%,49% { opacity:1; } 50%,100% { opacity:0; } }
  @keyframes pulse { 0%,100% { transform:scale(1); box-shadow:8px 8px 0 #fff; } 50% { transform:scale(1.06); box-shadow:14px 14px 0 #fff; } }
  @keyframes glowDrift { 0%,100% { transform:translate(0,0); } 50% { transform:translate(120px,80px); } }

  .grid-bg { background-image:linear-gradient(${NEON}22 2px, transparent 2px), linear-gradient(90deg, ${NEON}22 2px, transparent 2px); background-size:120px 120px; animation:gridScroll 4s linear infinite; }
  .dots { background-image:radial-gradient(${NEON} 1.5px, transparent 1.5px); background-size:28px 28px; opacity:0.12; }
  .scan { height:160px; background:linear-gradient(transparent, ${NEON}18, transparent); animation:scanSweep 3.5s linear infinite; }
  .scanlines { background:linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 50%); background-size:100% 6px; }
  .stroke { -webkit-text-stroke:5px ${NEON}; color:transparent; }
  .word { display:inline-block; margin-right:0.25em; animation:wordSlam 0.5s cubic-bezier(.2,.9,.3,1.2) both; }
`;

export default function VideoPage() {
  const filePath = path.join(process.cwd(), 'data.json');
  const slides = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const total = slides.length;

  let cursor = 0;
  const timeline = slides.map((slide, i) => {
    const dur = sceneDuration(slide, i, total);
    const item = { slide, start: cursor, dur, i };
    cursor += dur;
    return item;
  });
  const totalDuration = cursor;
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const s = (sec) => `${sec.toFixed(3)}s`;

  return (
    <main style={{ background: '#000', margin: 0 }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div id="video-root" className="video-root" data-duration={totalDuration}>
        {/* ---------- FONDO PERSISTENTE ---------- */}
        <div className="layer grid-bg" />
        <div className="layer dots" />
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[160px] -top-60 -left-60"
          style={{ background: `${NEON}40`, animation: 'glowDrift 9s ease-in-out infinite' }} />
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[160px] -bottom-60 -right-60"
          style={{ background: `${NEON}30`, animation: 'glowDrift 11s ease-in-out infinite reverse' }} />
        <div className="layer"><div className="scan" /></div>

        {/* Barra de progreso tipo stories */}
        <div className="absolute top-[56px] left-[60px] right-[60px] flex gap-3 z-30">
          {timeline.map(({ start, dur, i }) => (
            <div key={i} className="flex-1 h-[10px] bg-white/20 border border-white/40 overflow-hidden">
              <div className="h-full origin-left"
                style={{ background: NEON, animation: `progress ${s(dur)} linear ${s(start)} both` }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <header className="absolute top-[100px] left-[60px] right-[60px] z-30 flex items-center justify-between bg-black border-4 p-5"
          style={{ borderColor: NEON, boxShadow: `8px 8px 0 ${NEON}` }}>
          <div className="flex items-center gap-4">
            <span className="w-6 h-6" style={{ background: NEON, animation: 'blink 1s steps(1) infinite' }} />
            <span className="font-mono text-3xl font-extrabold tracking-widest" style={{ color: NEON }}>/// CYBER_FEED.RAW</span>
          </div>
          <span className="font-mono text-2xl font-black bg-white text-black px-4 py-1">● REC</span>
        </header>

        {/* ---------- ESCENAS ---------- */}
        {timeline.map(({ slide, start, dur, i }) => {
          const isFirst = i === 0;
          const isLast = i === total - 1;
          const words = slide.titulo_hook.split(/\s+/);
          const lines = slide.texto_desarrollo.split('\n');
          const titleEnd = 0.35 + words.length * 0.09 + 0.4;
          const boxStart = titleEnd;
          return (
            <div key={i} className="scene layer z-20"
              style={{ animationDuration: s(dur), animationDelay: s(start) }}>
              {/* Flash de corte */}
              <div className="layer bg-white z-40 pointer-events-none"
                style={{ animation: `flash 0.25s ease-out ${s(start)} both` }} />

              {/* Número gigante de fondo */}
              <div className="absolute top-1/2 left-1/2 font-display font-extrabold stroke leading-none select-none"
                style={{ fontSize: 620, animation: `bigNum ${s(dur)} ease-out ${s(start)} both` }}>
                {pad(i + 1)}
              </div>

              {/* Wrapper de salida (glitchOut) -> interior de entrada (glitchIn) */}
              <div className="layer"
                style={isLast ? undefined : { animation: `glitchOut 0.3s ease-in ${s(start + dur - 0.3)} forwards` }}>
                <div className="layer flex flex-col justify-center px-[60px] pt-[120px] pb-[300px] gap-12"
                  style={{ animation: `glitchIn 0.4s steps(6) ${s(start)} both` }}>

                  {/* Emoji + status */}
                  <div className="flex items-center gap-8">
                    <div style={{ animation: `emojiPop 0.6s cubic-bezier(.2,.9,.3,1.3) ${s(start + 0.15)} both` }}>
                      <div className="w-44 h-44 flex items-center justify-center text-8xl border-4 border-white"
                        style={{ background: NEON, boxShadow: '10px 10px 0 #fff', animation: `float 2.4s ease-in-out ${s(start + 0.8)} infinite` }}>
                        {slide.emoji_o_icono || '⚡'}
                      </div>
                    </div>
                    <div className="font-mono text-2xl uppercase tracking-wider border-2 px-5 py-3 bg-[#111]"
                      style={{ color: NEON, borderColor: NEON, animation: `lineIn 0.4s ease-out ${s(start + 0.3)} both` }}>
                      {isFirst ? 'ALERTA // CRITICAL_INFO' : `ESCENA_${pad(i + 1)} / ${pad(total)}`}
                    </div>
                  </div>

                  {/* Título palabra a palabra */}
                  <div className={isFirst ? 'border-4 border-white p-9' : ''}
                    style={isFirst ? { background: NEON, color: '#000', boxShadow: '14px 14px 0 #fff' } : undefined}>
                    <h1 className="fit font-display font-black uppercase leading-[1.12] tracking-tight"
                      style={{ fontSize: isFirst ? 84 : 76, color: isFirst ? '#000' : '#fff', textShadow: isFirst ? 'none' : `5px 5px 0 ${NEON}` }}>
                      {!isFirst && <span className="word" style={{ color: NEON, animationDelay: s(start + 0.3) }}>//</span>}
                      {words.map((w, wi) => (
                        <span key={wi} className="word" style={{ animationDelay: s(start + 0.35 + wi * 0.09) }}>{w}</span>
                      ))}
                    </h1>
                  </div>

                  {/* Caja de desarrollo: líneas reveladas una a una */}
                  <div className="bg-[#0A0A0A] border-4 p-10"
                    style={{ borderColor: NEON, animation: `boxIn 0.45s cubic-bezier(.2,.9,.3,1.1) ${s(start + boxStart)} both` }}>
                    <div className="flex justify-between border-b-2 pb-4 mb-7 font-mono text-xl" style={{ color: NEON, borderColor: `${NEON}80` }}>
                      <span>&gt;_ PAYLOAD_DATA_STREAM</span>
                      <span style={{ animation: 'blink 0.8s steps(1) infinite' }}>█</span>
                    </div>
                    {lines.map((line, li) => (
                      <p key={li} className="font-sans text-[46px] font-bold leading-snug mb-4 last:mb-0"
                        style={{ animation: `lineIn 0.55s ease-out ${s(start + boxStart + 0.35 + li * 0.9)} both` }}>
                        {line}
                      </p>
                    ))}
                  </div>

                  {isLast && (
                    <div className="self-start font-mono text-4xl font-black px-8 py-5 border-4 border-white"
                      style={{ background: NEON, color: '#000', animation: `lineIn 0.4s ease-out ${s(start + boxStart + 1.2)} both, pulse 1s ease-in-out ${s(start + boxStart + 1.6)} infinite` }}>
                      ⚡ SÍGUENOS Y COMPARTE
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* ---------- FOOTER / TICKER ---------- */}
        <footer className="absolute bottom-[170px] left-0 right-0 z-30 overflow-hidden border-y-4 border-white py-4" style={{ background: NEON }}>
          <div className="flex whitespace-nowrap w-max" style={{ animation: 'marquee 8s linear infinite' }}>
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="font-mono text-4xl font-black text-black tracking-tighter pr-8">
                {' '}@cyber_raw_dev /// CYBER_FEED.RAW /// NO_FILTER /// @cyber_raw_dev /// CYBER_FEED.RAW /// NO_FILTER ///
              </span>
            ))}
          </div>
        </footer>

        <div className="layer scanlines z-50 pointer-events-none" />
      </div>
    </main>
  );
}
