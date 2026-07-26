import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file') || 'slide-1.jpg';
  const filePath = path.join(process.cwd(), 'export', file);

  if (!fs.existsSync(filePath)) {
    return new Response('File not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="${file}"`
    }
  });
}
