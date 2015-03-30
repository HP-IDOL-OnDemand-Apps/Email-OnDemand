/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents the email controller.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
var Email = require('../../utils/Email');

/**
 * Represents the email controller.
 */
module.exports = {
    /**
     * Represents the send controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    send: function (req, res) {
        var emailer = new Email(req.IDOL);

        emailer
            .send(req.body, req.files)
            .then(
                function (response) {
                    res.json(response);
                },
                function (error) {
                    res.status(error.status).json(error.json);
                });
    },

    /**
     * Represents the history controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    history: function (req, res) {
        var emailer = new Email(req.IDOL);

        emailer.history(req.query)
            .then(
                function (result) {
                    res.json(result);
                },
                function (error) {
                    res.status(error.status).json(error.json);
                }
            );
    },

    /**
     * Represents the search controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    search: function (req, res) {
        var emailer = new Email(req.IDOL);

        emailer.search(req.query)
            .then(
                function (result) {
                    res.json(result.data.documents);
                },
                function (error) {
                    res.status(error.status).json(error.json);
                }
            );
    }
};
