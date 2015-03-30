/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents the router of the user Web app (UI).
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
    session = require('express-session'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    idol = require('../middleware/idol'),
    requireLogin = require('../middleware/requireLogin'),
    webUI = require('../controller/UI/webUI');


// Middleware specific to the UI endpoint[s]
// ----------------------------------------------------------
// Support sessions.
router.use(session({
    secret: 'Email OnDemand very secret key :)',
    resave: false,
    saveUninitialized: true
}));
// Use `idol-client` to talk to IDOL OnDemand.
router.use(idol);


// Web app routes.
// ----------------
router.get('/', requireLogin, webUI.home);
router.get('/login', webUI.loginPage);
router.post('/login', bodyParser.json(), webUI.login);
router.get('/logout', webUI.logout);
router.get('/purge', requireLogin, webUI.purge);
router.post('/gather',
    requireLogin,
    multer({
        dest: './uploads/'
    }),
    webUI.gather
);
router.post('/send',
    requireLogin,
    multer({
        dest: './uploads/'
    }),
    webUI.send
);
router.get('/history', requireLogin, webUI.history);
router.get('/search', requireLogin, webUI.search);
