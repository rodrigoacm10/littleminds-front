# Little Minds

> Plataforma digital de apoio parental voltada ao desenvolvimento da inteligência emocional infantil, combinando conteúdo especializado, comunidade e inteligência artificial em uma experiência acessivel e orientada a impacto social.

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

## Sumário

- [Contexto e Funcionamento](#contexto-e-funcionamento)
- [Acesso Rápido](#acesso-rápido)
- [Credenciais de Teste](#credenciais-de-teste)
- [Funcionalidades](#funcionalidades)
- [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
- [Evolução de Código e Qualidade](#evolução-de-código-e-qualidade)
- [Como Executar Localmente](#como-executar-localmente)
- [Equipe Desenvolvedora](#equipe-desenvolvedora)

## Contexto e Funcionamento

### Problema

O projeto surgiu a partir da seguinte questão: como a tecnologia pode contribuir, de forma prática e acessível, para a educação emocional das criancas dentro do ambiente familiar?

Durante a idealização, foi identificado que muitos pais e responsáveis enfrentam dificuldades para compreender, estimular e acompanhar o desenvolvimento emocional dos filhos. Apesar da relevância desse tema, ainda existe uma carência de plataformas acessíveis, centralizadas e orientadas a apoio contínuo nessa jornada.

### Solução Proposta

O **Little Minds** e uma plataforma educacional e de apoio parental criada para orientar pais e responsáveis no desenvolvimento da inteligência emocional infantil desde os primeiros estágios da vida.

Mais do que oferecer informação isolada, a proposta do sistema e reunir **conhecimento especializado**, **troca de experiências reais** e **suporte assistido por inteligência artificial** em um único ambiente digital.

### Como o Sistema Funciona

Ao se cadastrar na plataforma, o usuário passa a ter acesso a três pilares principais:

| Pilar | Descrição | Valor gerado |
| --- | --- | --- |
| **Conteúdo** | Catálogo de artigos especializados para leitura e aprofundamento. | Apoia o aprendizado estruturado sobre desenvolvimento emocional infantil. |
| **Comunidade** | Espaço de interação entre pais e responsáveis, com publicações, curtidas e comentários. | Incentiva suporte mútuo, empatia e compartilhamento de vivências. |
| **Rede de Apoio com IA** | Chat inteligente integrado ao Google Gemini, com histórico de conversas salvo. | Traduz conceitos técnicos em orientações práticas para o cotidiano familiar. |

Essa estrutura permite que a plataforma atue tanto no **apoio preventivo** quanto no **apoio situacional**, ajudando os usuários a aprender, trocar experiências e tomar decisões mais conscientes no dia a dia.

## Acesso Rápido

| Recurso | Link |
| --- | --- |
| Frontend em produção | https://littleminds-front.vercel.app |
| Backend em produção | https://littleminds.onrender.com |
| Repositório do frontend | https://github.com/rodrigoacm10/littleminds-front |
| Repositório do backend | https://github.com/rodrigoacm10/littleminds |
| Protótipo no Figma | https://www.figma.com/design/01M2cwh6EzCQjLqCgjUhbT/Educa%C3%A7%C3%A3o-dom%C3%A9stica-para-crian%C3%A7as?node-id=0-1&t=X7zsM2eXJN2WxWyh-0 |

## Credenciais de Teste

Para fins de avaliação, a banca pode utilizar as seguintes credenciais:

| Perfil | Email | Senha |
| --- | --- | --- |
| Usuário Padrão | `teste@gmail.com` | `Teste1234` |
| Especialista | `testeespecialista@gmail.com` | `Teste1234` |

> **Atenção sobre infraestrutura:** o backend esta hospedado na camada gratuita do Render. Em períodos de inatividade, o servidor pode entrar em hibernação e a primeira requisição pode levar entre **50 segundos e 1 minuto** para responder. Esse comportamento e esperado e não representa falha da aplicação.

## Funcionalidades

### Requisitos Funcionais

- Cadastro de usuários com fluxo de autenticação.
- Login com validação de credenciais.
- Leitura de artigos e navegação por catálogo de conteúdos.
- Publicação de experiências no fórum da comunidade.
- Interação social por meio de curtidas e comentários.
- Chatbot com IA integrado ao Google Gemini.
- Persistência do histórico de conversas com a IA.
- Consumo de dados protegidos por autenticação via token JWT.

### Requisitos Não Funcionais

- Senhas protegidas por hash no backend.
- Rotas protegidas com autenticação e autorização.
- Arquitetura separada entre frontend, backend e banco de dados.
- Interface web moderna, responsiva e orientada a usabilidade.
- Disponibilização em nuvem para acesso público.
- Suporte a testes automatizados para estabilidade funcional.

## Arquitetura e Tecnologias

### Visão Geral da Arquitetura

O Little Minds foi concebido com arquitetura distribuída, separando responsabilidades entre interface, serviços de negócio, persistência de dados e camada de inteligência artificial.

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

### Stack Tecnológica

| Camada | Tecnologia | Finalidade |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript + Tailwind CSS | Interface da aplicação e experiência do usuário |
| Backend | Node.js + NestJS | Regras de negócio, autenticação, API REST e integrações |
| Banco de Dados | PostgreSQL no Neon DB | Persistência de usuários, conteúdos, posts, comentários e históricos |
| IA | Google Gemini | Suporte conversacional contextualizado |
| Deploy Frontend | Vercel | Hospedagem da interface web |
| Deploy Backend | Render | Hospedagem da API |
| Documentação da API | Swagger | Documentação e exploração dos endpoints |
| Prototipação | Figma | Prototipação do MVP e validação de fluxo |
| Gestão | Trello com Kanban | Organização do backlog e acompanhamento do time |

### Estrutura de Solução

- **Frontend:** aplicacao SPA desenvolvida em React com Vite, conectada a API por meio da variavel `VITE_API_URL`.
- **Backend:** API desacoplada em NestJS, responsavel por autenticacao, regras de negocio, comunidade, conteudos e integracao com IA.
- **Persistencia:** PostgreSQL hospedado no Neon DB, escolhido pelo bom custo-beneficio e facilidade de operacao.
- **IA aplicada:** Google Gemini utilizado para oferecer respostas mais naturais, acessiveis e alinhadas ao contexto do usuario.

## Evolução de Código e Qualidade

### Processo de Desenvolvimento

O desenvolvimento do projeto seguiu práticas alinhadas a ambientes profissionais de engenharia de software:

- Uso de **Conventional Commits** para padronizacao do historico de alterações.
- Trabalho em **branches separadas por funcionalidade ou correção**.
- Integração das mudancas por meio de **Pull Requests (PRs)**.
- Organização do fluxo de trabalho com **Kanban no Trello**.
- Validação visual e funcional do produto com prototipação prévia no **Figma**.

### Qualidade Técnica

Para ampliar a confiabilidade da aplicação, foram adotadas práticas de verificação em diferentes níveis:

| Tipo de validação | Objetivo |
| --- | --- |
| Testes unitários | Verificar comportamentos isolados de funções, componentes e regras de validação |
| Testes de integração | Garantir a comunicação correta entre módulos, páginas e fluxos de autenticação |
| Testes E2E | Simular o uso real da aplicação e validar jornadas críticas ponta a ponta |
| Swagger | Documentar os endpoints da API de forma padronizada e auditável |

### Evidências Presentes Neste Frontend

Este repositório possui scripts e estrutura de testes que sustentam a qualidade do software:

```bash
npm run test
npm run test:coverage
npm run test:e2e
```

Arquivos de exemplo incluídos neste frontend:

- Testes unitários com Vitest.
- Testes de integração para páginas e hooks.
- Testes end-to-end com Playwright.
- Relatórios de cobertura gerados em `coverage/`.

## Como Executar Localmente

### Pré-requisitos

- Node.js instalado
- npm instalado
- Git instalado

### 1. Clonar o repositório

```bash
git clone https://github.com/rodrigoacm10/littleminds-front.git
cd littleminds-front
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com a URL da API:

```env
VITE_API_URL=https://littleminds.onrender.com
```

Se desejar executar o frontend apontando para uma API local, basta substituir o valor de `VITE_API_URL` pela URL correspondente ao backend em execução.

### 4. Iniciar o ambiente de desenvolvimento

```bash
npm run dev
```

Por padrão, o Vite disponibilizará a aplicação localmente em uma URL semelhante a:

```text
http://localhost:5173
```

### 5. Build de produção

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

Projeto acadêmico desenvolvido em equipe, com colaboração multidisciplinar entre design, desenvolvimento e validação.

| Integrante | Papel/Responsabilidade |
| --- | --- |
| Carlos Alberto Ramalho Bezerra Neto | Product Owner |
| Diego Henrique Rodrigues | Desenvolvedor FrontEnd |
| Eliel Lucas Trajano Neto | Desenvolvedor BackEnd |
| Fabianne Arezes de Oliveira Firmino Cabral | Desenvolvedora FrontEnd |
| José Gabriel de Oliveira Lino | QA / Testes |
| Monique Rafaela Carvalho Lopes | UX/UI Designer |
| Rafael Antônio Ribeiro Galvão Mendes | QA / Testes |
| Rodrigo Andrade Cavalcante Muniz | Desenvolvedor Full Stack / Documentação |

## Considerações Finais

O **Little Minds** representa a aplicação de engenharia de software em um contexto de alto impacto social. A plataforma foi concebida para oferecer suporte concreto a famílias, promovendo educação emocional infantil com base em conteúdo, interação comunitária e inteligência artificial.

Do ponto de vista técnico, o projeto demonstra preocupação com **arquitetura**, **qualidade de código**, **testabilidade**, **documentação**, **boas práticas de versionamento** e **deploy em nuvem**, atendendo aos critérios esperados para avaliação acadêmica de um produto digital funcional.
