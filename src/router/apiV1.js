/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents the API's top level router.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
var express = require('express'),
    router = module.exports = express.Router({
        mergeParams: true
    }),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    helmet = require('helmet'),
    cors = require('cors'),
    requireAuth = require('../middleware/requireAuth'),
    email = require('./API/email');


// Middleware specific to the API router (applied API wide!).
// ----------------------------------------------------------
// Accept json POST
router.use(bodyParser.json());
// Accept application/x-www-form-urlencoded POST
router.use(bodyParser.urlencoded({
    extended: true
}));
// Accept multipart/form-data POST
router.use(multer({
    dest: './uploads/'
}));
// Disable cache.
router.use(helmet.noCache());
// Enable CORS access to the API
router.use(cors());


// API endpoint[s].
// ----------------
// `/email` endpoints.
router.use('/email/', requireAuth, email);
// Not found route handler.
router.all('/*', function (req, res) {
    res.status(404).json({
        error: 'Not Found',
        originalUrl: req.originalUrl,
        method: req.method
    });
});
