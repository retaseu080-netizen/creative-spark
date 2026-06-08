# Plano de Implementação: Sistema de Cobranças

## Arquitetura e Estrutura
1.  **Estado Global**: Criar um `src/hooks/use-auth.tsx` para gerenciar a autenticação e as roles (`admin` | `operator`).
2.  **Roteamento Protegido**:
    *   Criar `src/routes/login.tsx`.
    *   Modificar `src/routes/__root.tsx` ou usar um `beforeLoad` nas rotas para redirecionar usuários não autenticados.
    *   Configurar rotas: `/` (dashboard), `/login`, `/usuarios`, `/configuracoes`, `/clientes`.

## Telas
1.  **Login (`/login`)**: Formulário simples sem links públicos.
2.  **Dashboard**: Layout administrativo com menu lateral (condicional para roles).
3.  **Gestão de Equipe (`/usuarios`)**: Tabela e modal de criação (apenas Admin).
4.  **Configurações (`/configuracoes`)**: Campo para Webhook e botão de teste (acessível por ambos).
5.  **Clientes (`/clientes`)**: Lista com botão "Pago Manual" (dispara webhook).

## Detalhes Técnicos
*   **Autenticação**: Estado persistente simples em `localStorage` com um `AuthProvider`.
*   **Mask**: Máscara para telefone `(99) 99999-9999`.
*   **Webhooks**: Disparo via `fetch` simulando o POST na URL configurada.

## Credenciais Padrão (Admin)
*   **E-mail**: admin@sistema.com
*   **Senha**: admin123