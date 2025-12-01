# Resolve Aí - Backend

API REST para a plataforma **Resolve Aí**, um sistema de relatos de problemas urbanos que permite aos cidadãos reportar e acompanhar questões em suas comunidades.

## 🎯 Objetivo do Projeto

O Resolve Aí é uma plataforma colaborativa que visa melhorar a qualidade de vida urbana, permitindo que cidadãos:
- Reportem problemas como buracos, falta de iluminação, questões ambientais
- Acompanhem o status de seus relatos
- Contribuam para uma comunidade mais organizada

O sistema conta com workflow de aprovação por administradores para garantir a qualidade dos relatos publicados.

## 🌐 Produção

A API está disponível em: **[https://api.resolveai.com.br](https://placeholder-url.com)**

> *Nota: URL de produção será atualizada após deploy*

## 🚀 Funcionalidades

### Autenticação
- Registro de usuários com validação completa
- Login com JWT (access token + refresh token)
- Atualização de perfil e senha
- Renovação automática de tokens

### Gestão de Relatos
- Criação de relatos com título, descrição, localização e categoria
- Upload de imagens
- Sistema de tags para organização
- Busca avançada com múltiplos filtros
- Paginação de resultados

### Workflow de Aprovação
- Relatos de usuários passam por aprovação de admin
- Auto-aprovação para relatos criados por admins
- Rejeição com motivo obrigatório
- Ativação/desativação de relatos aprovados

### Administração
- Gerenciamento de categorias
- Gerenciamento de usuários
- Visualização de todos os relatos
- Painel de relatos pendentes

## 🧰 Tecnologias Utilizadas

| Tecnologia | Descrição |
|------------|-----------|
| **Node.js** | Ambiente de execução JavaScript |
| **Express** | Framework web minimalista |
| **MongoDB** | Banco de dados NoSQL |
| **Mongoose** | ODM para MongoDB |
| **JWT** | Autenticação baseada em tokens |
| **Bcrypt** | Hash de senhas |
| **Jest** | Framework de testes |
| **express-mongo-sanitize** | Proteção contra injection |

## 📋 Pré-requisitos

- Node.js (versão 14.x ou superior)
- MongoDB (local ou remoto)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/EdneyVF/resolveai-backend.git
cd resolveai-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:
```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/resolveai

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=sua_chave_refresh_secreta_aqui
REFRESH_TOKEN_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

## 💻 Como Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Testes
```bash
npm test
```

### Popular banco com dados iniciais
```bash
npm run seed
```

A API estará disponível em: `http://localhost:3001`

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (db, cors, jwt)
│   ├── controllers/     # Controladores das rotas
│   ├── middlewares/     # Auth, validation, error handling
│   ├── models/          # Schemas do Mongoose
│   ├── routes/          # Definição de rotas
│   ├── utils/           # Utilitários e helpers
│   ├── validators/      # Validações de entrada
│   └── app.js           # Configuração do Express
├── tests/               # Testes automatizados
├── database/            # Documentação do banco
├── docs/                # Documentação do sistema
└── index.js             # Entry point
```

## 📚 Rotas da API

### Autenticação (`/api/auth`)
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/register` | Registrar usuário | Não |
| POST | `/login` | Autenticar usuário | Não |
| POST | `/refresh-token` | Renovar token | Não |
| GET | `/me` | Dados do usuário logado | Sim |
| PUT | `/password` | Atualizar senha | Sim |
| PUT | `/profile` | Atualizar perfil | Sim |

### Relatos (`/api/reports`)
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/` | Buscar relatos (público) | Não |
| POST | `/` | Criar relato | Sim |
| GET | `/:id` | Obter relato | Não* |
| PUT | `/:id` | Atualizar relato | Sim** |
| DELETE | `/:id` | Excluir relato | Sim** |
| PUT | `/:id/cancel` | Cancelar relato | Sim** |
| GET | `/my-reports` | Meus relatos | Sim |
| GET | `/admin/all` | Todos os relatos | Admin |
| PUT | `/:id/activate` | Ativar relato | Admin |
| PUT | `/:id/deactivate` | Desativar relato | Admin |

### Aprovação (`/api/reports`)
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/approval/pending` | Listar pendentes | Admin |
| PUT | `/:id/approve` | Aprovar relato | Admin |
| PUT | `/:id/reject` | Rejeitar relato | Admin |
| GET | `/:id/approval-status` | Status de aprovação | Sim |

### Categorias (`/api/categories`)
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/` | Listar categorias | Não*** |
| GET | `/:id` | Obter categoria | Não*** |
| POST | `/` | Criar categoria | Admin |
| PUT | `/:id` | Atualizar categoria | Admin |
| DELETE | `/:id` | Excluir categoria | Admin |

### Usuários (`/api/users`)
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/` | Listar usuários | Admin |
| GET | `/:id` | Obter usuário | Admin |
| PUT | `/:id` | Atualizar usuário | Admin |
| DELETE | `/:id` | Excluir usuário | Admin |

**Legenda:**
- `*` Apenas relatos aprovados/ativos para público
- `**` Apenas próprios relatos ou admin
- `***` Público vê apenas categorias ativas

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) com dois tipos de tokens:

1. **Access Token** (24h): Usado para autenticar requisições
2. **Refresh Token** (7d): Usado para obter novos access tokens

```javascript
// Header de autenticação
Authorization: Bearer <access_token>
```

## 📊 Dados de Teste

Após executar `npm run seed`:

| Tipo | Email | Senha |
|------|-------|-------|
| **Admin** | admin@exemplo.com | admin123 |
| **Usuário** | usuario@exemplo.com | user123 |

## 📖 Documentação

Para informações detalhadas, consulte:

- [📐 Arquitetura do Sistema](docs/architecture/architecture.md) - Estrutura, padrões e decisões técnicas
- [📋 Requisitos do Sistema](docs/requirements/requirements.md) - Requisitos funcionais e não funcionais
- [🗄️ Schema do Banco](database/schema.json) - Estrutura das coleções
- [📝 Documentação do Banco](database/documentation.json) - Regras de negócio e relacionamentos

## 🧪 Testes

O projeto utiliza Jest com MongoDB Memory Server:

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm run test:coverage

# Executar em modo watch
npm run test:watch
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE.txt) para detalhes.

---

Desenvolvido com ❤️ por Edney Vasconcelos Freitas
