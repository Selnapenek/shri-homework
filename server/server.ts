'use strict';

/**
 * Module dependencies.
 */
import app from './app/';
import config from './config';

const port : number = config.serverConfig.port;

app.listen(port, (err : Error) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log('We are live on ' + port);
});
