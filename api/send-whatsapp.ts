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

      // Endereço da VPS atualizado para a nova VPS do usuário
      const urlVPS = "http://204.157.108.55:3000/message/sendText/cobranca"; 

      const response = await fetch(urlVPS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'Robson123'
        },
        body: JSON.stringify({
          "number": number,
          "message": message
        })
      });

      // Como o endereço pode estar incompleto, capturamos o erro de rede se ocorrer
      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ 
          error: 'Erro ao enviar mensagem via VPS', 
          status: response.status,
          details: errorText 
        }), { status: 500, headers });
      }

      return new Response(JSON.stringify({
        sucesso: true,
        mensagem: "Mensagem enviada com sucesso para a VPS!"
      }), { status: 200, headers });

    } catch (error: any) {
      console.error("Erro interno:", error);
      return new Response(JSON.stringify({ 
        error: 'Erro interno ao processar requisição', 
        details: error.message 
      }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers });
}
