# 📋 Requisitos do Projeto - Bolso Simples

Este documento descreve os requisitos funcionais e não-funcionais do sistema **Bolso Simples**.

## 1. Requisitos Funcionais (RF)

### 1.1 Autenticação e Usuários
- **RF01**: O sistema deve permitir login via Google Authentication.
- **RF02**: O sistema deve diferenciar usuários comuns de administradores.
- **RF03**: Administradores podem visualizar a lista de usuários cadastrados.

### 1.2 Gestão de Transações
- **RF04**: O usuário deve poder visualizar suas transações em uma lista.
- **RF05**: O usuário deve poder excluir transações individuais.
- **RF06**: O sistema deve calcular automaticamente o saldo total, receitas e despesas do mês selecionado.

### 1.3 Inteligência Artificial e Importação
- **RF07**: O sistema deve permitir o upload de extratos bancários (imagens ou PDF).
- **RF08**: O sistema deve utilizar a IA Gemini para extrair dados (data, valor, descrição) dos arquivos enviados.
- **RF09**: O sistema deve permitir a revisão dos dados extraídos antes de salvá-los no banco de dados.
- **RF10**: O sistema deve listar os arquivos já importados e permitir a exclusão do arquivo junto com todas as transações vinculadas a ele.

### 1.4 Regras de Categorização
- **RF11**: O usuário deve poder criar regras de categorização baseadas em palavras-chave.
- **RF12**: Ao importar transações, o sistema deve aplicar as regras cadastradas para definir as categorias automaticamente.

### 1.5 Simulação Financeira
- **RF13**: O sistema deve oferecer um simulador de parcelas.
- **RF14**: O usuário deve poder salvar simulações para visualização posterior no dashboard.

## 2. Requisitos Não-Funcionais (RNF)

- **RNF01**: A interface deve ser responsiva (funcionar em desktop e mobile).
- **RNF02**: O tempo de resposta da IA para extração não deve ser impeditivo para a experiência do usuário.
- **RNF03**: Os dados sensíveis (transações) devem ser protegidos por regras de segurança no Firestore (RLS).
- **RNF04**: O sistema deve ser desenvolvido utilizando Clean Architecture para facilitar a manutenção.
- **RNF05**: O estado da aplicação deve ser persistido em tempo real utilizando Firebase.

## 3. Regras de Negócio (RN)

- **RN01**: Transações de despesa devem sempre ter valor negativo no banco de dados.
- **RN02**: Transações de receita devem sempre ter valor positivo no banco de dados.
- **RN03**: Um usuário não pode visualizar as transações de outro usuário, a menos que seja um administrador com permissões explícitas (não implementado nesta versão base).
