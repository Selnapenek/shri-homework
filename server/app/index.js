'use strict';

const createError = require('http-errors');
const logger = require('morgan');
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();

const indexRouters = require('./routes');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/status', indexRouters.statusRoutes);
app.use('/api', indexRouters.apiRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404, 'Page not found'));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
