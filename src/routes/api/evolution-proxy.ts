import { createFileRoute } from '@tanstack/react-router';

// Generic proxy to Evolution API to avoid CORS and keep apikey out of the browser network log when desired.
// Body: { url, apikey, path, method, body }
export const Route = createFileRoute('/api/evolution-proxy')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { url, apikey, path, method = 'GET', body } = await request.json();
          if (!url || !apikey || !path) {
            return new Response(JSON.stringify({ success: false, error: 'url, apikey e path são obrigatórios' }), {
              status: 400, headers: { 'Content-Type': 'application/json' },
            });
          }
          const cleanUrl = String(url).replace(/\/+$/, '');
          const cleanPath = String(path).startsWith('/') ? path : `/${path}`;
          const res = await fetch(`${cleanUrl}${cleanPath}`, {
            method,
            headers: { 'Content-Type': 'application/json', apikey: String(apikey) },
            body: body ? JSON.stringify(body) : undefined,
          });
          const text = await res.text();
          let data: any = null;
          try { data = JSON.parse(text); } catch { data = { raw: text }; }
          return new Response(JSON.stringify({ success: res.ok, status: res.status, data }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});
