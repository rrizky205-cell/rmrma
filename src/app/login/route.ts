import { loginHtml } from '@/lib/html-pages';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(loginHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}