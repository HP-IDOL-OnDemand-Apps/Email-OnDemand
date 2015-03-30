/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents the controller for the user Web app (UI).
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
var config = require('../../config/defaults'),
    APP_USERS_IDOL_STORE = config.APP_USERS_IDOL_STORE,
    API_VERSION = config.API_VERSION,
    log = require('../../utils/logger'),
    Recipients = require('../../utils/Recipients'),
    path = require('path'),
    fs = require('fs'),
    Email = require('../../utils/Email');

/**
 * Represents the controller for the user Web app (UI).
 */
module.exports = {
    /**
     * Represents the home page controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    home: function (req, res) {
        res.locals.API_VERSION = API_VERSION;
        new Recipients(req.IDOL)
            .fetch()
            .then(
                function (tree) {
                    log.debug(tree);
                    res.locals.tree = tree;
                    res.render('UI');
                },
                function (error) {
                    log.error('homeCtrl error', error);
                    res.end(error.message);
                }
            );
    },

    /**
     * Represents the login page controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    loginPage: function (req, res) {
        if (req.session.user) {
            res.redirect('/');
        } else {
            res.render('login');
        }
    },

    /**
     * Represents the login user controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    login: function (req, res) {
        req.IDOL.authenticate({
            parameters: {
                mechanism: 'simple',
                store: APP_USERS_IDOL_STORE,
                user: req.body.user,
                password: req.body.password
            }
        }).then(
            function (data) {
                var rsp = data.data;

                if (rsp.success) {
                    log.info("User %s login OK ->", req.body.user, rsp);
                    req.session.user = rsp.token;
                    res.json(rsp);
                } else {
                    log.error("User %s login OK ->", req.body.user, rsp);
                    res.status(403).json(rsp);
                }
            },
            function (error) {
                log.error("User login error ->", error.data);
                res.status(error.code).json(error.data);
            }
        );
    },

    /**
     * Represents the logout user controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    logout: function (req, res) {
        req.session.user = null;
        res.redirect('/login');
    },

    /**
     * Represents the purge cache controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    purge: function (req, res) {
        new Recipients().purgeCache();
        res.redirect('/');
    },

    /**
     * Represents the gather content controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    gather: function (req, res) {
        var options = {
                parameters: {}
            },
            uploadedFilePath;

        // For files.
        if (req.body.from == 'file') {
            options.method = 'POST';
            options.parameters.file = 'myFileName';
            uploadedFilePath = path.resolve(__dirname, '../../..', req.files.file.path);
            options.files = {
                myFileName: uploadedFilePath
            };
        }
        // For refs and urls.
        else {
            options.parameters[req.body.from] = req.body.value;
        }

        // Do it.
        log.debug('Gather options ->', req.body, req.files, options);
        req.IDOL.extractText(options)
            .then(
                function (response) {
                    res.status(response.code).json(response.data.document[0].content);
                },
                function (error) {
                    log.error("Gather content form %s error ->", req.body.from, error.data);
                    res.status(error.code).json(error.data);
                }
            )
            .fin(function () {
                // Delete the uploaded file if any.
                if (uploadedFilePath) {
                    log.debug('Deleting uploaded file', uploadedFilePath);
                    fs.unlink(uploadedFilePath);
                }
            });
    },

    /**
     * Represents the send email controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    send: function (req, res) {
        new Email(req.IDOL)
            .send(req.body, req.files)
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
     * Represents the history controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    history: function (req, res) {
        new Email(req.IDOL)
            .history(req.query)
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
     * Represents the search indexed messages controller.
     *
     * @param {Object} req  Express request.
     * @param {Object} res  Express response.
     */
    search: function (req, res) {
        new Email(req.IDOL)
            .search(req.query)
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
