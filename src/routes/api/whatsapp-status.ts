import { createFileRoute } from '@tanstack/react-router';

const EVOLUTION_URL = "http://204.157.108.55:3000";
const API_KEY = "Robson123";
const INSTANCE = "cobranca";

export const Route = createFileRoute('/api/whatsapp-status')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const response = await fetch(`${EVOLUTION_URL}/instance/connectionState/${INSTANCE}`, {
            method: 'GET',
            headers: { 'apikey': API_KEY },
          });
          const data = await response.json();
          return new Response(JSON.stringify({ success: response.ok, data }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});
