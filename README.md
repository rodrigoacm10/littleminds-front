# Little Minds

> Plataforma digital de apoio parental voltada ao desenvolvimento da inteligencia emocional infantil, combinando conteudo especializado, comunidade e inteligencia artificial em uma experiencia acessivel e orientada a impacto social.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-5FA04E?logo=nodedotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-API-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/IA-Google_Gemini-4285F4?logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=black)

## Sumario

- [Contexto e Funcionamento](#contexto-e-funcionamento)
- [Acesso Rapido](#acesso-rapido)
- [Credenciais de Teste](#credenciais-de-teste)
- [Funcionalidades](#funcionalidades)
- [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
- [Evolucao de Codigo e Qualidade](#evolucao-de-codigo-e-qualidade)
- [Como Executar Localmente](#como-executar-localmente)
- [Equipe Desenvolvedora](#equipe-desenvolvedora)

## Contexto e Funcionamento

### Problema

O projeto surgiu a partir da seguinte questao: como a tecnologia pode contribuir, de forma pratica e acessivel, para a educacao emocional das criancas dentro do ambiente familiar?

Durante a idealizacao, foi identificado que muitos pais e responsaveis enfrentam dificuldades para compreender, estimular e acompanhar o desenvolvimento emocional dos filhos. Apesar da relevancia desse tema, ainda existe uma carencia de plataformas acessiveis, centralizadas e orientadas a apoio continuo nessa jornada.

### Solucao Proposta

O **Little Minds** e uma plataforma educacional e de apoio parental criada para orientar pais e responsaveis no desenvolvimento da inteligencia emocional infantil desde os primeiros estagios da vida.

Mais do que oferecer informacao isolada, a proposta do sistema e reunir **conhecimento especializado**, **troca de experiencias reais** e **suporte assistido por inteligencia artificial** em um unico ambiente digital.

### Como o Sistema Funciona

Ao se cadastrar na plataforma, o usuario passa a ter acesso a tres pilares principais:

| Pilar | Descricao | Valor gerado |
| --- | --- | --- |
| **Conteudo** | Catalogo de artigos especializados para leitura e aprofundamento. | Apoia o aprendizado estruturado sobre desenvolvimento emocional infantil. |
| **Comunidade** | Espaco de interacao entre pais e responsaveis, com publicacoes, curtidas e comentarios. | Incentiva suporte mutuo, empatia e compartilhamento de vivencias. |
| **Rede de Apoio com IA** | Chat inteligente integrado ao Google Gemini, com historico de conversas salvo. | Traduz conceitos tecnicos em orientacoes praticas para o cotidiano familiar. |

Essa estrutura permite que a plataforma atue tanto no **apoio preventivo** quanto no **apoio situacional**, ajudando os usuarios a aprender, trocar experiencias e tomar decisoes mais conscientes no dia a dia.

## Acesso Rapido

| Recurso | Link |
| --- | --- |
| Frontend em producao | https://littleminds-front.vercel.app |
| Backend em producao | https://littleminds.onrender.com |
| Repositorio do frontend | https://github.com/rodrigoacm10/littleminds-front |
| Repositorio do backend | https://github.com/rodrigoacm10/littleminds |
| Prototipo no Figma | **[Adicionar link do Figma aqui]** |

## Credenciais de Teste

Para fins de avaliacao, a banca pode utilizar as seguintes credenciais:

| Perfil | Email | Senha |
| --- | --- | --- |
| Usuario padrao | `teste@gmail.com` | `Teste1234` |
| Especialista | `testeespecialista@gmail.com` | `Teste1234` |

> **Atencao sobre infraestrutura:** o backend esta hospedado na camada gratuita do Render. Em periodos de inatividade, o servidor pode entrar em hibernacao e a primeira requisicao pode levar entre **50 segundos e 1 minuto** para responder. Esse comportamento e esperado e nao representa falha da aplicacao.

## Funcionalidades

### Requisitos Funcionais

- Cadastro de usuarios com fluxo de autenticacao.
- Login com validacao de credenciais.
- Leitura de artigos e navegacao por catalogo de conteudos.
- Publicacao de experiencias no forum da comunidade.
- Interacao social por meio de curtidas e comentarios.
- Chatbot com IA integrado ao Google Gemini.
- Persistencia do historico de conversas com a IA.
- Consumo de dados protegidos por autenticacao via token JWT.

### Requisitos Nao Funcionais

- Senhas protegidas por hash no backend.
- Rotas protegidas com autenticacao e autorizacao.
- Arquitetura separada entre frontend, backend e banco de dados.
- Interface web moderna, responsiva e orientada a usabilidade.
- Disponibilizacao em nuvem para acesso publico.
- Suporte a testes automatizados para estabilidade funcional.

## Arquitetura e Tecnologias

### Visao Geral da Arquitetura

O Little Minds foi concebido com arquitetura distribuida, separando responsabilidades entre interface, servicos de negocio, persistencia de dados e camada de inteligencia artificial.

```text
Usuario
  |
  v
Frontend (React + Vite, deploy na Vercel)
  |
  v
Backend API (Node.js + NestJS, deploy no Render)
  |
  +--> PostgreSQL (Neon DB)
  |
  +--> Integracao com Google Gemini
```

### Stack Tecnologica

| Camada | Tecnologia | Finalidade |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript + Tailwind CSS | Interface da aplicacao e experiencia do usuario |
| Backend | Node.js + NestJS | Regras de negocio, autenticacao, API REST e integracoes |
| Banco de Dados | PostgreSQL no Neon DB | Persistencia de usuarios, conteudos, posts, comentarios e historicos |
| IA | Google Gemini | Suporte conversacional contextualizado |
| Deploy Frontend | Vercel | Hospedagem da interface web |
| Deploy Backend | Render | Hospedagem da API |
| Documentacao da API | Swagger | Documentacao e exploracao dos endpoints |
| Prototipacao | Figma | Prototipacao do MVP e validacao de fluxo |
| Gestao | Trello com Kanban | Organizacao do backlog e acompanhamento do time |

### Estrutura de Solucao

- **Frontend:** aplicacao SPA desenvolvida em React com Vite, conectada a API por meio da variavel `VITE_API_URL`.
- **Backend:** API desacoplada em NestJS, responsavel por autenticacao, regras de negocio, comunidade, conteudos e integracao com IA.
- **Persistencia:** PostgreSQL hospedado no Neon DB, escolhido pelo bom custo-beneficio e facilidade de operacao.
- **IA aplicada:** Google Gemini utilizado para oferecer respostas mais naturais, acessiveis e alinhadas ao contexto do usuario.

## Evolucao de Codigo e Qualidade

### Processo de Desenvolvimento

O desenvolvimento do projeto seguiu praticas alinhadas a ambientes profissionais de engenharia de software:

- Uso de **Conventional Commits** para padronizacao do historico de alteracoes.
- Trabalho em **branches separadas por funcionalidade ou correcao**.
- Integracao das mudancas por meio de **Pull Requests (PRs)**.
- Organizacao do fluxo de trabalho com **Kanban no Trello**.
- Validacao visual e funcional do produto com prototipacao previa no **Figma**.

### Qualidade Tecnica

Para ampliar a confiabilidade da aplicacao, foram adotadas praticas de verificacao em diferentes niveis:

| Tipo de validacao | Objetivo |
| --- | --- |
| Testes unitarios | Verificar comportamentos isolados de funcoes, componentes e regras de validacao |
| Testes de integracao | Garantir a comunicacao correta entre modulos, paginas e fluxos de autenticacao |
| Testes E2E | Simular o uso real da aplicacao e validar jornadas criticas ponta a ponta |
| Swagger | Documentar os endpoints da API de forma padronizada e auditavel |

### Evidencias Presentes Neste Frontend

Este repositorio possui scripts e estrutura de testes que sustentam a qualidade do software:

```bash
npm run test
npm run test:coverage
npm run test:e2e
```

Arquivos de exemplo incluidos neste frontend:

- Testes unitarios com Vitest.
- Testes de integracao para paginas e hooks.
- Testes end-to-end com Playwright.
- Relatorios de cobertura gerados em `coverage/`.

## Como Executar Localmente

### Pre-requisitos

- Node.js instalado
- npm instalado
- Git instalado

### 1. Clonar o repositorio

```bash
git clone https://github.com/rodrigoacm10/littleminds-front.git
cd littleminds-front
```

### 2. Instalar as dependencias

```bash
npm install
```

### 3. Configurar variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto com a URL da API:

```env
VITE_API_URL=https://littleminds.onrender.com
```

Se desejar executar o frontend apontando para uma API local, basta substituir o valor de `VITE_API_URL` pela URL correspondente ao backend em execucao.

### 4. Iniciar o ambiente de desenvolvimento

```bash
npm run dev
```

Por padrao, o Vite disponibilizara a aplicacao localmente em uma URL semelhante a:

```text
http://localhost:5173
```

### 5. Build de producao

```bash
npm run build
npm run preview
```

### 6. Executar testes

```bash
# testes unitarios e de integracao
npm run test

# cobertura de testes
npm run test:coverage

# testes end-to-end
npm run test:e2e
```

## Equipe Desenvolvedora

Projeto academico desenvolvido em equipe, com colaboracao multidisciplinar entre design, desenvolvimento e validacao.

| Integrante | Papel/Responsabilidade |
| --- | --- |
| [Nome 1] | [Ex.: Product Owner / Full Stack Developer] |
| [Nome 2] | [Ex.: Frontend Developer] |
| [Nome 3] | [Ex.: Backend Developer] |
| [Nome 4] | [Ex.: UX/UI Designer] |
| [Nome 5] | [Ex.: QA / Documentacao] |
| [Nome 6] | [Opcional] |
| [Nome 7] | [Opcional] |
| [Nome 8] | [Opcional] |

## Consideracoes Finais

O **Little Minds** representa a aplicacao de engenharia de software em um contexto de alto impacto social. A plataforma foi concebida para oferecer suporte concreto a familias, promovendo educacao emocional infantil com base em conteudo, interacao comunitaria e inteligencia artificial.

Do ponto de vista tecnico, o projeto demonstra preocupacao com **arquitetura**, **qualidade de codigo**, **testabilidade**, **documentacao**, **boas praticas de versionamento** e **deploy em nuvem**, atendendo aos criterios esperados para avaliacao academica de um produto digital funcional.
