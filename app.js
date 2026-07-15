require('dotenv').config();
var express = require('express');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var expressLayouts = require('express-ejs-layouts');
var logger = require('morgan');
var createError = require('http-errors');
var db = require('./models');

var indexRouter = require('./routes');
var apiRouter = require('./routes/api');
var callbackRouter = require('./routes/callback');

const { sessaoData } = require('./middlewares');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);

// Configura o CORS
var corsAuth = {
  origin: ['https://login.taiksu.com.br'],
  optionsSuccessStatus: 200,
  credentials: true
}

app.use(cors(corsAuth)); //Passa o objeto de configuração para o CORS Globalmente

// Middleware
app.use(logger(process.env.LOG_LEVEL || 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
app.use(express.static(path.join(__dirname, 'public')));

// Defaults para as variáveis de sessão usadas no layout/partials (header, userBar),
// evitando ReferenceError quando o EJS renderiza fora do fluxo autenticado (ex: erro em /api).
app.use((req, res, next) => {
  res.locals.userFoto = null;
  res.locals.userNome = null;
  res.locals.userGrupo = null;
  res.locals.userCidade = null;
  res.locals.user_id = null;
  res.locals.userToken = null;
  res.locals.unidade_id = null;
  res.locals.userPin = null;
  next();
});

// Test DB connection
db.sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection failed:', err));

// Callback Login (precisa rodar antes de sessaoData, que exige sessão já existente)
app.use('/callback', callbackRouter);

// API Routes
app.use('/api', apiRouter);

// View routes
app.use('/', sessaoData, indexRouter);

// Catch 404
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  if (req.accepts('json')) {
    return res.json({ success: false, message: err.message });
  }
  res.render('error');
});

module.exports = app;