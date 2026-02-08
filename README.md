# Simples Bolso - Documentação do Projeto

**Versão:** 1.2.0  
**Data da última atualização:** 24/05/2024

## 1. Visão Geral
O **Simples Bolso** é uma plataforma moderna e inteligente para gestão financeira pessoal. Utilizando Inteligência Artificial (Gemini), o sistema transforma faturas de cartão e extratos bancários (PDF) em dados estruturados, permitindo visualização de dashboards, categorização automática e previsões financeiras.

---

## 2. Banco de Dados e Persistência

### 2.1 Funcionamento Atual (Frontend-Only)
Como esta versão roda inteiramente no navegador (Client-Side), a persistência dos dados é realizada através do **LocalStorage** do navegador.
*   **Isolamento:** Cada usuário de teste (Lucas, Brenno, Lais) possui uma chave única de armazenamento.
*   **Persistência:** Ao fazer upload de um arquivo, os dados são salvos automaticamente. Ao trocar de usuário no menu superior e voltar para o anterior, os dados permanecem salvos (desde que o cache do navegador não seja limpo).
*   **Chaves:** `simples_bolso_db_lucas`, `simples_bolso_db_brenno`, etc.

### 2.2 Arquitetura Recomendada (Produção)
Para um ambiente de produção real, a arquitetura deve evoluir para:
*   **Banco de Dados:** PostgreSQL (via Supabase).
*   **Estrutura de Tabelas:**
    *   `users` (id, email, role, created_at)
    *   `transactions` (id, user_id, amount, date, description, category, type)
    *   `recurring_expenses` (id, user_id, description, avg_amount)
*   **Segurança:** Implementação de RLS (Row Level Security) para garantir que usuários acessem apenas seus próprios dados (exceto Admins).

---

## 3. Requisitos do Sistema

### 3.1 Funcionalidades Principais
1.  **Extração de Dados (PDF):**
    *   Upload intuitivo ("Drag & Drop").
    *   IA normaliza datas, limpa descrições e categoriza gastos.
2.  **Visualização:**
    *   Gráficos interativos (Pizza e Barras).
    *   Tabelas limpas com indicadores visuais de entrada/saída.
3.  **Módulos Premium:**
    *   **Previsão Inteligente:** Projeta gastos do próximo mês baseando-se em assinaturas e recorrências.
    *   **Dashboard Completo:** Análise de fluxo de caixa.

### 3.2 Regras de Acesso (RBAC)

| Usuário | Perfil | Permissões |
| :--- | :--- | :--- |
| **Lucas** | Free | Apenas Upload e Download CSV. Sem persistência visual de gráficos. |
| **Brenno** | Pago | Acesso completo (Dashboard, Previsão, Persistência). |
| **Lais** | Admin | Acesso completo + Gestão de Usuários. **Única que pode ver lista de outros usuários.** |
| **Luisa** | Convidado | Visualiza os dados da conta "Brenno", mas não pode editar configurações ou salvar novos uploads. |

---

## 4. Manual do Usuário

### 4.1 Navegação
A interface foi atualizada para ser mais limpa e moderna.
*   **Menu Superior:** Navegue entre as funcionalidades (Arquivos, Visão Geral, Previsões).
*   **Seletor de Usuário:** Localizado no canto superior direito para testes rápidos.

### 4.2 Fluxo de Uso
1.  **Login:** Selecione o usuário desejado no topo.
2.  **Upload:** Na aba "Arquivos", arraste seu PDF. A IA processará em segundos.
3.  **Análise:** Os dados são salvos automaticamente. Navegue para "Visão Geral" para ver para onde seu dinheiro está indo.
4.  **Exportação:** Em qualquer tela de tabela, clique em "Exportar CSV" para levar seus dados para o Excel.

---

## 5. Stack Tecnológico
*   **Frontend:** React 19, Tailwind CSS (Design System Moderno).
*   **Ícones:** Lucide React.
*   **Gráficos:** Recharts.
*   **AI:** Google Gemini 2.5 Flash.
*   **Persistência:** LocalStorage API (Simulação DB).
