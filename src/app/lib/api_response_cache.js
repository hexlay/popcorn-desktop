'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_TIMEOUT = 12000;

function normalize(value, seen) {
    if (value === null || typeof value === 'undefined') {
        return value;
    }

    if (typeof value === 'function') {
        return undefined;
    }

    if (typeof value !== 'object') {
        return value;
    }

    if (seen.indexOf(value) !== -1) {
        return '[Circular]';
    }

    seen.push(value);

    if (Array.isArray(value)) {
        return value.map(function (item) {
            return normalize(item, seen);
        });
    }

    return Object.keys(value).sort().reduce(function (result, key) {
        if (key !== 'providers') {
            var normalized = normalize(value[key], seen);
            if (typeof normalized !== 'undefined') {
                result[key] = normalized;
            }
        }
        return result;
    }, {});
}

function cacheKey(provider, method, args) {
    var requestArgs = args;

    if (method === 'detail') {
        requestArgs = [args[0]];
        if (args[1]) {
            requestArgs.push({
                contextLocale: args[1].contextLocale,
                title1: args[1].title1
            });
        }
    }

    var identity = {
        provider: provider.name || (provider.config && provider.config.name),
        language: provider.language,
        contentLanguage: provider.contentLanguage,
        contentLangOnly: provider.contentLangOnly,
        method: method,
        args: normalize(requestArgs, [])
    };

    return crypto.createHash('sha256')
        .update(JSON.stringify(identity))
        .digest('hex');
}

function getCacheDirectory(settings) {
    return path.join(settings.databaseLocation, 'ApiResponseCache');
}

function getCachePath(provider, method, args, settings) {
    return path.join(getCacheDirectory(settings), cacheKey(provider, method, args) + '.json');
}

function read(provider, method, args, settings) {
    var file = getCachePath(provider, method, args, settings);

    try {
        return JSON.parse(fs.readFileSync(file, 'utf8')).response;
    } catch (error) {
        return undefined;
    }
}

function write(provider, method, args, settings, response) {
    var directory = getCacheDirectory(settings);
    var file = getCachePath(provider, method, args, settings);
    var temporaryFile = file + '.tmp';

    try {
        fs.mkdirSync(directory, {recursive: true});
        fs.writeFileSync(temporaryFile, JSON.stringify({
            cachedAt: Date.now(),
            response: response
        }));
        fs.renameSync(temporaryFile, file);
    } catch (error) {
        try {
            fs.unlinkSync(temporaryFile);
        } catch (unlinkError) {
            // There may be no temporary file to clean up.
        }
    }
}

function isOffline() {
    return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function cachedOrReject(provider, method, args, settings, error) {
    var cached = read(provider, method, args, settings);

    if (typeof cached !== 'undefined') {
        return Promise.resolve(cached);
    }

    if (typeof Common !== 'undefined' && Common.notifyApiUnavailable) {
        Common.notifyApiUnavailable();
    }
    return Promise.reject(error);
}

function decorateMethod(provider, method, settings, timeout) {
    var original = provider[method];

    if (typeof original !== 'function' || original._offlineCacheWrapped) {
        return;
    }

    function wrapped() {
        var args = Array.prototype.slice.call(arguments);
        var unavailable = new Error('No connection and no cached ' + method + ' response is available');

        if (isOffline()) {
            return cachedOrReject(provider, method, args, settings, unavailable);
        }

        var timer;
        var timedOut = new Promise(function (resolve, reject) {
            timer = setTimeout(function () {
                reject(new Error('Provider ' + method + ' request timed out'));
            }, timeout);
        });
        var live = Promise.resolve()
            .then(function () {
                return original.apply(provider, args);
            })
            .then(function (response) {
                write(provider, method, args, settings, response);
                return response;
            });

        return Promise.race([live, timedOut])
            .then(function (response) {
                clearTimeout(timer);
                return response;
            })
            .catch(function (error) {
                clearTimeout(timer);
                return cachedOrReject(provider, method, args, settings, error);
            });
    }

    wrapped._offlineCacheWrapped = true;
    provider[method] = wrapped;
}

function decorate(provider, settings, timeout) {
    if (!provider || !settings || !settings.databaseLocation) {
        return provider;
    }

    decorateMethod(provider, 'fetch', settings, timeout || DEFAULT_TIMEOUT);
    decorateMethod(provider, 'detail', settings, timeout || DEFAULT_TIMEOUT);
    decorateMethod(provider, 'filters', settings, timeout || DEFAULT_TIMEOUT);
    return provider;
}

module.exports = {
    decorate: decorate,
    getCachePath: getCachePath,
    read: read,
    write: write
};
