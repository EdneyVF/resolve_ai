# Resolve Aí

<p align="center">
  <img src="frontend/public/icons/logo.png" alt="Resolve Aí Logo" width="120" />
</p>

<p align="center">
  <strong>Plataforma de comunicação comunitária</strong><br>
  Conectando cidadãos e comunidades através de relatos e informações locais
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/MUI-6.4-007FFF?style=flat-square&logo=mui" alt="Material UI" />
</p>

<p align="center">
  <a href="https://placeholder-url.com"><strong>🌐 Acessar Aplicação</strong></a>
</p>

> *Nota: URL de produção será atualizada após deploy*

---

## Sobre o Projeto

O **Resolve Aí** é uma plataforma web que permite à população criar e compartilhar relatos sobre acontecimentos da sua comunidade. O sistema funciona como um canal de comunicação entre cidadãos, possibilitando a troca de informações sobre:

- Reclamações e problemas locais
- Avisos e alertas
- Notícias da comunidade
- Eventos e acontecimentos
- Solicitações de ajuda aos órgãos competentes

O sistema pode ser aplicado em diferentes contextos: bairros, vilas, condomínios, cidades ou qualquer comunidade que necessite de um canal de comunicação organizado.

---

## Funcionalidades

### Para Usuários

| Funcionalidade | Status |
|----------------|--------|
| Criar conta e fazer login | ✅ Completo |
| Criar relatos com título, descrição, localização e categoria | ✅ Completo |
| Editar e cancelar próprios relatos | ✅ Completo |
| Visualizar relatos aprovados da comunidade | ✅ Completo |
| Filtrar por categoria, data, localização | ✅ Completo |
| Busca por texto (título, descrição, endereço) | ✅ Completo |
| Gerenciar perfil pessoal | ✅ Completo |

### Para Administradores

| Funcionalidade | Status |
|----------------|--------|
| Dashboard com estatísticas | ✅ Completo |
| Aprovar ou rejeitar relatos pendentes | ✅ Completo |
| Ativar/Inativar relatos | ✅ Completo |
| Gerenciar categorias (criar, editar, desativar) | ✅ Completo |
| Gerenciar usuários | ✅ Completo |
| Relatos criados por admins são aprovados automaticamente | ✅ Completo |

---

## Tecnologias

### Backend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Node.js | - | Runtime JavaScript |
| Express | 4.21.1 | Framework web |
| MongoDB | - | Banco de dados NoSQL |
| Mongoose | 8.8.2 | ODM para MongoDB |
| JWT | 9.0.2 | Autenticação |
| bcryptjs | 2.4.3 | Hash de senhas |
| express-rate-limit | 7.5.0 | Proteção contra DDoS |
| express-mongo-sanitize | 2.2.0 | Proteção NoSQL injection |

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 19.0.0 | Biblioteca UI |
| Vite | 6.2.0 | Build tool |
| TypeScript | 5.7.2 | Tipagem estática |
| Material UI | 6.4.8 | Componentes UI |
| React Router | 7.4.0 | Roteamento SPA |
| Axios | 1.8.4 | Cliente HTTP |
| date-fns | 4.1.0 | Manipulação de datas |

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn**
- **MongoDB** (local ou Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/EdneyVF/resolve_ai.git
cd resolve_ai
```

### 2. Configure o Backend

```bash
# Acesse a pasta do backend
cd backend

# Instale as dependências
npm install

# Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env com suas configurações
```

#### Configuração do `.env` (Backend)

```env
# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/resolveai

# JWT - Use chaves seguras em produção!
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=sua_outra_chave_secreta_para_refresh
REFRESH_TOKEN_EXPIRE=7d

# Servidor
PORT=3001
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Configure o Frontend

```bash
# Volte para a raiz e acesse o frontend
cd ../frontend

# Instale as dependências
npm install

# Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env
```

#### Configuração do `.env` (Frontend)

```env
# URL da API Backend
VITE_API_URL=http://localhost:3001
```

---

## Executando o Projeto

### Desenvolvimento

Você precisará de **dois terminais** abertos:

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Produção

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

---

## Scripts Disponíveis

### Backend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento (hot reload) |
| `npm start` | Inicia em modo produção |
| `npm run seed` | Popula o banco com dados iniciais |

### Frontend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa verificação de código |

---

## Estrutura do Projeto

Devido as tecnologias e framework utilizado a configuração de pastas criadas não segue o padrão estabelecido.

```
resolve_ai/
├── backend/                    # API REST
│   ├── config/
│   │   ├── db.js              # Conexão MongoDB
│   │   └── security.js        # Rate limiting, validações
│   ├── controllers/
│   │   ├── authController.js  # Autenticação
│   │   ├── categoryController.js
│   │   ├── reportController.js
│   │   ├── reportApprovalController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js  # Proteção JWT
│   │   └── errorMiddleware.js # Handler de erros
│   ├── models/
│   │   ├── User.js            # Modelo de usuário
│   │   ├── Report.js          # Modelo de relato
│   │   └── Category.js        # Modelo de categoria
│   ├── routes/
│   │   ├── index.js           # Agregador de rotas
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── reportApprovalRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   └── seedData.js        # Dados iniciais
│   ├── utils/
│   │   ├── errorResponse.js
│   │   └── validation.js
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # SPA React
│   ├── public/
│   │   ├── icons/             # Logo
│   │   └── images/            # Ilustrações
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/         # Componentes admin
│   │   │   ├── auth/          # Login, Registro
│   │   │   ├── common/        # Componentes compartilhados
│   │   │   └── layout/        # Header, Footer, Layout
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Estado de autenticação
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useReports.ts
│   │   │   └── useUsers.ts
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── ReportDetailsPage.tsx
│   │   │   ├── CreateReportPage.tsx
│   │   │   ├── MyReportsPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── UserProfilePage.tsx
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminPendingPage.tsx
│   │   │   ├── AdminCategoriesPage.tsx
│   │   │   └── AdminUsersPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts         # Axios configurado
│   │   │   ├── authService.ts
│   │   │   ├── categoryService.ts
│   │   │   ├── reportService.ts
│   │   │   └── userService.ts
│   │   ├── types/
│   │   │   └── auth.ts        # Tipos TypeScript
│   │   ├── utils/
│   │   │   └── constants.ts
│   │   ├── App.tsx            # Rotas e tema
│   │   ├── main.tsx           # Entry point
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── docs/                       # Documentação do sistema
│   ├── architecture/
│   │   └── architecture.md     # Arquitetura do sistema
│   └── requirements/
│       └── requirements.md     # Requisitos do sistema
├── database/                   # Documentação do banco de dados
│   ├── schema.json             # Schema das coleções
│   ├── documentation.json      # Regras de negócio
│   └── samples.json            # Exemplos de dados
└── README.md                   # Este arquivo
```

---

## Integrações

O sistema realiza as seguintes integrações entre seus componentes:

| Integração | Descrição | Tecnologia |
|------------|-----------|------------|
| Frontend ↔ Backend | Comunicação via API REST | Axios / Express |
| Backend ↔ Banco de Dados | Persistência de dados | Mongoose / MongoDB |
| Autenticação | Sistema de tokens JWT | jsonwebtoken / bcryptjs |
| Gerenciamento de Estado | Contexto de autenticação global | React Context API |
| Roteamento SPA | Navegação client-side | React Router DOM |
| UI Components | Biblioteca de componentes | Material UI (MUI) |

---

## API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Dados do usuário logado |
| PUT | `/api/auth/password` | Alterar senha |
| PUT | `/api/auth/profile` | Atualizar perfil |
| POST | `/api/auth/refresh` | Renovar token |

### Relatos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/reports` | Listar relatos |
| GET | `/api/reports/:id` | Detalhes do relato |
| POST | `/api/reports` | Criar relato |
| PUT | `/api/reports/:id` | Atualizar relato |
| DELETE | `/api/reports/:id` | Deletar relato |
| PUT | `/api/reports/:id/cancel` | Cancelar relato |
| GET | `/api/reports/my-reports` | Meus relatos |

### Administração

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/reports/admin/all` | Todos os relatos |
| GET | `/api/reports/approval/pending` | Relatos pendentes |
| PUT | `/api/reports/:id/approve` | Aprovar relato |
| PUT | `/api/reports/:id/reject` | Rejeitar relato |

### Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/categories` | Listar categorias |
| POST | `/api/categories` | Criar categoria (admin) |
| PUT | `/api/categories/:id` | Atualizar categoria (admin) |
| DELETE | `/api/categories/:id` | Deletar categoria (admin) |

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Listar usuários (admin) |
| GET | `/api/users/:id` | Detalhes do usuário |
| PUT | `/api/users/:id` | Atualizar usuário (admin) |
| DELETE | `/api/users/:id` | Deletar usuário (admin) |

---

## Modelos de Dados

### User (Usuário)

```javascript
{
  name: String,           // Nome completo
  email: String,          // Email único
  password: String,       // Hash bcrypt
  role: 'user' | 'admin', // Papel do usuário
  phone: String,          // Telefone (opcional)
  bio: String,            // Biografia (opcional)
  lastLogin: Date
}
```

### Report (Relato)

```javascript
{
  title: String,          // Título do relato
  description: String,    // Descrição detalhada
  imageUrl: String,       // URL da imagem (opcional)
  date: Date,             // Data do acontecimento
  location: {
    address: String,      // Endereço
    city: String,         // Cidade
    state: String,        // Estado
    country: String       // País (default: Brasil)
  },
  category: ObjectId,     // Referência à categoria
  organizer: ObjectId,    // Usuário que criou
  status: String,         // active, inactive, canceled, finished
  approvalStatus: String, // pending, approved, rejected
  tags: [String]          // Tags do relato
}
```

### Category (Categoria)

```javascript
{
  name: String,           // Nome único
  description: String,    // Descrição
  active: Boolean         // Se está ativa
}
```

---

## Segurança

O sistema implementa diversas camadas de segurança:

- **Autenticação JWT** com access token (24h) e refresh token (7d)
- **Hash de senhas** com bcrypt (salt rounds: 10)
- **Validação de senha forte**: mínimo 6 caracteres + número + letra + caractere especial
- **Rate limiting**: 25 tentativas de login / 15min, 100 req/min geral
- **Sanitização** contra NoSQL injection
- **CORS** configurado com whitelist de origens

---

## 🧪 Testes

### Backend

O backend utiliza **Jest** com **MongoDB Memory Server** para testes isolados:

```bash
# Na pasta backend/
cd backend

# Executar todos os testes
npm test

# Executar com cobertura de código
npm run test:coverage

# Executar em modo watch (desenvolvimento)
npm run test:watch
```

### Estrutura de Testes

```
backend/tests/
├── setup/              # Configuração do ambiente de testes
├── unit/               # Testes unitários
│   ├── controllers/    # Testes de controllers
│   ├── middlewares/    # Testes de middlewares
│   └── models/         # Testes de models
└── factories/          # Factories para geração de dados
```

---

## 👤 Credenciais de Teste

Após executar `npm run seed` no backend, você terá acesso aos seguintes usuários:

| Tipo | Email | Senha |
|------|-------|-------|
| **Administrador** | admin@exemplo.com | admin123 |
| **Usuário** | usuario@exemplo.com | user123 |

---

## 📖 Documentação Técnica

Para informações detalhadas sobre o sistema, consulte:

| Documento | Descrição |
|-----------|-----------|
| [Arquitetura do Sistema](docs/architecture/architecture.md) | Estrutura, padrões de design e decisões técnicas |
| [Requisitos do Sistema](docs/requirements/requirements.md) | Requisitos funcionais, não funcionais e regras de negócio |
| [Schema do Banco](database/schema.json) | Estrutura detalhada das coleções MongoDB |
| [Documentação do Banco](database/documentation.json) | Relacionamentos e regras de negócio |
| [Exemplos de Dados](database/samples.json) | Exemplos de documentos para cada coleção |

---

## Deploy

### Frontend (Vercel ou outros)

1. Configure as variáveis de ambiente no serviço escolhido
2. Use o comando recomendado de inicialização
3. Configure a URL da API backend para produção

### Backend (Render, Railway, etc.)

1. Configure as variáveis de ambiente no serviço escolhido
2. Use `npm start` como comando de inicialização
3. Configure a URL do MongoDB Atlas para produção

### MongoDB Atlas

Para produção, recomenda-se usar [MongoDB Atlas](https://www.mongodb.com/atlas):

1. Crie um cluster gratuito
2. Configure o acesso de rede (IP whitelist)
3. Crie um usuário de banco de dados
4. Copie a connection string para `MONGODB_URI`

---

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## Validação com Público-Alvo

### Definição do Público-Alvo

O **Resolve Aí** foi desenvolvido para atender:

- **Cidadãos comuns**: Moradores de bairros, vilas e condomínios que desejam reportar problemas ou compartilhar informações relevantes sobre sua comunidade
- **Líderes comunitários**: Pessoas que atuam como representantes de suas comunidades e precisam de um canal organizado de comunicação
- **Administradores locais**: Síndicos, gestores de associações de moradores e representantes que precisam gerenciar e moderar as informações da comunidade

### Processo de Validação

A validação do sistema foi realizada através de:

1. **Testes de usabilidade**: Sessões com usuários representativos do público-alvo para avaliar a facilidade de uso da interface
2. **Coleta de feedback**: Questionários e entrevistas para identificar necessidades e pontos de melhoria
3. **Iterações de desenvolvimento**: Ciclos de desenvolvimento baseados no feedback coletado

### Principais Feedbacks Recebidos

- Interface intuitiva e de fácil navegação
- Processo de criação de relatos simples e direto
- Sistema de categorização facilita a organização dos relatos
- Necessidade de filtros para melhor busca de informações
- Importância do sistema de aprovação para garantir qualidade do conteúdo

### Ajustes Implementados

Com base no feedback recebido, foram implementados os seguintes ajustes:

| Feedback | Ajuste Implementado |
|----------|---------------------|
| Dificuldade em encontrar relatos específicos | Implementação de filtros por categoria, data e localização |
| Necessidade de busca textual | Adição de busca por título, descrição e endereço |
| Controle de qualidade do conteúdo | Sistema de aprovação de relatos por administradores |
| Visualização de estatísticas | Dashboard administrativo com métricas da comunidade |
| Gerenciamento de perfil | Tela de perfil com edição de dados pessoais |

---

## Equipe de Desenvolvimento

| Nome | Matrícula | Função |
|------|-----------|--------|
| Edney Vasconcelos Freitas | 2326253 | Lider Técnico / Desenvolvedor |
| Felipe Sousa da Silva | 2323817 | Analise de requisitos |
| Mary Ruth de Almeida Freitas Silva | 2327185 | Documentação e testes |
| Mateus Bruno Trigueiro | 2325500 | Desenvolvedor |
| Raquel Gonçalves Do Carmo Santana | 2326635 | Documentação e testes |
| Vitor Samuel da Silva Mendonca | 2326326 | Desenvolvedor |

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## Contato

Dúvidas ou sugestões? Abra uma [issue](https://github.com/EdneyVF/resolve_ai/issues) no repositório.

---

<p align="center">
  Feito com ❤️ por cidadãos, para cidadãos</br>
  Equipe Resolve Aí - 2025
</p>