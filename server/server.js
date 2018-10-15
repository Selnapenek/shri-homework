'use strict';

/**
 * Module dependencies.
 */
const app = require('./app');
const config = require('./config');

const port = config.serverConfig.port;

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log('We are live on ' + port);
});
