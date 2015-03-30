/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents express middleware to authenticate access to the API.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
var IDOL_API_KEY = require('../config/defaults').IDOL_API_KEY;


if (!IDOL_API_KEY) {
    throw 'An IDOL OnDemand API key is required for this server to function!';
}

/**
 * Represents express middleware to to authenticate access to the API.
 *
 * @param {Object} req  Express request.
 * @param {Object} res  Express response.
 * @param {Function} next Express next function.
 */
module.exports = function (req, res, next) {
    if (req.query.apikey === IDOL_API_KEY) {
        next();
    } else {
        res.status(403).json({
            error: 'Authentication required',
            originalUrl: req.originalUrl,
            method: req.method
        });
    }
};
