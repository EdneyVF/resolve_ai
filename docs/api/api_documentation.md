# Documentação da API - Resolve Aí

## Visão Geral

A API do Resolve Aí é uma API RESTful para gerenciamento de relatos de problemas urbanos. A API permite que cidadãos criem relatos, e que administradores os aprovem ou rejeitem.

### Base URL
```
http://localhost:5000
```

### Formato de Dados
- **Request**: `application/json`
- **Response**: `application/json`

### Autenticação
A API utiliza autenticação JWT (JSON Web Token). Os tokens devem ser enviados no header `Authorization`:
```
Authorization: Bearer <token>
```

**Configurações do Token:**
- **Access Token**: Expira em 24h (configurável via `JWT_EXPIRE`)
- **Refresh Token**: Expira em 7 dias (configurável via `REFRESH_TOKEN_EXPIRE`)
- **Audience**: `resolveai-app`
- **Issuer**: `resolveai-api`

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Recurso criado com sucesso |
| 400 | Requisição inválida (dados faltando ou inválidos) |
| 401 | Não autorizado (token ausente, inválido ou expirado) |
| 403 | Proibido (sem permissão para o recurso) |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## Estrutura de Erros

Todas as respostas de erro seguem o formato:
```json
{
  "success": false,
  "message": "Descrição do erro",
  "stack": "Stack trace (apenas em desenvolvimento)"
}
```

---

# Endpoints

## 1. Autenticação (`/api/auth`)

### 1.1 Registro de Usuário

Cria uma nova conta de usuário.

```http
POST /api/auth/register
```

**Acesso**: Público

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Sim | Nome do usuário (2-100 caracteres) |
| email | string | Sim | Email único válido |
| password | string | Sim | Senha (mínimo 6 caracteres, requer maiúscula, minúscula, número e especial) |
| phone | string | Não | Telefone do usuário |
| bio | string | Não | Biografia (máximo 500 caracteres) |

**Exemplo de Request:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "Senha123!",
  "phone": "(11) 99999-9999",
  "bio": "Cidadão engajado"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Email já cadastrado |
| 400 | Senha deve ter pelo menos 6 caracteres |
| 400 | Senha deve conter letra maiúscula, minúscula, número e caractere especial |

---

### 1.2 Login

Autentica um usuário existente.

```http
POST /api/auth/login
```

**Acesso**: Público

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| email | string | Sim | Email do usuário |
| password | string | Sim | Senha do usuário |

**Exemplo de Request:**
```json
{
  "email": "joao@email.com",
  "password": "Senha123!"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Email e senha são obrigatórios |
| 401 | Email ou senha inválidos |

---

### 1.3 Refresh Token

Renova os tokens de acesso usando o refresh token.

```http
POST /api/auth/refresh-token
```

**Acesso**: Público

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| refreshToken | string | Sim | Refresh token válido |

**Exemplo de Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Refresh token é obrigatório |
| 401 | Refresh token inválido ou expirado |
| 404 | Usuário não encontrado |

---

### 1.4 Obter Perfil do Usuário Logado

Retorna os dados do usuário autenticado.

```http
GET /api/auth/me
```

**Acesso**: Privado (requer autenticação)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "user",
  "phone": "(11) 99999-9999",
  "bio": "Cidadão engajado",
  "socialMedia": {
    "facebook": null,
    "twitter": null,
    "linkedin": null,
    "instagram": null
  },
  "lastLogin": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-01T08:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 401 | Não autorizado, token não encontrado |
| 401 | Token inválido |
| 401 | Token expirado |
| 404 | Usuário não encontrado |

---

### 1.5 Atualizar Senha

Atualiza a senha do usuário autenticado.

```http
PUT /api/auth/password
```

**Acesso**: Privado (requer autenticação)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| currentPassword | string | Sim | Senha atual |
| newPassword | string | Sim | Nova senha (mesmas regras de criação) |

**Exemplo de Request:**
```json
{
  "currentPassword": "Senha123!",
  "newPassword": "NovaSenha456!"
}
```

**Response (200):**
```json
{
  "message": "Senha atualizada com sucesso"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Nova senha deve ter pelo menos 6 caracteres |
| 401 | Senha atual incorreta |

---

### 1.6 Atualizar Perfil

Atualiza informações do perfil do usuário autenticado.

```http
PUT /api/auth/profile
```

**Acesso**: Privado (requer autenticação)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Não | Nome (2-100 caracteres) |
| phone | string | Não | Telefone |
| bio | string | Não | Biografia (máximo 500 caracteres) |

**Exemplo de Request:**
```json
{
  "name": "João da Silva",
  "phone": "(11) 88888-8888",
  "bio": "Cidadão muito engajado"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João da Silva",
  "email": "joao@email.com",
  "phone": "(11) 88888-8888",
  "bio": "Cidadão muito engajado",
  "role": "user"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Nome deve ter entre 2 e 100 caracteres |
| 400 | Número de telefone inválido |
| 400 | Biografia deve ter no máximo 500 caracteres |
| 404 | Usuário não encontrado |

---

### 1.7 Force Logout

Endpoint auxiliar que força logout retornando erro 401.

```http
GET /api/auth/force-logout
```

**Acesso**: Público

**Response (401):**
```json
{
  "message": "Por favor, faça login novamente.",
  "forceLogout": true
}
```

---

## 2. Usuários (`/api/users`)

> **Nota**: Todos os endpoints de usuários requerem autenticação como **administrador**.

### 2.1 Listar Usuários

Lista todos os usuários com paginação e filtros.

```http
GET /api/users
```

**Acesso**: Privado (Admin)

**Query Parameters:**
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| page | number | 1 | Página atual |
| limit | number | 10 | Itens por página |
| role | string | - | Filtrar por papel (`user` ou `admin`) |
| search | string | - | Busca por nome ou email |

**Exemplo de Request:**
```
GET /api/users?page=1&limit=10&role=user&search=joao
```

**Response (200):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@email.com",
      "role": "user",
      "phone": "(11) 99999-9999",
      "bio": "Cidadão engajado",
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1
}
```

---

### 2.2 Obter Usuário por ID

Retorna detalhes de um usuário específico.

```http
GET /api/users/:id
```

**Acesso**: Privado (Admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do usuário (ObjectId) |

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "user",
  "phone": "(11) 99999-9999",
  "bio": "Cidadão engajado",
  "socialMedia": {
    "facebook": "https://facebook.com/joaosilva"
  },
  "lastLogin": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-01T08:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 404 | Usuário não encontrado |

---

### 2.3 Atualizar Usuário

Atualiza dados de um usuário específico.

```http
PUT /api/users/:id
```

**Acesso**: Privado (Admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do usuário (ObjectId) |

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Não | Nome do usuário |
| email | string | Não | Email (deve ser único) |
| role | string | Não | Papel (`user` ou `admin`) |
| phone | string | Não | Telefone |
| bio | string | Não | Biografia |

**Exemplo de Request:**
```json
{
  "name": "João da Silva",
  "role": "admin"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João da Silva",
  "email": "joao@email.com",
  "role": "admin",
  "phone": "(11) 99999-9999",
  "bio": "Cidadão engajado"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Email inválido |
| 400 | Email já está em uso |
| 400 | Papel inválido |
| 404 | Usuário não encontrado |

---

### 2.4 Deletar Usuário

Remove um usuário do sistema.

```http
DELETE /api/users/:id
```

**Acesso**: Privado (Admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do usuário (ObjectId) |

**Response (200):**
```json
{
  "success": true,
  "message": "Usuário deletado com sucesso"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Não é possível deletar usuário com relatos ativos |
| 404 | Usuário não encontrado |

---

## 3. Categorias (`/api/categories`)

### 3.1 Listar Categorias

Lista todas as categorias disponíveis.

```http
GET /api/categories
```

**Acesso**: Público (com autenticação opcional)

**Comportamento:**
- **Sem autenticação ou usuário comum**: Retorna apenas categorias ativas
- **Administrador**: Retorna todas as categorias (ativas e inativas)

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "name": "Infraestrutura",
    "description": "Problemas relacionados a infraestrutura urbana",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 3.2 Obter Categoria por ID

Retorna detalhes de uma categoria específica.

```http
GET /api/categories/:id
```

**Acesso**: Público (com autenticação opcional)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da categoria (ObjectId) |

**Comportamento:**
- Categorias inativas só são visíveis para administradores

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439021",
  "name": "Infraestrutura",
  "description": "Problemas relacionados a infraestrutura urbana",
  "active": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 404 | Categoria não encontrada |

---

### 3.3 Criar Categoria

Cria uma nova categoria.

```http
POST /api/categories
```

**Acesso**: Privado (Admin)

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Sim | Nome único (2-50 caracteres) |
| description | string | Não | Descrição (máximo 200 caracteres) |
| active | boolean | Não | Status ativo (padrão: true) |

**Exemplo de Request:**
```json
{
  "name": "Transporte",
  "description": "Questões de transporte público",
  "active": true
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439025",
  "name": "Transporte",
  "description": "Questões de transporte público",
  "active": true,
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Categoria com este nome já existe |

---

### 3.4 Atualizar Categoria

Atualiza uma categoria existente.

```http
PUT /api/categories/:id
```

**Acesso**: Privado (Admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da categoria (ObjectId) |

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Não | Nome único |
| description | string | Não | Descrição |
| active | boolean | Não | Status ativo |

**Exemplo de Request:**
```json
{
  "name": "Transporte Público",
  "active": false
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439025",
  "name": "Transporte Público",
  "description": "Questões de transporte público",
  "active": false,
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Categoria com este nome já existe |
| 404 | Categoria não encontrada |

---

### 3.5 Deletar Categoria

Remove uma categoria do sistema.

```http
DELETE /api/categories/:id
```

**Acesso**: Privado (Admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da categoria (ObjectId) |

**Response (200):**
```json
{
  "success": true,
  "message": "Categoria removida com sucesso"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Não é possível excluir categoria com X relatos associados. Considere desativá-la. |
| 404 | Categoria não encontrada |

---

## 4. Relatos (`/api/reports`)

### 4.1 Buscar Relatos (Público)

Busca relatos com diversos filtros. Retorna apenas relatos aprovados e ativos para usuários não autenticados.

```http
GET /api/reports
```

**Acesso**: Público

**Query Parameters:**
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| page | number | 1 | Página atual |
| limit | number | 10 | Itens por página |
| q | string | - | Busca full-text (título, descrição, endereço) |
| search | string | - | Busca regex por título ou descrição |
| category | string | - | ID da categoria |
| categories | string | - | IDs de categorias separados por vírgula |
| status | string | - | Status do relato |
| location | string | - | Busca em cidade, estado ou país |
| city | string | - | Filtrar por cidade |
| state | string | - | Filtrar por estado |
| country | string | - | Filtrar por país |
| from | date | - | Data inicial (YYYY-MM-DD) |
| to | date | - | Data final (YYYY-MM-DD) |
| startDate | date | - | Alias para `from` |
| endDate | date | - | Alias para `to` |
| period | number | - | Próximos X dias |
| tags | string | - | Tags separadas por vírgula |
| sort | string | date | Ordenação (ver opções abaixo) |

**Opções de Ordenação:**
| Valor | Descrição |
|-------|-----------|
| date_asc | Data crescente |
| date_desc | Data decrescente |
| recent | Mais recentes primeiro (por createdAt) |

**Exemplo de Request:**
```
GET /api/reports?city=São Paulo&category=507f1f77bcf86cd799439021&sort=recent&page=1&limit=10
```

**Response (200):**
```json
{
  "reports": [
    {
      "_id": "507f1f77bcf86cd799439032",
      "title": "Iluminação pública queimada",
      "description": "As lâmpadas da iluminação pública estão queimadas",
      "imageUrl": "https://storage.resolveai.com/images/lampada.jpg",
      "date": "2024-01-10T00:00:00.000Z",
      "location": {
        "address": "Avenida Brasil, 500-600",
        "city": "São Paulo",
        "state": "SP",
        "country": "Brasil"
      },
      "category": {
        "_id": "507f1f77bcf86cd799439021",
        "name": "Infraestrutura"
      },
      "organizer": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "João Silva",
        "email": "joao@email.com"
      },
      "status": "active",
      "approvalStatus": "approved",
      "tags": ["iluminação", "segurança"],
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T14:30:00.000Z"
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1,
  "filters": {
    "textSearch": false,
    "location": null,
    "city": "São Paulo",
    "state": null,
    "country": null,
    "dateRange": false,
    "period": null,
    "price": false,
    "category": "507f1f77bcf86cd799439021",
    "hasAvailability": false
  }
}
```

---

### 4.2 Criar Relato

Cria um novo relato de problema urbano.

```http
POST /api/reports
```

**Acesso**: Privado (requer autenticação)

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| title | string | Sim | Título (3-100 caracteres) |
| description | string | Sim | Descrição (mínimo 10 caracteres) |
| imageUrl | string | Não | URL da imagem |
| date | date | Sim | Data do relato |
| location | object | Sim | Localização do problema |
| location.address | string | Sim | Endereço |
| location.city | string | Sim | Cidade |
| location.state | string | Sim | Estado |
| location.country | string | Não | País (padrão: "Brasil") |
| category | string | Sim | ID da categoria |
| tags | array/string | Não | Tags (máximo 10, cada uma 3-30 caracteres) |

**Comportamento:**
- **Usuário comum**: Relato criado com `approvalStatus: "pending"` e `status: "inactive"`
- **Administrador**: Relato auto-aprovado com `approvalStatus: "approved"` e `status: "active"`

**Exemplo de Request:**
```json
{
  "title": "Buraco na Rua das Flores",
  "description": "Existe um buraco grande na Rua das Flores, próximo ao número 150",
  "imageUrl": "https://storage.resolveai.com/images/buraco.jpg",
  "date": "2024-01-14",
  "location": {
    "address": "Rua das Flores, 150",
    "city": "São Paulo",
    "state": "SP"
  },
  "category": "507f1f77bcf86cd799439021",
  "tags": ["buraco", "asfalto", "trânsito"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Relato criado com sucesso e aguardando aprovação",
  "report": {
    "_id": "507f1f77bcf86cd799439031",
    "title": "Buraco na Rua das Flores",
    "description": "Existe um buraco grande na Rua das Flores",
    "status": "inactive",
    "approvalStatus": "pending",
    "needsApproval": true,
    "category": {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Infraestrutura"
    },
    "organizer": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@email.com"
    }
  }
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Título, descrição, data, localização e categoria são obrigatórios |
| 400 | Título deve ter entre 3 e 100 caracteres |
| 400 | Descrição deve ter pelo menos 10 caracteres |
| 400 | Endereço, cidade e estado são obrigatórios |
| 400 | Formato de data inválido |
| 400 | URL de imagem inválida |
| 400 | Máximo de 10 tags permitidas |
| 400 | Cada tag deve ter entre 3 e 30 caracteres |
| 400 | Esta categoria está inativa e não pode ser usada |
| 404 | Categoria não encontrada |

---

### 4.3 Obter Relato por ID

Retorna detalhes de um relato específico.

```http
GET /api/reports/:id
```

**Acesso**: Privado (requer autenticação)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do relato (ObjectId) |

**Comportamento:**
- Relatos não aprovados só são visíveis para o criador ou administradores

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439032",
  "title": "Iluminação pública queimada",
  "description": "As lâmpadas estão queimadas há mais de uma semana",
  "imageUrl": "https://storage.resolveai.com/images/lampada.jpg",
  "date": "2024-01-10T00:00:00.000Z",
  "location": {
    "address": "Avenida Brasil, 500-600",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil"
  },
  "category": {
    "_id": "507f1f77bcf86cd799439021",
    "name": "Infraestrutura"
  },
  "organizer": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "status": "active",
  "approvalStatus": "approved",
  "approvedBy": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Admin"
  },
  "approvalDate": "2024-01-10T14:30:00.000Z",
  "rejectionReason": null,
  "tags": ["iluminação", "segurança"],
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-10T14:30:00.000Z"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 403 | Relato não disponível |
| 404 | Relato não encontrado |

---

### 4.4 Atualizar Relato

Atualiza um relato existente.

```http
PUT /api/reports/:id
```

**Acesso**: Privado (dono do relato ou admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do relato (ObjectId) |

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| title | string | Não | Título |
| description | string | Não | Descrição |
| imageUrl | string | Não | URL da imagem (null para remover) |
| date | date | Não | Data |
| location | object | Não | Localização |
| category | string | Não | ID da categoria |
| tags | array | Não | Tags |

**Comportamento:**
- **Usuário comum**: Edição volta relato para `approvalStatus: "pending"` e `status: "inactive"`
- **Administrador**: Edição mantém relato aprovado e ativo

**Exemplo de Request:**
```json
{
  "title": "Buraco grande na Rua das Flores",
  "description": "Buraco está aumentando e causando mais acidentes"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Relato atualizado com sucesso e aguardando aprovação",
  "report": {
    "_id": "507f1f77bcf86cd799439031",
    "title": "Buraco grande na Rua das Flores",
    "status": "inactive",
    "approvalStatus": "pending"
  }
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Não é possível alterar relatos cancelados |
| 403 | Não autorizado |
| 404 | Relato não encontrado |
| 404 | Categoria não encontrada |

---

### 4.5 Deletar Relato

Remove um relato do sistema.

```http
DELETE /api/reports/:id
```

**Acesso**: Privado (dono do relato ou admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do relato (ObjectId) |

**Response (200):**
```json
{
  "success": true,
  "message": "Relato deletado com sucesso"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 403 | Não autorizado |
| 404 | Relato não encontrado |

---

### 4.6 Cancelar Relato

Cancela um relato (soft delete).

```http
PUT /api/reports/:id/cancel
```

**Acesso**: Privado (dono do relato ou admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do relato (ObjectId) |

**Response (200):**
```json
{
  "success": true,
  "message": "Relato cancelado com sucesso"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Relato já está cancelado |
| 403 | Não autorizado |
| 404 | Relato não encontrado |

---

### 4.7 Listar Meus Relatos

Lista relatos criados pelo usuário autenticado.

```http
GET /api/reports/my-reports
```

**Acesso**: Privado (requer autenticação)

**Query Parameters:**
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| page | number | 1 | Página atual |
| limit | number | 10 | Itens por página |
| status | string | - | Filtrar por status (`active`, `inactive`, `canceled`, `finished`) |
| approvalStatus | string | - | Filtrar por status de aprovação (`pending`, `approved`, `rejected`) |

**Exemplo de Request:**
```
GET /api/reports/my-reports?status=active&approvalStatus=approved
```

**Response (200):**
```json
{
  "reports": [
    {
      "_id": "507f1f77bcf86cd799439032",
      "title": "Iluminação pública queimada",
      "status": "active",
      "approvalStatus": "approved",
      "category": {
        "_id": "507f1f77bcf86cd799439021",
        "name": "Infraestrutura"
      }
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1,
  "counts": {
    "total": 5,
    "active": 2,
    "inactive": 1,
    "canceled": 1,
    "finished": 1,
    "pending": 1,
    "approved": 3,
    "rejected": 1
  }
}
```

---

### 4.8 Listar Todos os Relatos (Admin)

Lista todos os relatos do sistema com filtros avançados.

```http
GET /api/reports/admin/all
```

**Acesso**: Privado (Admin)

**Query Parameters:**
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| page | number | 1 | Página atual |
| limit | number | 10 | Itens por página |
| search | string | - | Busca por título ou descrição |
| category | string | - | ID da categoria |
| categories | string | - | IDs separados por vírgula |
| status | string | - | Status (`active`, `inactive`, `canceled`, `finished`, `all`) |
| approvalStatus | string | - | Status de aprovação (`pending`, `approved`, `rejected`, `all`) |
| organizer | string | - | ID do criador |
| from | date | - | Data inicial |
| to | date | - | Data final |
| sort | string | recent | Ordenação |

**Opções de Ordenação:**
| Valor | Descrição |
|-------|-----------|
| date_asc | Data crescente |
| date_desc | Data decrescente |
| title_asc | Título A-Z |
| title_desc | Título Z-A |
| recent | Mais recentes primeiro |

**Response (200):**
```json
{
  "reports": [],
  "page": 1,
  "pages": 5,
  "total": 45,
  "counts": {
    "total": 100,
    "active": 60,
    "inactive": 20,
    "canceled": 15,
    "finished": 5,
    "pending": 10,
    "approved": 75,
    "rejected": 15
  }
}
```

---

### 4.9 Ativar Relato (Admin)

Ativa um relato inativo aprovado.

```http
PUT /api/reports/:id/activate
```

**Acesso**: Privado (Admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do relato (ObjectId) |

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439032",
  "status": "active",
  "approvalStatus": "approved"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Relato já está ativo |
| 400 | Apenas relatos aprovados podem ser ativados |
| 400 | Relatos cancelados não podem ser ativados |
| 403 | Não autorizado |
| 404 | Relato não encontrado |

---

### 4.10 Desativar Relato (Admin)

Desativa um relato ativo.

```http
PUT /api/reports/:id/deactivate
```

**Acesso**: Privado (Admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do relato (ObjectId) |

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439032",
  "status": "inactive",
  "approvalStatus": "approved"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Relato já está inativo |
| 400 | Relatos cancelados não podem ser inativados |
| 403 | Não autorizado |
| 404 | Relato não encontrado |

---

## 5. Aprovação de Relatos (`/api/reports`)

### 5.1 Listar Relatos Pendentes

Lista todos os relatos aguardando aprovação.

```http
GET /api/reports/approval/pending
```

**Acesso**: Privado (Admin)

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "reports": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "title": "Buraco na Rua das Flores",
      "description": "Existe um buraco grande",
      "status": "inactive",
      "approvalStatus": "pending",
      "organizer": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "João Silva",
        "email": "joao@email.com"
      },
      "category": {
        "_id": "507f1f77bcf86cd799439021",
        "name": "Infraestrutura"
      },
      "createdAt": "2024-01-14T09:00:00.000Z"
    }
  ]
}
```

---

### 5.2 Aprovar Relato

Aprova um relato pendente.

```http
PUT /api/reports/:id/approve
```

**Acesso**: Privado (Admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do relato (ObjectId) |

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "approvalStatus": "approved",
  "status": "active",
  "approvedBy": "507f1f77bcf86cd799439012",
  "approvalDate": "2024-01-15T10:00:00.000Z"
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Relato não está pendente de aprovação |
| 404 | Relato não encontrado |

---

### 5.3 Rejeitar Relato

Rejeita um relato pendente.

```http
PUT /api/reports/:id/reject
```

**Acesso**: Privado (Admin)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do relato (ObjectId) |

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| reason | string | Sim | Motivo da rejeição |

**Exemplo de Request:**
```json
{
  "reason": "Relato não representa um problema real. Por favor, utilize a plataforma apenas para relatar problemas urbanos reais."
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "approvalStatus": "rejected",
  "status": "inactive",
  "rejectionReason": "Relato não representa um problema real..."
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 400 | Motivo da rejeição é obrigatório |
| 400 | Relato não está pendente de aprovação |
| 404 | Relato não encontrado |

---

### 5.4 Consultar Status de Aprovação

Consulta o status de aprovação de um relato.

```http
GET /api/reports/:id/approval-status
```

**Acesso**: Privado (requer autenticação)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do relato (ObjectId) |

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439032",
  "approvalStatus": "approved",
  "status": "active",
  "approvedBy": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Admin Sistema"
  },
  "approvalDate": "2024-01-10T14:30:00.000Z",
  "rejectionReason": null
}
```

**Erros Possíveis:**
| Código | Mensagem |
|--------|----------|
| 404 | Relato não encontrado |

---

## Modelos de Dados

### User (Usuário)

```typescript
{
  _id: ObjectId,
  name: string,           // 2-100 caracteres, obrigatório
  email: string,          // único, obrigatório, formato email
  password: string,       // mínimo 6 caracteres, hash bcrypt
  role: "user" | "admin", // padrão: "user"
  phone: string,          // opcional, validação de formato
  bio: string,            // máximo 500 caracteres
  socialMedia: {
    facebook: string,
    twitter: string,
    linkedin: string,
    instagram: string
  },
  lastLogin: Date,
  createdAt: Date,        // automático
  updatedAt: Date         // automático
}
```

### Category (Categoria)

```typescript
{
  _id: ObjectId,
  name: string,        // 2-50 caracteres, único, obrigatório
  description: string, // máximo 200 caracteres
  active: boolean,     // padrão: true
  createdAt: Date,     // automático
  updatedAt: Date      // automático
}
```

### Report (Relato)

```typescript
{
  _id: ObjectId,
  title: string,           // 3-100 caracteres, obrigatório
  description: string,     // mínimo 10 caracteres, obrigatório
  imageUrl: string,        // URL válida, opcional
  date: Date,              // obrigatório
  location: {
    address: string,       // obrigatório
    city: string,          // obrigatório
    state: string,         // obrigatório
    country: string        // padrão: "Brasil"
  },
  category: ObjectId,      // referência a Category
  organizer: ObjectId,     // referência a User
  status: "active" | "inactive" | "canceled" | "finished",
  approvalStatus: "pending" | "approved" | "rejected",
  approvedBy: ObjectId,    // referência a User (admin)
  approvalDate: Date,
  rejectionReason: string,
  tags: string[],          // máximo 10 tags
  createdAt: Date,         // automático
  updatedAt: Date          // automático
}
```

---

## Fluxo de Aprovação

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE APROVAÇÃO                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Usuário comum cria relato:                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  approvalStatus = "pending"                              │   │
│  │  status = "inactive"                                     │   │
│  │  → Aguarda aprovação de admin                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│          ┌───────────────┴───────────────┐                      │
│          │                               │                      │
│          ▼                               ▼                      │
│  ┌───────────────────┐         ┌───────────────────┐           │
│  │  Admin APROVA     │         │  Admin REJEITA    │           │
│  ├───────────────────┤         ├───────────────────┤           │
│  │ approvalStatus =  │         │ approvalStatus =  │           │
│  │   "approved"      │         │   "rejected"      │           │
│  │ status = "active" │         │ status = "inactive"│          │
│  │ approvedBy = admin│         │ approvedBy = admin│           │
│  │ approvalDate = now│         │ rejectionReason = │           │
│  └───────────────────┘         │   "motivo"        │           │
│                                 └───────────────────┘           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Admin cria relato:                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  AUTO-APROVAÇÃO AUTOMÁTICA                               │   │
│  │  approvalStatus = "approved"                             │   │
│  │  status = "active"                                       │   │
│  │  approvedBy = próprio admin                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| PORT | Porta do servidor | 5000 |
| MONGO_URI | URI de conexão MongoDB | - |
| JWT_SECRET | Chave secreta para JWT | - |
| JWT_EXPIRE | Tempo de expiração do access token | 24h |
| REFRESH_TOKEN_SECRET | Chave secreta para refresh token | JWT_SECRET + '_refresh' |
| REFRESH_TOKEN_EXPIRE | Tempo de expiração do refresh token | 7d |
| NODE_ENV | Ambiente (development/production) | development |

---

## Índices do Banco de Dados

### Users
- `email`: unique
- `role`: index

### Categories
- `name`: unique

### Reports
- `date`: index
- `category`: index
- `status`: index
- `approvalStatus`: index
- `organizer`: index
- `location.city`: index
- `location.state`: index
- `location.country`: index
- `tags`: index
- `title, description, location.address`: text (full-text search)
