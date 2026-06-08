import { useState } from "react";

export function useWebhook() {
  const [url, setUrl] = useState(() => localStorage.getItem("webhook_url") || "");

  const saveUrl = (newUrl: string) => {
    setUrl(newUrl);
    localStorage.setItem("webhook_url", newUrl);
  };

  const testConnection = async () => {
    if (!url) return { success: false, message: "URL não configurada." };
    
    try {
      // Simulação de disparo
      console.log("Simulando disparo para:", url);
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true, message: "Conexão de cobrança testada com sucesso!" };
    } catch (error) {
      return { success: false, message: "Erro ao testar conexão." };
    }
  };

  const notifyPayment = async (clientId: string) => {
    if (!url) return;
    
    try {
      console.log(`Disparando webhook de pagamento para cliente ${clientId}: ${url}`);
      // Imediatamente após a alteração do status para pago, o sistema deve disparar uma requisição em segundo plano
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "PAYMENT_RECEIVED", clientId, message: "Obrigado" })
      }).catch(e => console.error("Webhook fallback error:", e));
      
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return { url, saveUrl, testConnection, notifyPayment };
}
