/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents Email class.
 * Integrated with Mailjet API currently,
 * which is used for the actual sending of the emails.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
var request = require('superagent'),
    config = require('../config/defaults'),
    MAILJET_API_KEY = config.MAILJET_API_KEY,
    MAILJET_SECRET_KEY = config.MAILJET_SECRET_KEY,
    log = require('./logger'),
    Recipients = require('./Recipients'),
    _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    querystring = require('querystring');

if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
    throw 'Mailjet credentials required for this server to function!';
}

module.exports = Email;

/**
 * Represents the Email class.
 *
 * @constructs Email
 * @param {Object} Idol Instance obtained from `idol-client` library.
 * @returns {Email} Class instance.
 */
function Email(Idol) {
    this.Idol = Idol;

    return this;
}

/**
 * Error response factory.
 *
 * @param {Number} code The HTTP status code.
 * @param {String} msg The reason field in the response.
 * @returns {Object} The response to send to client.
 */
Email.prototype.error = function (code, msg) {
    return {
        status: code,
        json: {
            reason: msg
        }
    };
};

/**
 * Send email.
 *
 * @param {Object} body The body data sent to `/email` endpoint.
 * @param {Object} files The files attached to `/email` endpoint.
 * @returns {Q.Promise} Promise
 */
Email.prototype.send = function (body, files) {
    var Idol = this.Idol,
        _error = this.error,
        Tree = new Recipients(Idol),
        rawTo = {};

    log.debug('Sending parameters', body, files);

    // Some inputs validations...
    if (!body.from) {
        return Idol.Q().thenReject(_error(400, 'Field `from` is required'));
    }
    try {
        // Parse the `to` parameter.
        // It should be object with similar structure like `BigTree`.
        rawTo = JSON.parse(body.to);
    } catch (e) {
        return Idol.Q().thenReject(_error(400, 'Invalid `to` field. Can not parse JSON: ' + e.message));
    }
    if (!body.subject) {
        return Idol.Q().thenReject(_error(400, 'Field `subject` is required'));
    }
    if (!body.html) {
        return Idol.Q().thenReject(_error(400, 'Field `html` is required'));
    }

    return Tree.fetch().then(
        function (BigTree) {
            return Idol.Q.Promise(function (resolve, reject) {
                // Make sure we send to existing users only.
                // For that we filter the `rawTo` via the `BigTree`.
                var to = [];
                _.each(rawTo, function (users, store) {
                    if (_.has(BigTree, store)) {
                        _.each(users, function (user) {
                            if (_.indexOf(BigTree[store], user) != -1) {
                                to.push(user);
                            }
                        });
                    }
                });
                log.info('Secure recipients ->', to);
                // Some validation.
                if (!to.length) {
                    return reject(_error(400, 'At least 1 valid recipient is required'));
                }

                // When still here, Prepare request...
                var req = request.post('https://api.mailjet.com/v3/send');
                req.auth(MAILJET_API_KEY, MAILJET_SECRET_KEY);
                req.field('from', body.from);
                req.field('subject', body.subject);
                req.field('html', body.html);
                to.forEach(function (user) {
                    req.field('to', user);
                });
                var uploadsToUnlink = [];
                _.each(files, function (file) {
                    var toAttach = path.resolve(__dirname, '../../', file.path);
                    log.debug('Attaching %s from %s', file.originalname, toAttach);
                    req.attach('attachment', toAttach, file.originalname);
                    uploadsToUnlink.push(toAttach);
                });

                // Send it.
                req.end(function (err, res) {
                    // Delete uploads if any...
                    uploadsToUnlink.map(fs.unlink);
                    // Respond.
                    if (err || res.statusCode != 200) {
                        reject(err || res);
                    } else {
                        log.info('Email sent.');
                        // Index this message by request only.
                        if (body.toIndex) {
                            log.info('Email queued for indexing.');
                            Idol.addToTextIndex({
                                parameters: {
                                    index: config.APP_EMAILS_IDOL_INDEX,
                                    json: JSON.stringify({
                                        document: [{
                                            title: body.subject,
                                            sender: body.from,
                                            recipients: to,
                                            content: body.html
                                        }]
                                    })
                                }
                            }).then(log.debug, log.error);
                        }
                        resolve(res);
                    }
                });
            });
        });
};

/**
 * List messagehistory via Mailjet API.
 *
 * @param {Object} query The query sent to `/history` endpoint.
 * @returns {Q.Promise} Promise
 */
Email.prototype.history = function (query) {
    log.debug('History query ->', query);
    query = _.omit(query, 'apikey');

    return this.Idol.Q.Promise(function (resolve, reject) {
        if (_.isEmpty(query)) {
            query = '';
        } else {
            query = '?' + querystring.stringify(query);
        }

        request
            .get('https://api.mailjet.com/v3/REST/messagesentstatistics' + query)
            .auth(MAILJET_API_KEY, MAILJET_SECRET_KEY)
            .end(function (err, res) {
                // Respond.
                if (err || res.statusCode != 200) {
                    log.error(err, res.body, res.text);
                    reject(err || res);
                } else {
                    resolve(res.body);
                }
            });
    });
};

/**
 * Search indexed email by query.
 *
 * @param {Object} query The query sent to `/search` endpoint.
 * @returns {Q.Promise} Promise
 */
Email.prototype.search = function (query) {
    log.info('Query indexed messages', query);
    return this.Idol.queryTextIndex({
        parameters: {
            text: query.text,
            indexes: config.APP_EMAILS_IDOL_INDEX,
            highlight: 'terms',
            print: 'all'
        }
    });
};
