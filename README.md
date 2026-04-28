# 💰 Bolso Simples

O **Bolso Simples** é um gerenciador financeiro inteligente projetado para simplificar o controle de gastos e receitas. Com o poder da Inteligência Artificial (Gemini), o aplicativo permite que você importe seus extratos bancários e organize suas finanças de forma automática e visual.

## 🚀 Funcionalidades Principais

- **Dashboard Inteligente**: Visualize seu saldo, receitas, despesas e fluxo mensal com gráficos interativos.
- **Extração por IA**: Importe arquivos de extrato (PDF/Imagens) e deixe a IA extrair automaticamente as transações, datas e valores.
- **Categorização Automática**: Crie regras baseadas em palavras-chave para categorizar seus gastos automaticamente conforme são importados.
- **Simulador de Parcelas**: Calcule o impacto de compras parceladas no seu orçamento futuro.
- **Gestão de Importações**: Acompanhe os arquivos que você já enviou e gerencie os dados importados.
- **Área Administrativa**: Controle de usuários e permissões para administradores.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18+ com TypeScript
- **Estilização**: Tailwind CSS & Lucide Icons
- **Animações**: Motion (Framer Motion)
- **Gráficos**: Recharts
- **IA**: Google Gemini Pro & Flash
- **Banco de Dados & Auth**: PostgreSQL via Supabase

## 🏗️ Arquitetura

O projeto utiliza **Clean Architecture**, organizado em camadas:
- **Domain**: Entidades de negócio e interfaces de repositório.
- **Application**: Casos de uso e lógica de serviços.
- **Interface Adapters**: Hooks do React e lógica de interface.
- **Infrastructure**: Implementações de persistência com Supabase.

## 📦 Como Instalar e Rodar

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:
   - `GEMINI_API_KEY`: Sua chave da API do Google AI Studio.
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase.
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🔐 Segurança

O aplicativo utiliza Firebase Rules para garantir que cada usuário tenha acesso apenas aos seus próprios dados de transações e regras. A extração por IA é realizada de forma segura utilizando as melhores práticas do SDK do Google Generative AI.
