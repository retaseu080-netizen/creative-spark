import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/send-whatsapp')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { number, message } = body;

          if (!number || !message) {
            return new Response(JSON.stringify({ error: 'Número e mensagem são obrigatórios' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          const urlVPS = "http://204.157.108.55:3000/message/sendText/cobranca";
          const apiKeyVPS = "Robson123";

          const numeroFormatado = number.replace(/\D/g, "");
          const numeroFinal = numeroFormatado.startsWith("55") ? numeroFormatado : `55${numeroFormatado}`;

          const response = await fetch(urlVPS, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': apiKeyVPS
            },
            body: JSON.stringify({
              "number": numeroFinal,
              "options": { "delay": 1200, "presence": "composing" },
              "textMessage": { "text": message }
            })
          });

          const data = await response.json();

          return new Response(JSON.stringify({ sucesso: response.ok, data }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (err: any) {
          console.error('Send WhatsApp error:', err);
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  }
});
