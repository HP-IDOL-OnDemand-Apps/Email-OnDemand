/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents service configuration.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
require('dotenv').load();


module.exports = {
    // Environment
    PORT: process.env.PORT || 3333,
    API_VERSION: 1,
    MODE: process.env.NODE_ENV || 'debug',

    // IDOL
    IDOL_API_KEY: process.env.IDOL_API_KEY,
    APP_USERS_IDOL_STORE: process.env.APP_USERS_IDOL_STORE || 'emailondemand',
    APP_EMAILS_IDOL_INDEX: process.env.APP_EMAILS_IDOL_INDEX || 'emailondemand',

    // Mailjet
    MAILJET_API_KEY: process.env.MAILJET_API_KEY,
    MAILJET_SECRET_KEY: process.env.MAILJET_SECRET_KEY
};
