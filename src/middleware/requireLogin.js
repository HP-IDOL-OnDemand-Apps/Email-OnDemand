/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents express middleware to force user login authentication.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';


/**
 * Represents express middleware to force user login authentication.
 *
 * @param {Object} req  Express request.
 * @param {Object} res  Express response.
 * @param {Function} next Express next function.
 */
module.exports = function (req, res, next) {
    var user = res.locals.user = req.session.user;
    if (user) {
        next();
    } else {
        res.redirect('/login');
    }
};
