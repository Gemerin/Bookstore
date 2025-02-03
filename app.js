import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import BookStoreConsole from './console.js';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import booksRouter from './routes/books.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/orders.js'

import db from './config/db.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

db.getConnection()
.then(() => {
  console.log('Database connected Succesfully!')

// Start the console interaction
const consoleApp = new BookStoreConsole();
consoleApp.showMainMenu();
})
.catch((err) => {
  console.error('Database connection failed:', err)
  process.exit(1)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

export default app;