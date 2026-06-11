import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { phone, message } = request.body;

    if (!phone || !message) {
      return response.status(400).json({ error: 'Phone and message are required' });
    }

    // Aqui você integraria com sua API de WhatsApp (Ex: Evolution API, WPPConnect, etc.)
    console.log(`Enviando cobrança para ${phone}: ${message}`);

    return response.status(200).json({ 
      success: true, 
      message: 'Cobrança enviada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao enviar cobrança:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
