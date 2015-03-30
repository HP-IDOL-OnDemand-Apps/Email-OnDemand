/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents the logger service.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
var winston = require('winston'),
    MODE = require('../config/defaults').MODE;


/*!
 * Represents logger service.
 * Using `winson` is wise as it supports multiple transports
 * and this service could log to some external storage if needed.
 * For now use just the console.
 */
module.exports = new(winston.Logger)({
    transports: [
            new(winston.transports.Console)({
            level: (MODE == 'debug') ? 'debug' : 'info'
        })
        // To add more transports see:
        // https://github.com/flatiron/winston#working-with-transports
        ]
});
