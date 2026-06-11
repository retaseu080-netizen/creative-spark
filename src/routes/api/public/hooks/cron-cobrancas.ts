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
          // 1. Fetch clients with pending or overdue status
          const { data: clients, error } = await supabaseAdmin
            .from('clients')
            .select('*')
            .in('status', ['pendente', 'atrasado']);

          if (error) throw error;

          const today = new Date();
          const results = [];

          const urlVPS = "http://204.157.108.55/message/sendText/cobranca";
          const apiKeyVPS = "Robson123";
          const minhaChavePix = "seu-email-ou-cpf@dominio.com"; 
          const nomeBeneficiario = "Seu Nome Completo";

          for (const client of clients) {
            if (!client.due_date) continue;
            
            const dueDate = parseISO(client.due_date);
            const diffDays = differenceInDays(dueDate, today);
            const diffDaysOverdue = differenceInDays(today, dueDate);

            let message = "";
            let shouldSend = false;

            // Lógica da régua de cobrança
            if (diffDays === 3) {
              // 3 dias para o vencimento: Lembrete preventivo
              message = `Olá, *${client.name}*! Passando para lembrar que sua fatura vence em 3 dias (${format(dueDate, 'dd/MM/yyyy')}).`;
              shouldSend = true;
            } else if (diffDays === 0) {
              // Vencimento hoje: Dados e Pix
              message = `Olá, *${client.name}*! Sua fatura vence hoje.\n\n💰 *Valor:* ${client.value}\n🔑 *Chave Pix:* ${minhaChavePix}\n👤 *Beneficiário:* ${nomeBeneficiario}\n\nEvite o bloqueio realizando o pagamento hoje!`;
              shouldSend = true;
            } else if (diffDaysOverdue === 5) {
              // 5 dias de atraso: Alerta de cobrança vencida
              message = `ATENÇÃO, *${client.name}*! Identificamos que sua fatura está atrasada há 5 dias. Por favor, regularize seu débito imediatamente para evitar a suspensão dos serviços.`;
              shouldSend = true;
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

              // Atualiza status se estiver atrasado (opcional, mas bom para o sistema)
              if (diffDaysOverdue > 0 && client.status === 'pendente') {
                await supabaseAdmin
                  .from('clients')
                  .update({ status: 'atrasado' })
                  .eq('id', client.id);
              }
            }
          }

          return new Response(JSON.stringify({ success: true, results }), {
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
