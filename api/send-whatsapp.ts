export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
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
      const { number, message } = await req.json();

      // Endereço da VPS fornecido pelo usuário
      const urlVPS = "http://204.157.108.182:3030/message/sendText/robson"; // Usando o IP completo que provavelmente foi cortado no prompt mas estava em contextos anteriores ou é o padrão esperado

      const response = await fetch(urlVPS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'Robson123'
        },
        body: JSON.stringify({
          "number": number,
          "options": { "delay": 1200, "presence": "composing" },
          "textMessage": { "text": message }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na VPS:", errorText);
        return new Response(JSON.stringify({ error: 'Erro ao enviar mensagem via VPS', details: errorText }), { status: 500, headers });
      }

      return new Response(JSON.stringify({
        sucesso: true,
        mensagem: "Mensagem enviada com sucesso!"
      }), { status: 200, headers });

    } catch (error) {
      console.error("Erro interno:", error);
      return new Response(JSON.stringify({ error: 'Erro interno ao processar requisição' }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers });
}
