/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents the Email OnDemand server.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
var config = require('./config/defaults'),
    express = require('express'),
    app = module.exports = express(),
    log = require('./utils/logger'),
    sslRedirect = require('heroku-ssl-redirect'),
    helmet = require('helmet'),
    apiV1 = require('./router/apiV1'),
    ui = require('./router/ui');

// Configure templates.
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
// In production redirect all requests to SSL for security.
app.use(sslRedirect());
// Configure static serve of files.
app.use(express.static(__dirname + '/public'));
// Basic protection layer.
app.use(helmet());
// Mode local variable.
app.use(function (req, res, next) {
    res.locals.MODE = config.MODE;
    next();
});

// Major routers
// -------------
// Define the API routes.
app.use('/api/v' + config.API_VERSION, apiV1);
// Define the UI app routes.
app.use('/', ui);

// Listen for connections.
app.listen(config.PORT);
log.info('Service listening on port:', config.PORT);
