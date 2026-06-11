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
          // Busca clientes e junta com as configurações de recebimento da revenda
          const { data: clients, error } = await supabaseAdmin
            .from('clients')
            .select('*, resale_settings!inner(pix_key, beneficiary_name)')
            .in('status', ['pendente', 'atrasado', 'bloqueado']);

          if (error) throw error;

          const today = new Date();
          const results = [];

          const urlVPS = "http://204.157.108.55/message/sendText/cobranca";
          const apiKeyVPS = "Robson123";

          for (const client of clients) {
            if (!client.due_date) continue;
            
            const dueDate = parseISO(client.due_date);
            const diffDays = differenceInDays(dueDate, today);
            const diffDaysOverdue = differenceInDays(today, dueDate);

            // Pega dados de recebimento dinâmicos do banco
            const pixKey = client.resale_settings?.pix_key || "Chave não configurada";
            const beneficiaryName = client.resale_settings?.beneficiary_name || "Beneficiário não configurado";

            let message = "";
            let shouldSend = false;

            if (diffDays === 3) {
              message = `Lembrete: Sua assinatura vence em 3 dias. Valor: ${client.value}. Prepare seu pagamento!`;
              shouldSend = true;
            } else if (diffDays === 0) {
              message = `Seu vencimento é hoje! Faça o Pix para a chave: ${pixKey} no valor de ${client.value}. Beneficiário: ${beneficiaryName}`;
              shouldSend = true;
            } else if (diffDaysOverdue >= 5) {
              message = `Aviso importante: Sua fatura está vencida há ${diffDaysOverdue} dias. Seu acesso foi bloqueado. Por favor, regularize para reativar.`;
              shouldSend = client.status !== 'bloqueado'; // Only send if not already blocked
              
              // Bloqueio automático
              await supabaseAdmin
                .from('clients')
                .update({ status: 'bloqueado' })
                .eq('id', client.id);
            }

            if (shouldSend) {
              const numeroFormatado = client.phone.replace(/\D/g, "");
              const numeroFinal = numeroFormatado.startsWith("55") ? numeroFormatado : `55${numeroFormatado}`;

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

              if (diffDaysOverdue > 0 && diffDaysOverdue < 5 && client.status === 'pendente') {
                await supabaseAdmin
                  .from('clients')
                  .update({ status: 'atrasado' })
                  .eq('id', client.id);
              }
            }
          }

          return new Response(JSON.stringify({ success: true, processed: results.length }), {
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
