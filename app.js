require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const db = require('./models');

const indexRouter = require('./routes');
const apiRouter = require('./routes/api');
const createUserRoutes = require('./routes/users');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger(process.env.LOG_LEVEL || 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Test DB connection
db.sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection failed:', err));

// API Routes
app.use('/api', apiRouter);
app.use('/api/users', createUserRoutes(db));

// View routes
app.use('/', indexRouter);

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