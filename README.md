# Plataforma de Intermediação de Negócios (MVP)

Este é o MVP de uma plataforma para gestão de oportunidades de negócios (carros, imóveis, empresas), contatos e pipeline de vendas.

## Tecnologias

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **UI**: Shadcn/UI
- **Backend**: Supabase (Auth, Database, Storage)

## Pré-requisitos

- Node.js 18+
- Conta no Supabase

## Configuração

### 1. Backend (Supabase)

1. Crie um novo projeto no Supabase.
2. Vá até o SQL Editor e execute o conteúdo do arquivo `backend/schema.sql`.
3. (Opcional) Execute o `backend/seed.sql` para popular com dados de exemplo (substitua o ID do usuário).

### 2. Frontend

1. Entre na pasta `frontend`:
   ```bash
   cd frontend
   ```

2. Instale as dependências (caso ainda não tenha instalado):
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Renomeie `.env.local.example` para `.env.local`
   - Preencha com suas chaves do Supabase:
     ```
     NEXT_PUBLIC_SUPABASE_URL=sua-url-do-projeto
     NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
     ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:3000`.

## Funcionalidades

- **Login**: Autenticação via Email/Senha (Supabase Auth).
- **Dashboard**: Visão geral de métricas.
- **Oportunidades**: Cadastro e listagem de itens à venda.
- **Contatos**: Gestão de leads e clientes.
- **Pipeline**: Visualização Kanban do status das negociações.
- **Relatórios**: Métricas de vendas e comissões.
- **WhatsApp**: Geração automática de fichas de venda para envio.
