# Arquitetura do Sistema - Resolve Aí

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Arquitetura de Aplicação](#4-arquitetura-de-aplicação)
5. [Camada de Dados](#5-camada-de-dados)
6. [Segurança](#6-segurança)
7. [Tratamento de Erros](#7-tratamento-de-erros)
8. [Configuração](#8-configuração)
9. [Testes](#9-testes)
10. [Fluxos de Dados](#10-fluxos-de-dados)
11. [Considerações de Performance](#11-considerações-de-performance)

---

## 1. Visão Geral

### 1.1 Descrição do Sistema

O **Resolve Aí** é uma plataforma para relatos de problemas urbanos que permite aos cidadãos reportar e acompanhar questões como buracos, iluminação, segurança e meio ambiente em suas cidades.

### 1.2 Principais Funcionalidades

- **Autenticação**: Registro, login com JWT, refresh tokens
- **Gestão de Relatos**: CRUD completo com busca e filtros
- **Fluxo de Aprovação**: Sistema de moderação por administradores
- **Categorização**: Organização de relatos por categorias
- **Administração**: Gestão de usuários e categorias

### 1.3 Diagrama de Arquitetura de Alto Nível

```
+-------------------------------------------------------------------+
|                         CLIENTE                                    |
|                   (Frontend/Mobile App)                            |
+--------------------------------+----------------------------------+
                                 | HTTP/HTTPS
                                 v
+-------------------------------------------------------------------+
|                      API REST (Express.js)                         |
|  +---------------------------------------------------------------+ |
|  |                    MIDDLEWARE STACK                           | |
|  |  CORS -> JSON Parser -> Sanitize -> Rate Limit -> Routes      | |
|  +---------------------------------------------------------------+ |
|  +---------------------------------------------------------------+ |
|  |                       ROTAS                                   | |
|  |  /api/auth  |  /api/reports  |  /api/categories  | ...        | |
|  +---------------------------------------------------------------+ |
|  +---------------------------------------------------------------+ |
|  |                    CONTROLLERS                                | |
|  |  Lógica de negócio, validações, transformações                | |
|  +---------------------------------------------------------------+ |
|  +---------------------------------------------------------------+ |
|  |                      MODELS                                   | |
|  |  User  |  Report  |  Category  (Mongoose Schemas)             | |
|  +---------------------------------------------------------------+ |
+--------------------------------+----------------------------------+
                                 | Mongoose ODM
                                 v
+-------------------------------------------------------------------+
|                        MongoDB                                     |
|              (Banco de Dados NoSQL)                                |
+-------------------------------------------------------------------+
```

---

## 2. Stack Tecnológico

### 2.1 Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Node.js | 18+ | Runtime JavaScript |
| Express.js | ^4.21.1 | Framework web |
| Mongoose | ^8.8.2 | ODM para MongoDB |
| JWT | ^9.0.2 | Autenticação stateless |
| bcryptjs | ^2.4.3 | Hash de senhas |

### 2.2 Banco de Dados

| Tecnologia | Propósito |
|------------|-----------|
| MongoDB | Banco NoSQL para persistência |
| MongoDB Memory Server | Banco em memória para testes |

### 2.3 Segurança

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| express-rate-limit | ^7.5.0 | Limitação de requisições |
| express-mongo-sanitize | ^2.2.0 | Prevenção de NoSQL injection |
| cors | ^2.8.5 | Controle de origem cruzada |

### 2.4 Testes

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Jest | ^30.2.0 | Framework de testes |
| Supertest | ^7.1.4 | Testes de integração HTTP |

---

## 3. Estrutura do Projeto

```
backend/
|-- config/                    # Configurações
|   |-- db.js                  # Conexão MongoDB
|   +-- security.js            # Rate limiting, sanitização, validação de senha
|
|-- controllers/               # Lógica de negócio
|   |-- authController.js      # Autenticação (register, login, refresh)
|   |-- userController.js      # Gestão de usuários (admin)
|   |-- categoryController.js  # CRUD de categorias
|   |-- reportController.js    # CRUD de relatos
|   +-- reportApprovalController.js  # Aprovação/rejeição
|
|-- middlewares/               # Interceptadores
|   |-- authMiddleware.js      # Autenticação e autorização JWT
|   +-- errorMiddleware.js     # Tratamento global de erros
|
|-- models/                    # Schemas Mongoose
|   |-- User.js                # Modelo de usuário
|   |-- Report.js              # Modelo de relato
|   +-- Category.js            # Modelo de categoria
|
|-- routes/                    # Definição de rotas
|   |-- index.js               # Agregador de rotas
|   |-- authRoutes.js          # Rotas de autenticação
|   |-- userRoutes.js          # Rotas de usuários (admin)
|   |-- categoryRoutes.js      # Rotas de categorias
|   |-- reportRoutes.js        # Rotas de relatos
|   +-- reportApprovalRoutes.js # Rotas de aprovação
|
|-- utils/                     # Utilitários
|   |-- errorResponse.js       # Classe de erro customizada
|   +-- validation.js          # Funções de validação
|
|-- scripts/                   # Scripts auxiliares
|   +-- seedData.js            # População inicial do banco
|
|-- tests/                     # Suíte de testes
|   |-- setup/                 # Infraestrutura de testes
|   |   |-- testDb.js          # Configuração MongoDB Memory Server
|   |   |-- factories.js       # Factories para dados de teste
|   |   +-- helpers.js         # Funções auxiliares
|   |-- unit/                  # Testes unitários
|   |   |-- models/            # Testes de modelos
|   |   |-- middlewares/       # Testes de middlewares
|   |   +-- utils/             # Testes de utilitários
|   +-- integration/           # Testes de integração
|       |-- auth.test.js       # Fluxos de autenticação
|       |-- reports.test.js    # Operações de relatos
|       |-- approval.test.js   # Fluxo de aprovação
|       |-- categories.test.js # Gestão de categorias
|       +-- users.test.js      # Administração de usuários
|
|-- server.js                  # Ponto de entrada da aplicação
|-- jest.config.js             # Configuração do Jest
|-- jest.setup.js              # Setup global de testes
|-- package.json               # Dependências e scripts
+-- .env.example               # Template de variáveis de ambiente
```

### 3.1 Responsabilidades por Camada

| Camada | Responsabilidade |
|--------|------------------|
| **Routes** | Definição de endpoints, aplicação de middlewares |
| **Controllers** | Lógica de negócio, validações, transformações |
| **Models** | Schemas, validações de dados, métodos de instância |
| **Middlewares** | Interceptação, autenticação, tratamento de erros |
| **Config** | Configurações centralizadas, conexões |
| **Utils** | Funções reutilizáveis, helpers |

---

## 4. Arquitetura de Aplicação

### 4.1 Padrão MVC

O sistema segue o padrão **Model-View-Controller** adaptado para APIs REST:

```
+-------------+     +--------------+     +-------------+
|   Routes    |---->| Controllers  |---->|   Models    |
|   (View)    |     | (Controller) |     |   (Model)   |
+-------------+     +--------------+     +-------------+
       |                   |                    |
       |                   |                    |
       v                   v                    v
  Endpoints            Lógica de           Persistência
  HTTP REST            Negócio             MongoDB
```

### 4.2 Middleware Stack

A ordem de execução dos middlewares é crítica:

```
Requisição HTTP
       |
       v
+------------------+
|    CORS          |  <- Permite origens autorizadas
+--------+---------+
         |
         v
+------------------+
|  express.json()  |  <- Parse do body JSON
+--------+---------+
         |
         v
+------------------+
|    Sanitize      |  <- Remove caracteres de NoSQL injection
+--------+---------+
         |
         v
+------------------+
|  Rate Limiter    |  <- Limita requisições por IP
+--------+---------+
         |
         v
+------------------+
|     Routes       |  <- Roteamento para controllers
+--------+---------+
         |
         v
+------------------+
|  Error Handler   |  <- Tratamento centralizado de erros
+--------+---------+
         |
         v
    Resposta HTTP
```

### 4.3 Middlewares de Autenticação

```javascript
// Três níveis de autenticação disponíveis:

protect      // Requer autenticação válida
admin        // Requer autenticação + role 'admin'
optionalAuth // Tenta autenticar, continua mesmo sem token
```

**Fluxo do Middleware `protect`:**

```
Token Bearer
     |
     v
+----------------+     +----------------+
| Extrai token   |---->| Valida JWT     |
| do header      |     | (signature)    |
+----------------+     +-------+--------+
                               |
                               v
                       +----------------+
                       | Busca usuário  |
                       | no banco       |
                       +-------+--------+
                               |
                               v
                       +----------------+
                       | req.user =     |
                       | usuário        |
                       +----------------+
```

---

## 5. Camada de Dados

### 5.1 Visão Geral

O sistema utiliza **MongoDB** como banco de dados NoSQL, com **Mongoose** como ODM (Object Document Mapper).

### 5.2 Coleções

| Coleção | Descrição | Relacionamentos |
|---------|-----------|-----------------|
| **users** | Usuários do sistema (comuns e admins) | 1:N com reports |
| **categories** | Categorias para classificar relatos | 1:N com reports |
| **reports** | Relatos de problemas urbanos | N:1 com users e categories |

### 5.3 Diagrama de Relacionamentos

```
+-------------+           +---------------+
|    USERS    |           |  CATEGORIES   |
+-------------+           +---------------+
| _id (PK)    |           | _id (PK)      |
| name        |           | name (unique) |
| email       |           | description   |
| password    |           | active        |
| role        |           +-------+-------+
+------+------+                   |
       |                          | 1:N
       | 1:N                      |
       v                          v
+-------------------------------------+
|              REPORTS                |
+-------------------------------------+
| _id (PK)                            |
| title, description, imageUrl        |
| date, location, tags                |
| category (FK -> categories)         |
| organizer (FK -> users)             |
| status, approvalStatus              |
| approvedBy (FK -> users)            |
+-------------------------------------+
```

### 5.4 Funcionalidades dos Models

| Model | Funcionalidade | Descrição |
|-------|----------------|-----------|
| **User** | Pre-save hook | Hash automático da senha (bcrypt) |
| **User** | `matchPassword()` | Comparação de senhas |
| **User** | `updateLastLogin()` | Atualiza timestamp de login |
| **Report** | `approve(adminId)` | Aprova e ativa o relato |
| **Report** | `reject(adminId, reason)` | Rejeita com motivo |
| **Report** | Pre-save hook | Auto-aprovação para admins |

### 5.5 Índices Principais

- **User**: `email` (unique), `role`
- **Category**: `name` (unique)
- **Report**: `date`, `category`, `status`, `approvalStatus`, `organizer`, `location.*`, `tags`
- **Report**: Índice de texto em `title`, `description`, `location.address` (full-text search)

### 5.6 Documentação Detalhada

Para informações completas sobre schemas, validações, regras de negócio e exemplos de dados, consulte:

| Arquivo | Conteúdo |
|---------|----------|
| [`database/schema.json`](../../database/schema.json) | Definição completa dos schemas com tipos e validações |
| [`database/documentation.json`](../../database/documentation.json) | Regras de negócio, fluxo de aprovação e relacionamentos |
| [`database/samples.json`](../../database/samples.json) | Exemplos de documentos para cada coleção |

---

## 6. Segurança

### 6.1 Autenticação JWT

```
+-------------------------------------------------------------+
|                    FLUXO DE AUTENTICAÇÃO                    |
+-------------------------------------------------------------+

[Login]
    |
    v
+---------------+     +---------------+     +---------------+
| Valida        |---->| Gera Access   |---->| Gera Refresh  |
| Credenciais   |     | Token (24h)   |     | Token (7d)    |
+---------------+     +---------------+     +---------------+
                              |                     |
                              +----------+----------+
                                         |
                                         v
                              +-------------------+
                              | Retorna tokens    |
                              | ao cliente        |
                              +-------------------+

[Requisição Autenticada]
    |
    v
+---------------+     +---------------+     +---------------+
| Bearer Token  |---->| Valida JWT    |---->| Carrega User  |
| no Header     |     | (signature)   |     | do Banco      |
+---------------+     +---------------+     +---------------+

[Refresh Token]
    |
    v
+---------------+     +---------------+     +---------------+
| Refresh Token |---->| Valida        |---->| Gera novos    |
| expirado?     |     | Refresh Token |     | tokens        |
+---------------+     +---------------+     +---------------+
```

### 6.2 Configuração de Tokens

```javascript
// Access Token
{
  id: user._id,
  role: user.role,
  expiresIn: '24h',          // JWT_EXPIRE
  audience: 'resolve-ai-users',
  issuer: 'resolve-ai-api'
}

// Refresh Token
{
  id: user._id,
  expiresIn: '7d',           // REFRESH_TOKEN_EXPIRE
  audience: 'resolve-ai-refresh',
  issuer: 'resolve-ai-api'
}
```

### 6.3 Autorização por Roles

```
+-------------------------------------------------------------+
|                    MATRIZ DE PERMISSÕES                     |
+-------------------------------------------------------------+
| Recurso              | Público | User  | Admin              |
+----------------------+---------+-------+--------------------+
| Listar relatos       |   OK    |  OK   |   OK               |
| Ver relato           |   OK    |  OK   |   OK               |
| Criar relato         |   --    |  OK   |   OK (auto-aprova) |
| Editar relato        |   --    | Dono  |   OK               |
| Excluir relato       |   --    | Dono  |   OK               |
| Aprovar relato       |   --    |  --   |   OK               |
| Rejeitar relato      |   --    |  --   |   OK               |
| Gerenciar categorias |   --    |  --   |   OK               |
| Gerenciar usuários   |   --    |  --   |   OK               |
+----------------------+---------+-------+--------------------+
```

### 6.4 Rate Limiting

```javascript
// Limiter para autenticação (mais restritivo)
loginLimiter: {
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 25,                    // 25 tentativas
  skipSuccessfulRequests: true, // Só conta falhas
  message: 'Muitas tentativas de login...'
}

// Limiter geral
generalLimiter: {
  windowMs: 60 * 1000,       // 1 minuto
  max: 100,                   // 100 requisições
  message: 'Muitas requisições...'
}
```

### 6.5 Sanitização de Dados

```javascript
// Prevenção de NoSQL Injection
express-mongo-sanitize({
  allowDots: true,      // Permite notação de ponto
  replaceWith: '_'      // Substitui $ e . por _
})

// Exemplo de ataque prevenido:
// { "email": { "$gt": "" } } -> { "email": { "_gt": "" } }
```

### 6.6 Validação de Senha

```javascript
validatePassword(password) {
  // Mínimo 6 caracteres
  // Pelo menos 1 número
  // Pelo menos 1 letra
  // Pelo menos 1 caractere especial (!@#$%^&*.,)

  return { isValid: boolean, message: string }
}
```

### 6.7 CORS

```javascript
corsOptions: {
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
  credentials: true,
  optionsSuccessStatus: 204
}
```

---

## 7. Tratamento de Erros

### 7.1 Classe de Erro Customizada

```javascript
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Uso:
throw new ErrorResponse('Usuário não encontrado', 404);
```

### 7.2 Middleware de Erros

```javascript
// Mapeamento de erros Mongoose para HTTP

CastError (ID inválido)       -> 404 Not Found
ValidationError               -> 400 Bad Request
Duplicate Key (11000)         -> 400 Bad Request
JsonWebTokenError             -> 401 Unauthorized
TokenExpiredError             -> 401 Unauthorized
Erro genérico                 -> 500 Internal Server Error
```

### 7.3 Formato de Resposta de Erro

```json
{
  "success": false,
  "error": "Mensagem de erro"
}

// Múltiplos erros de validação:
{
  "success": false,
  "error": [
    "Campo 'name' é obrigatório",
    "Email inválido"
  ]
}
```

### 7.4 Uso do express-async-handler

```javascript
// Sem async-handler (verboso):
const handler = async (req, res, next) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Com async-handler (limpo):
const handler = asyncHandler(async (req, res) => {
  const data = await Model.find();
  res.json(data);
});
```

---

## 8. Configuração

### 8.1 Variáveis de Ambiente

```bash
# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/resolveai

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=sua_chave_refresh_aqui
REFRESH_TOKEN_EXPIRE=7d

# Servidor
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### 8.2 Configuração de Banco de Dados

```javascript
// config/db.js
const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,  // Timeout de conexão
    socketTimeoutMS: 45000,          // Timeout de operações
  };

  await mongoose.connect(process.env.MONGODB_URI, options);
};
```

### 8.3 Separação por Ambiente

```javascript
// server.js
if (process.env.NODE_ENV !== 'test') {
  connectDB();  // Não conecta em testes
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(port);  // Não inicia servidor em testes
}

module.exports = app;  // Exporta para testes
```

---

## 9. Testes

### 9.1 Estrutura de Testes

```
tests/
|-- setup/
|   |-- testDb.js        # MongoDB Memory Server
|   |-- factories.js     # Criação de dados de teste
|   +-- helpers.js       # Funções auxiliares
|-- unit/
|   |-- models/          # Testes de schemas e métodos
|   |-- middlewares/     # Testes de middlewares
|   +-- utils/           # Testes de utilitários
+-- integration/
    |-- auth.test.js     # Fluxos de autenticação
    |-- reports.test.js  # Operações de relatos
    |-- approval.test.js # Fluxo de aprovação
    |-- categories.test.js
    +-- users.test.js
```

### 9.2 Configuração do Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      statements: 80,
      branches: 70
    }
  },
  testTimeout: 30000,
  forceExit: true,
  clearMocks: true,
  resetMocks: true
};
```

### 9.3 Setup Global de Testes

```javascript
// jest.setup.js
const testDb = require('./tests/setup/testDb');

beforeAll(async () => await testDb.connect());
afterEach(async () => await testDb.clear());
afterAll(async () => await testDb.disconnect());

process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
process.env.NODE_ENV = 'test';
```

### 9.4 Factories de Teste

```javascript
// Criação de dados no banco
createTestUser(overrides)     // Cria usuário comum
createTestAdmin(overrides)    // Cria admin
createTestCategory(overrides) // Cria categoria
createTestReport(organizer, category, overrides) // Cria relato

// Geração de tokens
generateAuthToken(user)       // JWT válido
generateRefreshToken(user)    // Refresh token válido

// Builders (não salvam no banco)
buildUserData(overrides)
buildReportData(organizerId, categoryId, overrides)
```

### 9.5 Scripts de Teste

```bash
npm test                 # Todos os testes
npm run test:watch       # Modo watch
npm run test:coverage    # Com cobertura
npm run test:unit        # Apenas unitários
npm run test:integration # Apenas integração
```

---

## 10. Fluxos de Dados

### 10.1 Fluxo de Autenticação (Login)

```
+----------+      +---------------+      +--------------+
| Cliente  |----->| POST          |----->| authRoutes   |
|          |      | /api/auth/    |      |              |
|          |      | login         |      |              |
+----------+      +---------------+      +------+-------+
                                                |
                         +----------------------+
                         |
                         v
              +----------------------+
              | authController.login |
              | -------------------- |
              | 1. Valida email/pass |
              | 2. User.findOne()    |
              | 3. matchPassword()   |
              | 4. updateLastLogin() |
              | 5. generateToken()   |
              +----------+-----------+
                         |
                         v
              +----------------------+
              | Response:            |
              | {                    |
              |   _id, name, email,  |
              |   role, token,       |
              |   refreshToken       |
              | }                    |
              +----------------------+
```

### 10.2 Fluxo de Criação de Relato

```
+----------+      +---------------+      +--------------+
| Cliente  |----->| POST          |----->| protect      |
| (token)  |      | /api/reports  |      | middleware   |
+----------+      +---------------+      +------+-------+
                                                |
                         +----------------------+
                         |
                         v
              +----------------------------+
              | reportController.create    |
              | -------------------------- |
              | 1. Valida categoria existe |
              | 2. Report.create()         |
              |    +-> Pre-save hook:      |
              |       - Se admin: auto-    |
              |         aprova             |
              |       - Sincroniza status  |
              +----------+-----------------+
                         |
                         v
              +----------------------------+
              | Response: report criado    |
              | status: 201 Created        |
              +----------------------------+
```

### 10.3 Fluxo de Aprovação de Relato

```
+----------+    +-----------------+    +---------+    +-------+
| Admin    |--->| PUT             |--->| protect |--->| admin |
| (token)  |    | /api/reports/   |    |         |    |       |
|          |    | :id/approve     |    |         |    |       |
+----------+    +-----------------+    +---------+    +---+---+
                                                          |
                         +--------------------------------+
                         |
                         v
              +------------------------------------+
              | reportApprovalController.approve   |
              | ---------------------------------- |
              | 1. Report.findById()               |
              | 2. Verifica se pending             |
              | 3. report.approve(adminId)         |
              |    +-> approvalStatus = 'approved' |
              |    +-> status = 'active'           |
              |    +-> approvedBy = adminId        |
              |    +-> approvalDate = now          |
              +----------+-------------------------+
                         |
                         v
              +------------------------------------+
              | Response: relato aprovado          |
              +------------------------------------+
```

### 10.4 Fluxo de Busca de Relatos

```
+----------+      +---------------+
| Cliente  |----->| GET           |
|          |      | /api/reports  |
|          |      | ?search=X     |
|          |      | &city=Y       |
|          |      | &category=Z   |
|          |      | &page=1       |
+----------+      +-------+-------+
                          |
                          v
              +---------------------------+
              | reportController.search   |
              | ------------------------- |
              | 1. Monta filtros:         |
              |    - status: 'active'     |
              |    - approvalStatus:      |
              |      'approved'           |
              |    - $text (se search)    |
              |    - location.city        |
              |    - category             |
              | 2. Paginação (skip/limit) |
              | 3. Populate (category,    |
              |    organizer)             |
              +-------------+-------------+
                            |
                            v
              +---------------------------+
              | Response:                 |
              | {                         |
              |   reports: [...],         |
              |   page: 1,                |
              |   pages: 5,               |
              |   total: 50               |
              | }                         |
              +---------------------------+
```

---

## 11. Considerações de Performance

### 11.1 Otimizações Implementadas

| Área | Otimização | Benefício |
|------|------------|-----------|
| **Índices** | 10+ índices no Report | Queries O(log n) |
| **Projeção** | `.select('-password')` | Menos dados transferidos |
| **Paginação** | skip/limit configurável | Controle de payload |
| **Text Search** | Índice composto de texto | Busca eficiente |
| **Virtuals** | Lazy loading de relações | Evita N+1 queries |

### 11.2 Limites de Paginação

```javascript
// Defaults
DEFAULT_LIMIT: 10
MAX_LIMIT: 100

// Uso
GET /api/reports?page=1&limit=20
```

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **ODM** | Object Document Mapper (Mongoose) |
| **JWT** | JSON Web Token |
| **Middleware** | Função intermediária no pipeline de requisição |
| **Schema** | Definição de estrutura de dados no Mongoose |
| **Virtual** | Propriedade computada não persistida |
| **Hook** | Callback executado em eventos do ciclo de vida |
| **Rate Limiting** | Limitação de requisições por tempo |
| **Sanitização** | Limpeza de dados de entrada |

---

## Referências

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Indexes](https://docs.mongodb.com/manual/indexes/)
- [OWASP Security Guidelines](https://owasp.org/)
