/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 *
 * Represents recipients tree.
 *
 * @version 0.1.0
 * @author TCCODER
 */

'use strict';

/*!
 * Module dependencies
 */
var log = require('./logger');


module.exports = Recipients;
var _cache = null;

/**
 * Creates recipients tree.
 * Organizes the stores, roles and users of IDOL OnDemand account into hierarchical tree.
 *
 * @constructs Recipients
 * @param {Object} Idol Instance obtained from `idol-client` library.
 * @returns {Recipients} This instance.
 */
function Recipients(Idol) {
    this.Idol = Idol;
    return this;
}

/**
 * Fetches the data from IDOL OnDemand.
 *
 * @throws Timeout error
 * @returns {Object} Q.promise
 */
Recipients.prototype.fetch = function () {
    var Idol = this.Idol;

    if (_cache) {
        log.debug('Recipients is using chached data');
        return Idol.Q(_cache);
    } else {
        log.debug('Recipients fetching fresh data');
        return Idol.listStores({})
            .then(function (listStores) {
                var promises = [];

                listStores.data.stores.forEach(function (store) {
                    promises.push(Idol.listUsers({
                        parameters: {
                            store: store
                        }
                    }).then(function (listUsers) {
                        return [store, listUsers.data.users];
                    }));
                });

                return Idol.Q.all(promises).timeout(15000).then(function (tree) {
                    // Intercept to restructure and update cache.
                    var as_obj = {};
                    tree.forEach(function (ast) {
                        as_obj[ast[0]] = ast[1];
                    });

                    _cache = as_obj;
                    return as_obj;
                });
            });
    }
};

/**
 * Purge the cache.
 *
 * @returns {Recipients} This instance.
 */
Recipients.prototype.purgeCache = function () {
    log.debug('Purging recipients internal cache');
    _cache = null;
    return this;
};
