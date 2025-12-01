# Documentação de Requisitos - Resolve Aí

## Índice

1. [Introdução](#1-introdução)
2. [Glossário](#2-glossário)
3. [Requisitos Funcionais](#3-requisitos-funcionais)
4. [Requisitos Não Funcionais](#4-requisitos-não-funcionais)
5. [Regras de Negócio](#5-regras-de-negócio)
6. [Casos de Uso](#6-casos-de-uso)
7. [Matriz de Permissões](#7-matriz-de-permissões)
8. [Validações de Dados](#8-validações-de-dados)
9. [Endpoints da API](#9-endpoints-da-api)

---

## 1. Introdução

### 1.1 Visão Geral

O **Resolve Aí** é uma plataforma para relatos de problemas urbanos que permite aos cidadãos reportar e acompanhar questões como buracos, iluminação, segurança, meio ambiente e outros problemas em suas comunidades.

### 1.2 Propósito

Este documento especifica os requisitos funcionais e não funcionais do sistema backend, servindo como referência para desenvolvimento, testes e manutenção.

### 1.3 Escopo

O sistema contempla:
- Gestão de usuários (comuns e administradores)
- Gestão de relatos de problemas urbanos
- Workflow de aprovação de relatos
- Categorização de problemas
- Busca e filtros avançados

---

## 2. Glossário

### 2.1 Termos de Domínio

| Termo | Definição |
|-------|-----------|
| **Relato** | Registro de um problema urbano criado por um usuário |
| **Organizador** | Usuário que criou um relato específico |
| **Categoria** | Classificação do tipo de problema (ex: Infraestrutura, Segurança) |
| **Aprovação** | Processo de validação de relatos por administradores |

### 2.2 Roles (Papéis)

| Role | Descrição |
|------|-----------|
| **user** | Usuário comum que pode criar e gerenciar seus próprios relatos |
| **admin** | Administrador com permissões completas no sistema |

### 2.3 Status de Relato

| Status | Descrição |
|--------|-----------|
| **active** | Relato ativo e visível publicamente |
| **inactive** | Relato inativo (pendente de aprovação ou desativado) |
| **canceled** | Relato cancelado pelo organizador |
| **finished** | Problema resolvido |

### 2.4 Status de Aprovação

| Status | Descrição |
|--------|-----------|
| **pending** | Aguardando aprovação de um administrador |
| **approved** | Aprovado por um administrador |
| **rejected** | Rejeitado (com motivo obrigatório) |

---

## 3. Requisitos Funcionais

### 3.1 Autenticação (RF-AUTH)

#### RF-AUTH-001: Registro de Usuário
**Prioridade:** Essencial

O sistema deve permitir o registro de novos usuários com:
- Nome (obrigatório, 2-100 caracteres)
- Email (obrigatório, único, formato válido)
- Senha (obrigatório, mín. 6 caracteres, deve conter letra, número e caractere especial)
- Telefone (opcional, formato válido)
- Bio (opcional, máx. 500 caracteres)

**Regras:**
- Email duplicado retorna erro 400
- Senha é armazenada com hash bcrypt
- Retorna tokens de acesso e refresh

---

#### RF-AUTH-002: Login
**Prioridade:** Essencial

O sistema deve autenticar usuários via email e senha.

**Regras:**
- Credenciais inválidas retornam erro 401
- Atualiza campo `lastLogin` do usuário
- Retorna tokens de acesso e refresh
- Rate limiting: 25 tentativas por 15 minutos

---

#### RF-AUTH-003: Refresh Token
**Prioridade:** Essencial

O sistema deve renovar tokens de acesso expirados via refresh token.

**Regras:**
- Refresh token inválido/expirado retorna erro 401
- Gera novos tokens de acesso e refresh
- Refresh token tem validade de 7 dias (configurável)

---

#### RF-AUTH-004: Perfil do Usuário
**Prioridade:** Essencial

O sistema deve retornar os dados do usuário autenticado.

**Regras:**
- Requer autenticação (Bearer token)
- Não retorna o campo senha
- Token inválido/expirado retorna erro 401

---

#### RF-AUTH-005: Alteração de Senha
**Prioridade:** Importante

O sistema deve permitir alteração de senha do usuário autenticado.

**Regras:**
- Requer senha atual correta
- Nova senha deve atender critérios de validação
- Senha atual incorreta retorna erro 401

---

#### RF-AUTH-006: Atualização de Perfil
**Prioridade:** Importante

O sistema deve permitir atualização de dados do perfil.

**Campos atualizáveis:** nome, telefone, bio

**Regras:**
- Requer autenticação
- Valida constraints de cada campo

---

### 3.2 Gestão de Relatos (RF-REP)

#### RF-REP-001: Criar Relato
**Prioridade:** Essencial

O sistema deve permitir criação de relatos de problemas urbanos.

**Campos obrigatórios:**
- Título (3-100 caracteres)
- Descrição (mín. 10 caracteres)
- Data do problema
- Localização (endereço, cidade, estado)
- Categoria (deve existir e estar ativa)

**Campos opcionais:**
- URL da imagem (formato URL válido)
- Tags (máx. 10 tags, cada uma 3-30 caracteres)

**Regras:**
- Usuário comum: status=inactive, approvalStatus=pending
- Admin: auto-aprovado, status=active, approvalStatus=approved

---

#### RF-REP-002: Listar Relatos (Busca Pública)
**Prioridade:** Essencial

O sistema deve permitir busca de relatos aprovados e ativos.

**Filtros disponíveis:**
- Busca textual (título, descrição)
- Categoria(s)
- Status
- Período/intervalo de datas
- Localização (cidade, estado, país)
- Tags

**Ordenação:** data (asc/desc), recentes

**Paginação:** página e limite (padrão: 10 itens)

**Regras:**
- Público vê apenas: approvalStatus=approved AND status=active
- Retorna metadados de paginação e filtros aplicados

---

#### RF-REP-003: Visualizar Relato
**Prioridade:** Essencial

O sistema deve permitir visualização de detalhes de um relato.

**Regras:**
- Relatos aprovados: acesso público
- Relatos pendentes/rejeitados: apenas organizador ou admin

---

#### RF-REP-004: Editar Relato
**Prioridade:** Essencial

O sistema deve permitir edição de relatos existentes.

**Campos editáveis:** título, descrição, imageUrl, data, localização, categoria, tags

**Regras:**
- Apenas organizador ou admin pode editar
- Edição por usuário comum: reseta para pending/inactive
- Edição por admin: mantém approved/active
- Relatos cancelados não podem ser editados

---

#### RF-REP-005: Excluir Relato
**Prioridade:** Importante

O sistema deve permitir exclusão permanente de relatos.

**Regras:**
- Apenas organizador ou admin pode excluir
- Exclusão é permanente (hard delete)

---

#### RF-REP-006: Cancelar Relato
**Prioridade:** Importante

O sistema deve permitir cancelamento de relatos.

**Regras:**
- Apenas organizador ou admin pode cancelar
- Define status=canceled
- Relato já cancelado retorna erro 400

---

#### RF-REP-007: Meus Relatos
**Prioridade:** Essencial

O sistema deve listar relatos do usuário autenticado.

**Filtros:** status, approvalStatus

**Retorna:**
- Lista de relatos do usuário
- Contadores por status e approvalStatus
- Paginação

---

### 3.3 Workflow de Aprovação (RF-APR)

#### RF-APR-001: Listar Relatos Pendentes
**Prioridade:** Essencial

O sistema deve listar relatos aguardando aprovação.

**Regras:**
- Apenas admins têm acesso
- Retorna relatos com approvalStatus=pending
- Ordenados por data de criação (mais recentes primeiro)

---

#### RF-APR-002: Aprovar Relato
**Prioridade:** Essencial

O sistema deve permitir aprovação de relatos pendentes.

**Ações:**
- Define approvalStatus=approved
- Define status=active
- Registra approvedBy e approvalDate
- Limpa rejectionReason

**Regras:**
- Apenas admins podem aprovar
- Apenas relatos pending podem ser aprovados

---

#### RF-APR-003: Rejeitar Relato
**Prioridade:** Essencial

O sistema deve permitir rejeição de relatos pendentes.

**Ações:**
- Define approvalStatus=rejected
- Define status=inactive
- Registra approvedBy, approvalDate e rejectionReason

**Regras:**
- Apenas admins podem rejeitar
- Motivo de rejeição é obrigatório
- Apenas relatos pending podem ser rejeitados

---

#### RF-APR-004: Ativar/Desativar Relato
**Prioridade:** Importante

O sistema deve permitir ativação/desativação de relatos aprovados.

**Ativar:**
- Apenas relatos approved e não cancelados
- Define status=active

**Desativar:**
- Apenas relatos não cancelados
- Define status=inactive

**Regras:**
- Apenas admins podem ativar/desativar

---

### 3.4 Gestão de Categorias (RF-CAT)

#### RF-CAT-001: Listar Categorias
**Prioridade:** Essencial

O sistema deve listar categorias disponíveis.

**Regras:**
- Público/usuário: apenas categorias ativas
- Admin: todas as categorias
- Ordenadas por nome

---

#### RF-CAT-002: Criar Categoria
**Prioridade:** Essencial

O sistema deve permitir criação de categorias.

**Campos:**
- Nome (obrigatório, único, 2-50 caracteres)
- Descrição (opcional, máx. 200 caracteres)
- Ativo (padrão: true)

**Regras:**
- Apenas admins podem criar
- Nome duplicado retorna erro 400

---

#### RF-CAT-003: Editar Categoria
**Prioridade:** Importante

O sistema deve permitir edição de categorias.

**Regras:**
- Apenas admins podem editar
- Nome deve permanecer único

---

#### RF-CAT-004: Excluir Categoria
**Prioridade:** Importante

O sistema deve permitir exclusão de categorias.

**Regras:**
- Apenas admins podem excluir
- Categorias com relatos associados não podem ser excluídas

---

### 3.5 Gestão de Usuários (RF-USR)

#### RF-USR-001: Listar Usuários
**Prioridade:** Importante

O sistema deve listar usuários cadastrados.

**Filtros:** role, busca por nome/email

**Regras:**
- Apenas admins têm acesso
- Senha nunca é retornada

---

#### RF-USR-002: Visualizar Usuário
**Prioridade:** Importante

O sistema deve retornar detalhes de um usuário.

**Regras:**
- Apenas admins têm acesso
- Senha nunca é retornada

---

#### RF-USR-003: Editar Usuário
**Prioridade:** Importante

O sistema deve permitir edição de usuários.

**Campos editáveis:** nome, email, role, telefone, bio

**Regras:**
- Apenas admins podem editar
- Email deve permanecer único
- Role deve ser 'user' ou 'admin'

---

#### RF-USR-004: Excluir Usuário
**Prioridade:** Importante

O sistema deve permitir exclusão de usuários.

**Regras:**
- Apenas admins podem excluir
- Usuários com relatos ativos não podem ser excluídos

---

## 4. Requisitos Não Funcionais

### 4.1 Segurança (RNF-SEC)

#### RNF-SEC-001: Autenticação JWT
**Prioridade:** Essencial

- Tokens JWT para autenticação de endpoints protegidos
- Access token: expiração configurável (padrão 24h)
- Refresh token: expiração configurável (padrão 7d)
- Validação de audience e issuer

---

#### RNF-SEC-002: Hash de Senhas
**Prioridade:** Essencial

- Senhas armazenadas com hash bcrypt
- Salt rounds: 10
- Senhas nunca expostas em respostas da API

---

#### RNF-SEC-003: Rate Limiting
**Prioridade:** Essencial

- Login: 25 tentativas por 15 minutos por IP
- API geral: 100 requisições por minuto por IP
- Headers padrão de rate limit nas respostas

---

#### RNF-SEC-004: Sanitização de Dados
**Prioridade:** Essencial

- Proteção contra MongoDB injection
- Caracteres especiais ($ e .) substituídos
- Aplicado globalmente a todas as requisições

---

#### RNF-SEC-005: CORS
**Prioridade:** Essencial

- Origins permitidas: localhost:5173, FRONTEND_URL (env)
- Credentials habilitados
- Métodos: GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS

---

### 4.2 Performance (RNF-PERF)

#### RNF-PERF-001: Paginação
**Prioridade:** Essencial

- Padrão: 10 itens por página
- Retorna metadados: page, pages, total
- Suporta parâmetros page e limit

---

#### RNF-PERF-002: Índices de Banco
**Prioridade:** Importante

Índices configurados para:
- Reports: date, category, status, approvalStatus, organizer, location.*, tags
- Users: email (unique), role
- Categories: name (unique)
- Full-text: title, description, location.address

---

#### RNF-PERF-003: Busca Textual
**Prioridade:** Importante

- Índice full-text para busca em título, descrição e endereço
- Score de relevância para ordenação
- Fallback para regex case-insensitive

---

### 4.3 Usabilidade (RNF-USA)

#### RNF-USA-001: Mensagens em Português
**Prioridade:** Importante

- Mensagens de erro em português brasileiro
- Validações com descrições claras

---

#### RNF-USA-002: Respostas Padronizadas
**Prioridade:** Importante

**Sucesso:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erro:**
```json
{
  "message": "Descrição do erro",
  "statusCode": 400
}
```

---

#### RNF-USA-003: Códigos HTTP
**Prioridade:** Essencial

| Código | Uso |
|--------|-----|
| 200 | Sucesso |
| 201 | Criação bem-sucedida |
| 400 | Erro de validação |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Recurso não encontrado |
| 500 | Erro interno |

---

## 5. Regras de Negócio

### RN-001: Fluxo de Aprovação de Relatos

```
┌─────────────────────────────────────────────────────────────┐
│                    CRIAÇÃO DO RELATO                        │
├─────────────────────────────────────────────────────────────┤
│  Usuário Comum                 │  Administrador             │
│  └─> pending + inactive        │  └─> approved + active     │
│      (aguarda aprovação)       │      (auto-aprovado)       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   APROVAÇÃO (Admin)                         │
├─────────────────────────────────────────────────────────────┤
│  Aprovar                       │  Rejeitar                  │
│  └─> approved + active         │  └─> rejected + inactive   │
│      (visível ao público)      │      (motivo obrigatório)  │
└─────────────────────────────────────────────────────────────┘
```

---

### RN-002: Auto-Aprovação para Admins

Relatos criados por administradores são automaticamente:
- approvalStatus = approved
- status = active
- approvedBy = próprio admin
- approvalDate = data de criação

---

### RN-003: Permissões por Role

| Recurso | Público | User | Admin |
|---------|---------|------|-------|
| Ver relatos aprovados/ativos | ✅ | ✅ | ✅ |
| Ver próprios relatos | - | ✅ | ✅ |
| Ver todos os relatos | - | - | ✅ |
| Criar relato | - | ✅ | ✅ |
| Editar próprio relato | - | ✅ | ✅ |
| Editar qualquer relato | - | - | ✅ |
| Aprovar/Rejeitar relatos | - | - | ✅ |
| Gerenciar categorias | - | - | ✅ |
| Gerenciar usuários | - | - | ✅ |

---

### RN-004: Restrições de Exclusão

**Categorias:**
- Não podem ser excluídas se possuem relatos associados

**Usuários:**
- Não podem ser excluídos se possuem relatos com status=active

---

### RN-005: Transições de Status

```
┌─────────────────────────────────────────────────────────────┐
│                    STATUS DO RELATO                         │
├─────────────────────────────────────────────────────────────┤
│  inactive ──(aprovação)──> active                           │
│  active ──(desativação)──> inactive                         │
│  active ──(cancelamento)──> canceled                        │
│  inactive ──(cancelamento)──> canceled                      │
│  canceled ──(não permitido)──> qualquer                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Casos de Uso

### UC-001: Usuário Registra Conta

**Ator:** Visitante

**Fluxo:**
1. Visitante acessa endpoint de registro
2. Sistema valida dados informados
3. Sistema cria conta e retorna tokens

---

### UC-002: Usuário Cria Relato

**Ator:** Usuário autenticado

**Fluxo:**
1. Usuário envia dados do relato
2. Sistema valida campos e categoria
3. Sistema cria relato com status inicial
4. Se admin: auto-aprovado; Se user: aguarda aprovação

---

### UC-003: Admin Aprova Relato

**Ator:** Administrador

**Fluxo:**
1. Admin lista relatos pendentes
2. Admin seleciona relato para aprovar
3. Sistema atualiza status e ativa relato
4. Relato fica visível publicamente

---

### UC-004: Admin Rejeita Relato

**Ator:** Administrador

**Fluxo:**
1. Admin lista relatos pendentes
2. Admin seleciona relato para rejeitar
3. Admin informa motivo da rejeição
4. Sistema registra rejeição e mantém inativo

---

### UC-005: Usuário Busca Relatos

**Ator:** Qualquer usuário (autenticado ou não)

**Fluxo:**
1. Usuário acessa busca de relatos
2. Usuário aplica filtros desejados
3. Sistema retorna relatos aprovados/ativos
4. Sistema retorna metadados de paginação

---

## 7. Matriz de Permissões

| Endpoint | Método | Público | User | Admin |
|----------|--------|---------|------|-------|
| /api/auth/register | POST | ✅ | - | - |
| /api/auth/login | POST | ✅ | - | - |
| /api/auth/refresh-token | POST | ✅ | - | - |
| /api/auth/me | GET | - | ✅ | ✅ |
| /api/auth/password | PUT | - | ✅ | ✅ |
| /api/auth/profile | PUT | - | ✅ | ✅ |
| /api/reports | GET | ✅ | ✅ | ✅ |
| /api/reports | POST | - | ✅ | ✅ |
| /api/reports/:id | GET | ✅* | ✅ | ✅ |
| /api/reports/:id | PUT | - | ✅** | ✅ |
| /api/reports/:id | DELETE | - | ✅** | ✅ |
| /api/reports/:id/cancel | PUT | - | ✅** | ✅ |
| /api/reports/my-reports | GET | - | ✅ | ✅ |
| /api/reports/admin/all | GET | - | - | ✅ |
| /api/reports/:id/activate | PUT | - | - | ✅ |
| /api/reports/:id/deactivate | PUT | - | - | ✅ |
| /api/reports/approval/pending | GET | - | - | ✅ |
| /api/reports/:id/approve | PUT | - | - | ✅ |
| /api/reports/:id/reject | PUT | - | - | ✅ |
| /api/categories | GET | ✅*** | ✅*** | ✅ |
| /api/categories/:id | GET | ✅*** | ✅*** | ✅ |
| /api/categories | POST | - | - | ✅ |
| /api/categories/:id | PUT | - | - | ✅ |
| /api/categories/:id | DELETE | - | - | ✅ |
| /api/users | GET | - | - | ✅ |
| /api/users/:id | GET | - | - | ✅ |
| /api/users/:id | PUT | - | - | ✅ |
| /api/users/:id | DELETE | - | - | ✅ |

**Legenda:**
- ✅* = Apenas relatos aprovados/ativos
- ✅** = Apenas próprios relatos
- ✅*** = Apenas categorias ativas

---

## 8. Validações de Dados

### 8.1 Usuário

| Campo | Tipo | Obrigatório | Constraints |
|-------|------|-------------|-------------|
| name | String | Sim | 2-100 caracteres |
| email | String | Sim | Formato email, único |
| password | String | Sim | Mín. 6 chars, letra + número + especial |
| role | String | Não | Enum: user, admin (padrão: user) |
| phone | String | Não | Formato: `^\+?[\d\s-()]+$` |
| bio | String | Não | Máx. 500 caracteres |

### 8.2 Relato

| Campo | Tipo | Obrigatório | Constraints |
|-------|------|-------------|-------------|
| title | String | Sim | 3-100 caracteres |
| description | String | Sim | Mín. 10 caracteres |
| date | Date | Sim | Data válida |
| location.address | String | Sim | - |
| location.city | String | Sim | - |
| location.state | String | Sim | - |
| location.country | String | Não | Padrão: Brasil |
| category | ObjectId | Sim | Categoria existente e ativa |
| imageUrl | String | Não | Formato URL (http/https/ftp) |
| tags | [String] | Não | Máx. 10, cada 3-30 chars |
| status | String | Não | Enum: active, inactive, canceled, finished |
| approvalStatus | String | Não | Enum: pending, approved, rejected |

### 8.3 Categoria

| Campo | Tipo | Obrigatório | Constraints |
|-------|------|-------------|-------------|
| name | String | Sim | 2-50 caracteres, único |
| description | String | Não | Máx. 200 caracteres |
| active | Boolean | Não | Padrão: true |

---

## 9. Endpoints da API

### 9.1 Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/register | Registrar novo usuário |
| POST | /api/auth/login | Autenticar usuário |
| POST | /api/auth/refresh-token | Renovar token de acesso |
| GET | /api/auth/me | Obter usuário autenticado |
| PUT | /api/auth/password | Alterar senha |
| PUT | /api/auth/profile | Atualizar perfil |
| GET | /api/auth/force-logout | Forçar logout |

### 9.2 Relatos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/reports | Buscar relatos (público) |
| POST | /api/reports | Criar relato |
| GET | /api/reports/:id | Obter relato por ID |
| PUT | /api/reports/:id | Atualizar relato |
| DELETE | /api/reports/:id | Excluir relato |
| PUT | /api/reports/:id/cancel | Cancelar relato |
| GET | /api/reports/my-reports | Meus relatos |
| GET | /api/reports/admin/all | Todos os relatos (admin) |
| PUT | /api/reports/:id/activate | Ativar relato |
| PUT | /api/reports/:id/deactivate | Desativar relato |

### 9.3 Aprovação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/reports/approval/pending | Listar pendentes |
| PUT | /api/reports/:id/approve | Aprovar relato |
| PUT | /api/reports/:id/reject | Rejeitar relato |
| GET | /api/reports/:id/approval-status | Ver status de aprovação |

### 9.4 Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/categories | Listar categorias |
| GET | /api/categories/:id | Obter categoria |
| POST | /api/categories | Criar categoria |
| PUT | /api/categories/:id | Atualizar categoria |
| DELETE | /api/categories/:id | Excluir categoria |

### 9.5 Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/users | Listar usuários |
| GET | /api/users/:id | Obter usuário |
| PUT | /api/users/:id | Atualizar usuário |
| DELETE | /api/users/:id | Excluir usuário |

---

## Histórico de Revisões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2024-01 | Versão inicial da documentação |
