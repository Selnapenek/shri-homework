
// В интернете пишут, что правильнее так как написанно ниже, но так приходится использовать lib.defult()
// - как-то не красиво
import * as createError from 'http-errors';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as express from "express";
import * as helmet from 'helmet';
import * as path from 'path';

import indexRouters from'./routes';

const app : express.Application = express.default();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet.default());
app.use(logger.default('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/status', indexRouters.statusRoutes);
app.use('/api', indexRouters.apiRoutes);

// catch 404 and forward to error handler
app.use(function (req : express.Request, res : express.Response, next : express.NextFunction) {
    next(createError.default(404, 'Page not found'));
});

// error handler
app.use(function (err : createError.HttpError, req : express.Request, res : express.Response, next : express.NextFunction) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    if (req.method === 'GET') {
        // render the error page
        res.render('error');
    } else {
        res.send('Error ' + err.status + ':' + err.message);
    }
});

export default app;
