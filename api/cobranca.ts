import { Pool } from 'pg';

// Configuração da conexão com o banco Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Variável de ambiente com a Connection String da Neon
  ssl: { rejectUnauthorized: false }
});

function obterTemplatePorRegra(diasParaVencer) {
  if (diasParaVencer === 3) {
    return `Olá, *{nome_cliente}*! Tudo bem? ☀️\n\nPassando para lembrar que a sua assinatura do IPTV vence em 3 dias, no dia *{data_vencimento}*.\n\n🔑 *CHAVE PIX:* \`{chave_pix}\`\n💳 *VALOR:* \`R$ {valor}\`\n\nPara antecipar o seu pagamento e evitar interrupções, basta fazer o Pix com os dados acima. Se já pagou, por favor desconsidere! 👍`;
  }
  
  if (diasParaVencer === 0) {
    return `Atenção, *{nome_cliente}*! ⏳\n\nO seu plano de IPTV vence *hoje* ({data_vencimento}). Para manter o seu acesso ativo e sem travamentos, efetue o pagamento:\n\n🔑 *CHAVE PIX:* \`{chave_pix}\`\n💳 *VALOR:* \`R$ {valor}\`\n\n*Importante:* O não pagamento hoje poderá gerar a suspensão automática dos serviços nos próximos dias. 🛠️`;
  }
  
  if (diasParaVencer === -5) {
    return `Olá, *{nome_cliente}*. ⚠️\n\nComo o pagamento do seu IPTV vencido em {data_vencimento} não foi identificado, o seu *acesso foi suspenso temporariamente*.\n\n🔄 Para reativar imediatamente, faça o Pix com os dados abaixo:\n\n🔑 *CHAVE PIX:* \`{chave_pix}\`\n💳 *VALOR:* \`R$ {valor}\`\n\nApós pagar, envie o comprovante aqui no chat para agilizarmos a sua liberação!`;
  }
  
  return null;
}

export default async function handler(req, res) {
  // Proteção simples para garantir que apenas o agendamento do Cron execute o script
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  try {
    // Busca os clientes que vencem em 3 dias, hoje ou venceram há 5 dias
    const query = `
      SELECT 
        nome,
        telefone,
        valor_plano,
        chave_pix_revenda,
        instancia_whatsapp,
        TO_CHAR(data_vencimento, 'DD/MM/YYYY') as data_vencimento_formatada,
        (data_vencimento::date - CURRENT_DATE) AS dias_para_vencer
      FROM clientes_iptv
      WHERE 
        (data_vencimento::date - CURRENT_DATE) = 3
        OR (data_vencimento::date - CURRENT_DATE) = 0
        OR (data_vencimento::date - CURRENT_DATE) = -5;
    `;

    const { rows: clientesFiltrados } = await pool.query(query);

    for (const cliente of clientesFiltrados) {
      let template = obterTemplatePorRegra(cliente.dias_para_vencer);
      if (!template) continue;

      const mensagemFinal = template
        .replace('{nome_cliente}', cliente.nome)
        .replace('{data_vencimento}', cliente.data_vencimento_formatada)
        .replace('{chave_pix}', cliente.chave_pix_revenda)
        .replace('{valor}', Number(cliente.valor_plano).toFixed(2));

      // Dispara para a sua VPS Cloud Win na porta 8080
      const urlEvolution = `http://204.157.108{cliente.instancia_whatsapp}`;

      await fetch(urlEvolution, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'Robson123'
        },
        body: JSON.stringify({
          number: cliente.telefone,
          text: mensagemFinal,
          delay: 1200 // Delay de segurança antiban
        })
      });
    }

    return res.status(200).json({ status: 'Sucesso', total_disparos: clientesFiltrados.length });
  } catch (erro) {
    return res.status(500).json({ status: 'Erro', detalhe: erro.message });
  }
}
