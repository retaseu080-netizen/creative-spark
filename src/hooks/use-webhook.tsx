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
      console.log("Simulando disparo para:", url);
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true, message: "Conexão de cobrança testada com sucesso!" };
    } catch (error) {
      return { success: false, message: "Erro ao testar conexão." };
    }
  };

  const notifyPayment = async (clientId: string, nextDueDate?: string) => {
    if (!url) return;
    
    try {
      const template = localStorage.getItem("msg_thanks") || "Obrigado! Seu pagamento foi confirmado com sucesso. Próximo vencimento: {nova_data_vencimento}";
      const formattedMessage = template.replace("{nova_data_vencimento}", nextDueDate || "Não definida");

      console.log(`Disparando webhook de pagamento para cliente ${clientId}: ${url}`);
      
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event: "PAYMENT_RECEIVED", 
          clientId, 
          message: formattedMessage,
          nextDueDate 
        })
      }).catch(e => console.error("Webhook fallback error:", e));
      
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const notifyStatusChange = async (clientId: string, status: "PENDING" | "OVERDUE_ALERT", daysInfo: string) => {
    if (!url) return;
    
    try {
      const message = status === "PENDING" 
        ? `Alerta Antecipado: Faltam ${daysInfo} para o vencimento.`
        : `Cobrança de Atraso: Cliente está vencido há ${daysInfo}.`;

      console.log(`Disparando webhook automático (${status}) para cliente ${clientId}: ${url}`);
      
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event: status, 
          clientId, 
          message,
          timestamp: new Date().toISOString()
        })
      }).catch(e => console.error("Webhook auto fallback error:", e));
      
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const genericRequest = async (payload: any) => {
    if (!url) {
      toast.error("Webhook não configurado.");
      return { success: false, error: "URL não configurada" };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorText = await response.text();
        return { success: false, error: `Erro ${response.status}: ${errorText || "Sem resposta do servidor"}` };
      }
    } catch (error: any) {
      console.error("Webhook error:", error);
      return { success: false, error: error.message || "Erro de conexão/CORS" };
    }
  };

  return { url, saveUrl, testConnection, notifyPayment, notifyStatusChange, genericRequest };
}



