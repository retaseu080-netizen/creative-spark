// Função que escolhe o texto certo baseado nos dias
function obterTemplatePorRegra(diasAtraso) {
  if (diasAtraso === 3) {
    return `Olá, *{nome_cliente}*! Tudo bem? ☀️\n\nPassando para lembrar que a sua assinatura vence em 3 dias, no dia *{data_vencimento}*.\n\n🔑 *CHAVE PIX:* \`{chave_pix}\`\n💳 *VALOR:* \`R$ {valor}\`\n\nPara antecipar o seu pagamento e evitar interrupções, basta fazer o Pix com os dados acima. Se já pagou, por favor desconsidere! 👍`;
  }
  
  if (diasAtraso === 0) {
    return `Atenção, *{nome_cliente}*! ⏳\n\nO seu plano vence *hoje* ({data_vencimento}). Para manter o seu acesso ativo e sem travamentos, efetue o pagamento:\n\n🔑 *CHAVE PIX:* \`{chave_pix}\`\n💳 *VALOR:* \`R$ {valor}\`\n\n*Importante:* O não pagamento hoje poderá gerar a suspensão automática dos serviços nos próximos dias. 🛠️`;
  }
  
  if (diasAtraso === -5) {
    return `Olá, *{nome_cliente}*. ⚠️\n\nComo o pagamento vencido em {data_vencimento} não foi identificado, o seu *acesso foi suspenso temporariamente*.\n\n🔄 Para reativar o seu sistema imediatamente, faça o Pix com os dados abaixo:\n\n🔑 *CHAVE PIX:* \`{chave_pix}\`\n💳 *VALOR:* \`R$ {valor}\`\n\nApós pagar, envie o comprovante aqui no chat para agilizarmos a sua liberação!`;
  }
  
  return null;
}

// Função principal que a Vercel/Cron executa
export default async function handler(req, res) {
  // ATENÇÃO: Aqui você deve ter a sua busca no banco Neon que gera o array "clientesFiltrados"
  // Exemplo: const clientesFiltrados = await buscarClientesNoBanco();

  try {
    for (const cliente of clientesFiltrados) {
      let textoTemplate = obterTemplatePorRegra(cliente.dias_atraso);
      if (!textoTemplate) continue;

      const mensagemFinal = textoTemplate
        .replace('{nome_cliente}', cliente.nome)
        .replace('{data_vencimento}', cliente.data_vencimento_formatada)
        .replace('{chave_pix}', cliente.chave_pix_revenda)
        .replace('{valor}', Number(cliente.valor_plano).toFixed(2));

      // URL corrigida apontando para a sua VPS Cloud Win na porta 8080
      const urlEvolution = `http://204.157.108{cliente.instancia}`;

      await fetch(urlEvolution, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'Robson123'
        },
        body: JSON.stringify({
          number: cliente.telefone,
          text: mensagemFinal,
          delay: 1200 
        })
      });
    }

    return res.status(200).json({ status: 'Sucesso', mensagem: 'Disparos processados.' });
  } catch (erro) {
    return res.status(500).json({ status: 'Erro', detalhe: erro.message });
  }
}
