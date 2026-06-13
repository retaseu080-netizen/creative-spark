import { useState, useEffect, useCallback } from "react";

export interface EvolutionConfig {
  url: string;
  apikey: string;
  instance: string;
}

const STORAGE_KEY = "evolution_config";

export function loadConfig(): EvolutionConfig {
  if (typeof window === "undefined") return { url: "", apikey: "", instance: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { url: "", apikey: "", instance: "cobranca" };
}

export function useEvolutionConfig() {
  const [config, setConfig] = useState<EvolutionConfig>(() => loadConfig());

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const save = useCallback((next: EvolutionConfig) => {
    setConfig(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  return { config, save };
}

async function callProxy(cfg: EvolutionConfig, path: string, method: string = "GET", body?: any) {
  const res = await fetch("/api/evolution-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: cfg.url, apikey: cfg.apikey, path, method, body }),
  });
  return res.json();
}

export function formatNumber(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  return clean.startsWith("55") ? clean : `55${clean}`;
}

export async function evolutionCreateInstance(cfg: EvolutionConfig) {
  return callProxy(cfg, "/instance/create", "POST", {
    instanceName: cfg.instance,
    qrcode: true,
    integration: "WHATSAPP-BAILEYS",
  });
}

export async function evolutionConnect(cfg: EvolutionConfig) {
  return callProxy(cfg, `/instance/connect/${cfg.instance}`, "GET");
}

export async function evolutionStatus(cfg: EvolutionConfig) {
  return callProxy(cfg, `/instance/connectionState/${cfg.instance}`, "GET");
}

export async function evolutionLogout(cfg: EvolutionConfig) {
  return callProxy(cfg, `/instance/logout/${cfg.instance}`, "DELETE");
}

export async function evolutionSendText(cfg: EvolutionConfig, number: string, text: string, delay = 1200) {
  return callProxy(cfg, `/message/sendText/${cfg.instance}`, "POST", {
    number: formatNumber(number),
    text,
    delay,
  });
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
