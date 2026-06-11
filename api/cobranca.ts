export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Habilita o CORS para o Lovable acessar a API livremente
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method === 'POST') {
    try {
      const { valor, clienteNome, whatsappCliente } = await req.json();

      // Ajuste os seus dados do Pix Manual aqui
      const minhaChavePix = "seu-email-ou-cpf@dominio.com"; 
      const nomeBeneficiario = "Seu Nome Completo";

      // Formata o número do WhatsApp do cliente
      const numeroFormatado = whatsappCliente.replace(/\D/g, ""); 
      const numeroFinal = numeroFormatado.startsWith("55") ? numeroFormatado : `55${numeroFormatado}`;

      // Mensagem que o robô vai disparar
      const textoMensagem = `Olá, *${clienteNome}*!\n\nSegue os dados para o pagamento da sua cobrança:\n\n💰 *Valor:* R$ ${valor}\n🔑 *Chave Pix:* ${minhaChavePix}\n👤 *Beneficiário:* ${nomeBeneficiario}\n\nApós realizar o pagamento, por favor, envie o comprovante por aqui!`;

      // Disparo seguro direto para o IP da sua VPS na porta 8080
      const urlVPS = "http://204.157.108";
      
      await fetch(urlVPS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'Robson123'
        },
        body: JSON.stringify({
          "number": numeroFinal,
          "options": { "delay": 1200, "presence": "composing" },
          "textMessage": { "text": textoMensagem }
        })
      });

      return new Response(JSON.stringify({
        sucesso: true,
        chave: minhaChavePix,
        beneficiario: nomeBeneficiario,
        mensagem: "Cobrança enviada para o seu WhatsApp!"
      }), { status: 200, headers });

    } catch (error) {
      return new Response(JSON.stringify({ error: 'Erro ao processar cobrança' }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers });
}
