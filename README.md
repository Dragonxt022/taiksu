# Taiksu

API REST para gerenciamento de usuários construída com Express.js, Sequelize e SQLite/MySQL.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **ORM**: Sequelize 6
- **Database**: SQLite (dev), MySQL/PostgreSQL (prod)
- **Template**: EJS
- **Validation**: express-validator (planejado)
- **Testing**: Jest + Supertest (planejado)

## Estrutura do Projeto

```
src/
├── app.js                 # Configuração Express, middlewares globais
├── server.js              # Entry point, inicialização DB, listen
├── config/                # Configurações por ambiente
│   ├── database.js
│   ├── app.js
│   └── index.js
├── controllers/           # Orquestração HTTP (planejado)
├── services/              # Lógica de negócio
│   ├── BaseService.js
│   └── UserService.js
├── repositories/          # Acesso a dados (planejado)
├── models/                # Definições ORM/Entidades
│   ├── index.js
│   └── User.js
├── routes/                # Definição de rotas
│   ├── api.js
│   ├── index.js
│   └── users.js
├── middleware/            # Middlewares Express (planejado)
├── validators/            # Schemas de validação (planejado)
├── utils/                 # Helpers genéricos
└── errors/                # Classes de erro customizadas (planejado)
```

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Criar banco e rodar migrations
npm run db:migrate

# Popular com dados de exemplo
npm run db:seed
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia em produção |
| `npm run dev` | Inicia com nodemon (hot reload) |
| `npm run db:migrate` | Executa migrations |
| `npm run db:migrate:undo` | Desfaz última migration |
| `npm run db:seed` | Executa seeders |
| `npm run db:seed:undo` | Desfaz seeders |
| `npm run db:reset` | Reset completo (undo + migrate + seed) |

## Variáveis de Ambiente

```env
# .env
NODE_ENV=development
PORT=3000
LOG_LEVEL=dev

# Produção (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=taiksu
DB_SSL=false
```

## Endpoints da API

### Base
- `GET /api` - Informações da API
- `GET /api/health` - Health check

### Usuários
- `GET /api/users` - Listar todos
- `GET /api/users/:id` - Buscar por ID
- `GET /api/users/email/:email` - Buscar por email
- `POST /api/users` - Criar usuário
  ```json
  { "name": "João", "email": "joao@email.com", "password": "123456" }
  ```
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

## Exemplos de Uso

```bash
# Health check
curl http://localhost:3000/api/health

# Listar usuários
curl http://localhost:3000/api/users

# Criar usuário
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@email.com","password":"123456"}'

# Buscar por ID
curl http://localhost:3000/api/users/1
```

## Modelo de Dados (User)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | INTEGER | Auto | PK, auto-increment |
| name | STRING | Sim | Nome completo |
| email | STRING | Sim | Único, validação email |
| password | STRING | Sim | Hash bcrypt (planejado) |
| active | BOOLEAN | Não | Default: true |
| created_at | DATE | Auto | Timestamp criação |
| updated_at | DATE | Auto | Timestamp atualização |

## Arquitetura (Planejada - AGENTS.md)

O projeto segue **Clean Architecture** com separação estrita de camadas:

```
Routes → Controllers → Services → Repositories → Models
```

- **Routes**: Apenas roteamento + validação de entrada
- **Controllers**: Validação de entrada, orquestração, formatação HTTP
- **Services**: Regras de negócio, transações, eventos de domínio
- **Repositories**: Único acesso ao banco (ORM)
- **Models**: Definições Sequelize

## Desenvolvimento

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Verificar lint (planejado)
npm run lint

# Formatar código (planejado)
npm run format

# Rodar testes (planejado)
npm test
```

## Deploy

### Variáveis de Produção
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=combined

DB_HOST=seu-host-mysql
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=senha-forte
DB_NAME=taiksu_prod
DB_SSL=true
```

### Docker (Exemplo)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Licença

ISC