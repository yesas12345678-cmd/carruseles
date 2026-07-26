import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getSlideData(slideParam) {
  const filePath = path.join(process.cwd(), 'data.json');
  if (!fs.existsSync(filePath)) return null;
  const slides = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const idx = Math.max(0, parseInt(slideParam || '1', 10) - 1);
  return { 
    slide: slides[idx] || slides[0], 
    total: slides.length, 
    currentNumber: idx + 1 
  };
}

export default function SlidePage({ searchParams }) {
  const slideNum = searchParams?.slide || '1';
  const data = getSlideData(slideNum);

  if (!data || !data.slide) {
    return (
      <div className="w-[1080px] h-[1350px] bg-black text-[#39FF14] flex items-center justify-center font-mono text-2xl border-8 border-[#39FF14]">
        [ ERROR 404: DATA.JSON NOT FOUND ]
      </div>
    );
  }

  const { slide, total, currentNumber } = data;
  const isFirst = currentNumber === 1;
  const isLast = currentNumber === total;
  const formattedNum = currentNumber < 10 ? `0${currentNumber}` : `${currentNumber}`;
  const formattedTotal = total < 10 ? `0${total}` : `${total}`;

  return (
    <main className="flex items-center justify-center min-h-screen bg-black p-4 selection:bg-[#39FF14] selection:text-black">
      {/* Contenedor estricto 1080x1350 px con estética MAXIMALISTA NEGRO & VERDE FOSFORITO */}
      <div 
        id="slide-container"
        className="w-[1080px] h-[1350px] min-w-[1080px] min-h-[1350px] max-w-[1080px] max-h-[1350px] bg-black text-white relative flex flex-col justify-between p-12 overflow-hidden border-8 border-[#39FF14] scanlines"
      >
        {/* Fondo con patrón de puntos verdes neón */}
        <div className="absolute inset-0 bg-brutal-dots opacity-20 pointer-events-none" />

        {/* Glow neón verde gigante de fondo */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#39FF14]/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#39FF14]/20 rounded-full blur-[140px] pointer-events-none" />

        {/* NÚMERO GIGANTE MAXIMALISTA DE FONDO */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[450px] font-extrabold text-stroke-neon opacity-15 pointer-events-none select-none leading-none z-0">
          {formattedNum}
        </div>

        {/* Elementos decorativos estilo brutalista / crosshairs en las esquinas */}
        <div className="absolute top-4 left-4 text-[#39FF14] font-mono text-xs z-20">+ Crosshair_TL</div>
        <div className="absolute top-4 right-4 text-[#39FF14] font-mono text-xs z-20">[ MAXIMALIST_EDITION ]</div>
        <div className="absolute bottom-4 left-4 text-[#39FF14] font-mono text-xs z-20">// NO_FILTER //</div>
        <div className="absolute bottom-4 right-4 text-[#39FF14] font-mono text-xs z-20">BUILD_v3.0 +</div>

        {/* HEADER MAXIMALISTA */}
        <header className="relative z-10 flex items-center justify-between bg-black border-4 border-[#39FF14] p-4 shadow-[6px_6px_0px_#39FF14]">
          <div className="flex items-center space-x-3">
            <span className="w-5 h-5 bg-[#39FF14] animate-ping" />
            <span className="font-mono text-xl font-extrabold tracking-widest text-[#39FF14] uppercase">
              /// CYBER_FEED.RAW
            </span>
          </div>

          <div className="flex items-center space-x-2 font-mono text-2xl font-black bg-[#39FF14] text-black px-5 py-1">
            <span>{formattedNum}</span>
            <span>/</span>
            <span>{formattedTotal}</span>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL / SLIDE BODY */}
        <section className="relative z-10 flex-1 flex flex-col justify-center my-6 space-y-8">
          
          {/* EMOJI / BADGE NEÓN GIGANTE */}
          <div className="flex items-center space-x-6">
            <div className="w-28 h-28 bg-[#39FF14] text-black font-display flex items-center justify-center text-6xl font-black border-4 border-white shadow-[8px_8px_0px_#FFFFFF]">
              {slide.emoji_o_icono || '⚡'}
            </div>
            
            <div className="bg-[#111111] border-2 border-[#39FF14] px-4 py-2 text-[#39FF14] font-mono text-sm uppercase tracking-wider">
              STATUS: CRITICAL_INFO // SLIDE_{formattedNum}
            </div>
          </div>

          {/* TÍTULO PRINCIPAL (HOOK) MAXIMALISTA */}
          <div className="relative">
            {isFirst ? (
              <div className="bg-[#39FF14] text-black p-6 border-4 border-white shadow-[12px_12px_0px_#FFFFFF]">
                <h1 className="font-display text-6xl font-black uppercase tracking-tight leading-none">
                  {slide.titulo_hook}
                </h1>
              </div>
            ) : (
              <h1 className="font-display text-5xl font-black uppercase tracking-tight leading-tight text-white drop-shadow-[4px_4px_0px_#39FF14]">
                <span className="text-[#39FF14]">// </span>{slide.titulo_hook}
              </h1>
            )}
          </div>

          {/* CAJA DE DESARROLLO BRUTALISTA CON SOMBRA VERDE FOSFORITO GIGANTE */}
          <div className="bg-[#0A0A0A] border-4 border-[#39FF14] shadow-brutal-lg p-8 relative">
            <div className="flex items-center justify-between border-b-2 border-[#39FF14]/50 pb-3 mb-6 font-mono text-xs text-[#39FF14]">
              <span>&gt;_ PAYLOAD_DATA_STREAM</span>
              <span>TYPE: READ_ONLY</span>
            </div>

            <p className="font-sans text-3xl text-white font-bold leading-relaxed whitespace-pre-line">
              {slide.texto_desarrollo}
            </p>
          </div>

        </section>

        {/* FOOTER MAXIMALISTA */}
        <footer className="relative z-10 flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-[#39FF14] text-black p-4 border-4 border-white shadow-[6px_6px_0px_#FFFFFF]">
            <div className="font-mono text-2xl font-black tracking-tighter uppercase flex items-center space-x-2">
              <span className="bg-black text-[#39FF14] px-2 py-0.5">&gt;</span>
              <span>@cyber_raw_dev</span>
            </div>

            <div className="font-mono text-xl font-black bg-black text-[#39FF14] px-6 py-2 border-2 border-black flex items-center space-x-3">
              <span>{isLast ? '⚡ SÍGUENOS Y COMPARTE' : 'DESLIZA EL CARRUSEL ➔'}</span>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
