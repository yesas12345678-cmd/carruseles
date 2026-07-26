import fs from 'fs';
import path from 'path';

// Configuración de Ollama Local
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const TOPIC = process.argv[2] || '5 Buenas Prácticas de Ciberseguridad para Programadores';

const systemPrompt = `Eres un experto creador de contenido de tecnología e informática para redes sociales (Instagram/TikTok).
Tu tarea es generar el contenido para un carrusel educativo de 6 diapositivas (slides) sobre el tema especificado.

DEBES RESPONDER EXCLUSIVAMENTE CON UN ARRAY JSON VALIDO (SIN MARKDOWN, SIN CODEBLOCKS \`\`\`json, SIN TEXTO ADICIONAL).

El formato del JSON debe ser exactamente un array con 6 objetos con las siguientes claves:
[
  {
    "slide_numero": 1,
    "titulo_hook": "Título impactante y corto para enganchar",
    "texto_desarrollo": "Breve introducción o explicación directa del concepto",
    "emoji_o_icono": "Emoji representativo"
  },
  ...
]

Reglas:
1. Exactamente 6 diapositivas (slide_numero de 1 a 6).
2. El slide 1 debe ser el Hook (portada).
3. Los slides 2, 3, 4 y 5 son el desarrollo paso a paso.
4. El slide 6 debe ser una conclusión con Call to Action (Llamada a la acción para guardar/comentar).
5. Idioma: Español profesional e impactante.`;

async function generateCarouselContent() {
  console.log(`🚀 Generando contenido para el tema: "${TOPIC}" usando Ollama (${OLLAMA_MODEL})...`);
  
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Tema del carrusel: ${TOPIC}` }
        ],
        format: 'json', // Fuerza a Ollama a retornar JSON estructurado
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Error en la petición a Ollama: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawContent = data.message.content.trim();

    // Limpieza de posibles delimitadores markdown sobrantes
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    if (!Array.isArray(parsedData) || parsedData.length !== 6) {
      console.warn(`⚠️ Advertencia: Se esperaban 6 slides, pero se recibieron ${parsedData.length}.`);
    }

    const outputPath = path.join(process.cwd(), 'data.json');
    fs.writeFileSync(outputPath, JSON.stringify(parsedData, null, 2), 'utf8');

    console.log(`✅ Contenido generado con éxito y guardado en: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error durante la generación con Ollama:', error.message);
    console.error('💡 Asegúrate de tener Ollama ejecutándose en http://localhost:11434 y el modelo instalado (`ollama run llama3`).');
    process.exit(1);
  }
}

generateCarouselContent();
