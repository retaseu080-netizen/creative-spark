import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { differenceInDays, parseISO, format } from 'date-fns';

export const Route = createFileRoute('/api/public/hooks/cron-cobrancas')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get('apikey');
        const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;

        if (authHeader !== anonKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }

        try {
          // 1. O sistema busca no banco de dados os clientes das 3 regras
          const { data: clients, error } = await supabaseAdmin
            .from('clients')
            .select('*')
            .in('status', ['pendente', 'atrasado']);

          if (error) throw error;

          const today = new Date();
          const results = [];

          const urlVPS = "http://204.157.108.55/message/sendText/cobranca";
          const apiKeyVPS = "Robson123";
          const minhaChavePix = "sua-chave@pix.com";

          for (const client of clients) {
            if (!client.due_date) continue;
            
            const dueDate = parseISO(client.due_date);
            const diffDays = differenceInDays(dueDate, today);
            const diffDaysOverdue = differenceInDays(today, dueDate);

            let message = "";
            let shouldSend = false;

            // 2. Para cada grupo, ele monta o texto ideal:
            if (diffDays === 3) {
              // Faltam exatamente 3 dias
              message = `Lembrete: Sua assinatura vence em 3 dias. Valor: ${client.value}. Prepare seu pagamento!`;
              shouldSend = true;
            } else if (diffDays === 0) {
              // Vencimento hoje
              message = `Seu vencimento é hoje! Faça o Pix para a chave: ${minhaChavePix} no valor de ${client.value}`;
              shouldSend = true;
            } else if (diffDaysOverdue === 5) {
              // Atrasado há exatamente 5 dias
              message = `Aviso importante: Sua fatura está vencida há 5 dias. Por favor, regularize para evitar bloqueios.`;
              shouldSend = true;
            }

            if (shouldSend) {
              const numeroFormatado = client.phone.replace(/\D/g, "");
              const numeroFinal = numeroFormatado.startsWith("55") ? numeroFormatado : `55${numeroFormatado}`;

              // 3. O sistema dispara os loops usando o fetch seguro para a sua VPS
              const vpsResponse = await fetch(urlVPS, {
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

              results.push({
                client: client.name,
                sent: vpsResponse.ok,
                status: vpsResponse.status
              });

              // Atualiza status para atrasado se necessário
              if (diffDaysOverdue > 0 && client.status === 'pendente') {
                await supabaseAdmin
                  .from('clients')
                  .update({ status: 'atrasado' })
                  .eq('id', client.id);
              }
            }
          }

          return new Response(JSON.stringify({ success: true, processed: results.length, details: results }), {
            headers: { 'Content-Type': 'application/json' }
          });

        } catch (err: any) {
          console.error('Cron error:', err);
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  }
});
