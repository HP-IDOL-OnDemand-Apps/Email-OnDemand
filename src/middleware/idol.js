/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents express middleware to obtain `idol-client` instance.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
var idol = require('idol-client'),
    IDOL_API_KEY = require('../config/defaults').IDOL_API_KEY;


if (!IDOL_API_KEY) {
    throw 'An IDOL OnDemand API key is required for this server to function!';
}

/**
 * Represents express middleware to obtain idol-client instance.
 * Places the instance under `req.IDOL` for easy access.
 *
 * @param {Object} req  Express request.
 * @param {Object} res  Express response.
 * @param {Function} next Express next function.
 */
module.exports = function (req, res, next) {
    req.IDOL = idol(IDOL_API_KEY);

    next();
};
