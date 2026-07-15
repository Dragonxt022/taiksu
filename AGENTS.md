# Agentes de Desenvolvimento - Regras de Programação

## Princípios Gerais

### Clean Code
- **Nomes expressivos**: Variáveis, funções e classes devem revelar intenção
- **Funções pequenas**: Máximo 20 linhas, fazem uma única coisa
- **DRY**: Não repita código - extraia para funções/services reutilizáveis
- **Comentários mínimos**: Código deve ser autoexplicativo; comente apenas "por que", não "o que"
- **Formatação consistente**: Use ESLint/Prettier configurado no projeto

### SOLID
- **S**ingle Responsibility: Uma classe/função = uma responsabilidade
- **O**pen/Closed: Aberto para extensão, fechado para modificação
- **L**iskov Substitution: Subtipos devem ser substituíveis por seus tipos base
- **I**nterface Segregation: Interfaces específicas > interfaces genéricas
- **D**ependency Inversion: Dependam de abstrações, não de implementações

---

## Arquitetura MVC (Camadas Estritas)

### Routes (Apenas Roteamento)
```javascript
// ✅ CORRETO - Routes apenas delegam
router.get('/users', userController.getAll.bind(userController));
router.post('/users', userController.create.bind(userController));

// ❌ ERRADO - Lógica de negócio na route
router.get('/users', async (req, res) => {
  const users = await User.findAll(); // NÃO FAÇA ISSO
  res.json(users);
});
```

**Regras:**
- Routes **apenas** definem endpoints, middlewares de validação e delegam para Controllers
- **NUNCA** acessam Models diretamente
- **NUNCA** contêm lógica de negócio, queries, ou transformações de dados
- Recebem `req`, `res`, `next` e passam para Controller

---

### Controllers (Apenas Regras de Negócio / Orquestração)
```javascript
// ✅ CORRETO - Controller orquestra, não implementa detalhes
class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getAll(req, res, next) {
    try {
      const users = await this.userService.getAll(req.query);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const userData = this.validateCreateInput(req.body);
      const user = await this.userService.create(userData);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  validateCreateInput(data) {
    // Validação de entrada (formato, obrigatórios)
    // NÃO validação de negócio (ex: email único) - isso é Service
    if (!data.email || !data.password) {
      throw new ValidationError('Email e senha são obrigatórios');
    }
    return { email: data.email, name: data.name, password: data.password };
  }
}
```

**Regras:**
- Controllers **não acessam Models diretamente** - usam Services
- Contêm **apenas**:
  - Validação de **entrada** (formato, campos obrigatórios)
  - Orquestração de Services
  - Formatação de resposta HTTP (status codes, JSON)
  - Tratamento de erros HTTP (400, 401, 404, 500)
- **NÃO contêm**:
  - Queries de banco de dados
  - Lógica de negócio complexa (regras, cálculos, validações de domínio)
  - Transações de banco
  - Acesso direto a repositórios/ORM
- **Devem ser reutilizáveis** - mesma lógica para API REST, GraphQL, CLI, Jobs, Webhooks

---

### Services (Lógica de Negócio / Domínio)
```javascript
// ✅ CORRETO - Service contém regras de negócio
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async create(userData) {
    // Regra de negócio: email único
    const existing = await this.userRepository.findByEmail(userData.email);
    if (existing) {
      throw new BusinessError('Email já cadastrado');
    }

    // Regra de negócio: hash de senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Regra de negócio: usuário padrão ativo
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      active: true
    });

    // Evento de domínio (opcional)
    await this.eventBus.emit('user.created', user);

    return user;
  }

  async update(id, data) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('Usuário não encontrado');

    // Regra de negócio: não pode alterar email para um existente
    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing) throw new BusinessError('Email já em uso');
    }

    return this.userRepository.update(id, data);
  }
}
```

**Regras:**
- Services contêm **toda lógica de negócio/domínio**
- Acessam Repositories (não Models/ORM diretamente)
- Gerenciam transações
- Validações de **regras de negócio** (unicidade, limites, workflows)
- Emitem eventos de domínio
- **Não conhecem HTTP** (req, res, status codes)

---

### Repositories / Models (Acesso a Dados)
```javascript
// ✅ CORRETO - Repository abstrai persistência
class UserRepository {
  constructor(sequelize) {
    this.User = sequelize.models.User;
  }

  async findAll(options = {}) {
    return this.User.findAll(options);
  }

  async findById(id) {
    return this.User.findByPk(id);
  }

  async findByEmail(email) {
    return this.User.findOne({ where: { email } });
  }

  async create(data) {
    return this.User.create(data);
  }

  async update(id, data) {
    const user = await this.findById(id);
    if (!user) return null;
    return user.update(data);
  }

  async delete(id) {
    const user = await this.findById(id);
    if (!user) return null;
    return user.destroy();
  }
}
```

**Regras:**
- Repositories **único local** que conhece ORM/Database
- Métodos genéricos: findAll, findById, findByX, create, update, delete
- **NÃO contêm lógica de negócio**
- Retornam entidades/dados puros

---

## Injeção de Dependência (Obrigatório)

```javascript
// app.js - Composition Root
const sequelize = new Sequelize(config);
const userRepository = new UserRepository(sequelize);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

app.use('/api/users', createUserRoutes(userController));
```

**Regras:**
- Dependências injetadas via **constructor**
- **NUNCA** instancie dependências dentro da classe (`new Service()`)
- Composition Root no `app.js` ou `server.js`
- Facilita testes (mocks) e troca de implementações

---

## Tratamento de Erros

```javascript
// errors/AppError.js - Base
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

// errors/ValidationError.js
class ValidationError extends AppError {
  constructor(message) { super(message, 400, 'VALIDATION_ERROR'); }
}

// errors/BusinessError.js
class BusinessError extends AppError {
  constructor(message) { super(message, 422, 'BUSINESS_RULE_VIOLATION'); }
}

// errors/NotFoundError.js
class NotFoundError extends AppError {
  constructor(message) { super(message, 404, 'NOT_FOUND'); }
}

// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code
    });
  }
  // Erro de programação - log e 500 genérico
  logger.error(err);
  res.status(500).json({ success: false, message: 'Erro interno' });
};
```

**Regras:**
- Erros operacionais (válidos) vs bugs (programação)
- Controllers/Services lançam erros tipados (`throw new BusinessError()`)
- Middleware global trata e formata resposta HTTP
- **NUNCA** `try/catch` genérico que esconde erros

---

## Validação

```javascript
// validators/userValidator.js
const { body, param, query } = require('express-validator');

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha mínima 6 caracteres'),
];

const updateUserValidation = [
  param('id').isInt().withMessage('ID inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
];

module.exports = { createUserValidation, updateUserValidation };

// routes/users.js
router.post('/', createUserValidation, userController.create.bind(userController));
```

**Regras:**
- Validação de **formato/entrada** = express-validator nos Routes (middleware)
- Validação de **negócio** (unicidade, regras) = Services
- Controller valida apenas estrutura básica se necessário

---

## Testes

```
tests/
├── unit/
│   ├── services/
│   │   └── userService.test.js
│   └── controllers/
│       └── userController.test.js
├── integration/
│   └── routes/
│       └── users.test.js
└── e2e/
    └── auth.test.js
```

**Regras:**
- **Unit**: Services e Controllers isolados (mock repositories/services)
- **Integration**: Routes + Controllers + Services (mock DB)
- **E2E**: API completa com DB real (testcontainers ou DB de teste)
- Cobertura mínima: 80% em Services, 70% em Controllers

---

## Convenções de Código

### Nomenclatura
| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Classes | PascalCase | `UserService` |
| Funções/Variáveis | camelCase | `getUserById` |
| Constantes | UPPER_SNAKE | `MAX_RETRY_ATTEMPTS` |
| Arquivos | kebab-case | `user-service.js` |
| Pastas | kebab-case | `user-service/` |
| Privados | prefix `_` | `_hashPassword()` |

### Imports
```javascript
// 1. Node built-ins
const path = require('path');

// 2. Third-party
const express = require('express');
const Joi = require('joi');

// 3. Local - absolute paths from root
const UserService = require('services/UserService');
const { ValidationError } = require('errors');

// 4. Relative (apenas para arquivos na mesma pasta)
const helper = require('./helper');
```

### Async/Await
```javascript
// ✅ Sempre async/await, nunca .then()
async function getUser(id) {
  const user = await userRepository.findById(id);
  return user;
}

// ✅ Tratamento de erro explícito
async function createUser(data) {
  try {
    return await userService.create(data);
  } catch (error) {
    if (error.code === 'P2002') throw new BusinessError('Email existe');
    throw error;
  }
}
```

---

## Estrutura de Pastas (Obrigatória)

```
src/
├── app.js                 # Configuração Express, middlewares globais
├── server.js              # Entry point, inicialização DB, listen
├── config/                # Configurações por ambiente
│   ├── database.js
│   ├── app.js
│   └── index.js
├── controllers/           # Apenas orquestração HTTP
│   ├── BaseController.js
│   ├── UserController.js
│   └── index.js
├── services/              # Lógica de negócio pura
│   ├── BaseService.js
│   ├── UserService.js
│   └── index.js
├── repositories/          # Acesso a dados (opcional, pode estar em models)
│   ├── UserRepository.js
│   └── index.js
├── models/                # Definições ORM/Entidades
│   ├── index.js           # Auto-loader Sequelize
│   ├── User.js
│   └── BaseModel.js
├── routes/                # Apenas definição de rotas
│   ├── api.js
│   ├── index.js
│   └── users.js
├── middleware/            # Middlewares Express
│   ├── auth.js
│   ├── validation.js
│   ├── errorHandler.js
│   └── rateLimiter.js
├── validators/            # Schemas de validação (Joi/express-validator)
│   └── userValidator.js
├── utils/                 # Helpers genéricos
│   ├── logger.js
│   ├── dateUtils.js
│   └── stringUtils.js
├── errors/                # Classes de erro customizadas
│   ├── AppError.js
│   ├── ValidationError.js
│   ├── BusinessError.js
│   └── NotFoundError.js
└── events/                # Eventos de domínio (opcional)
    ├── eventBus.js
    └── handlers/
```

---

## Checklist de Code Review

- [ ] Routes **não** acessam Models/Services diretamente
- [ ] Controllers **não** têm queries SQL/ORM
- [ ] Services **não** conhecem `req`/`res`/`next`
- [ ] Repositories **não** têm lógica de negócio
- [ ] Dependências injetadas via constructor
- [ ] Erros tipados (`AppError` subclasses)
- [ ] Validação de entrada nos Routes, negócio nos Services
- [ ] Nomes expressivos, sem abreviações obscuras
- [ ] Funções < 20 linhas
- [ ] Testes unitários para Services críticos
- [ ] Sem `console.log` em produção (use logger)
- [ ] Variáveis de ambiente via `config/`, não `process.env` direto

---

## Exemplo Completo de Fluxo

```
POST /api/users
    │
    ▼
Route: users.js
    ├── Middleware: createUserValidation (express-validator)
    └── Controller: userController.create(req, res, next)
            │
            ▼
    Service: userService.create(userData)
            ├── Valida regra: email único (repository.findByEmail)
            ├── Regra: hash password (bcrypt)
            ├── Regra: default active=true
            ├── Repository: userRepository.create(data)
            │       └── Model: User.create(data) (Sequelize)
            └── Evento: eventBus.emit('user.created', user)
            │
            ▼
    Controller: res.status(201).json({ success: true, data: user })
    │
    ▼
Response: 201 Created + JSON
```

---

## Ferramentas Obrigatórias

```json
{
  "devDependencies": {
    "eslint": "^8.x",
    "prettier": "^3.x",
    "eslint-config-prettier": "^9.x",
    "eslint-plugin-node": "^11.x",
    "jest": "^29.x",
    "supertest": "^6.x"
  }
}
```

**Scripts package.json:**
```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration"
  }
}
```

---

## Referências

- [Clean Code - Robert Martin](https://www.oreilly.com/library/view/clean-code/9780136083238/)
- [Clean Architecture - Robert Martin](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/)
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)
- [12 Factor App](https://12factor.net/)