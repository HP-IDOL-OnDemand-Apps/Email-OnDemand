/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents the API's `/email` router.
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
    idol = require('../../middleware/idol'),
    emailCtrl = require('../../controller/API/emailCtrl');


// Middleware specific to the `/email` endpoint[s]
// ----------------------------------------------------------
// Use `idol-client` to talk to IDOL OnDemand.
router.use(idol);

// Define the router endpoints.
// ----------------------------------------------------------
router.post('/', emailCtrl.send);
router.get('/history', emailCtrl.history);
router.get('/search', emailCtrl.search);
