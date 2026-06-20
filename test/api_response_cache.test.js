'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const apiResponseCache = require('../src/app/lib/api_response_cache');

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'api-response-cache-'));
const settings = {databaseLocation: temporaryDirectory};
const provider = {
    name: 'TestProvider',
    contentLanguage: 'en'
};
const args = [{page: 1, sorter: 'trending'}];
const response = {results: [{imdb_id: 'tt123'}], hasMore: true};

apiResponseCache.write(provider, 'fetch', args, settings, response);
assert.deepStrictEqual(apiResponseCache.read(provider, 'fetch', args, settings), response);
assert.strictEqual(apiResponseCache.read(provider, 'fetch', [{page: 2}], settings), undefined);

let liveCalls = 0;
let liveFails = false;
provider.fetch = function () {
    liveCalls++;
    if (liveFails) {
        return Promise.reject(new Error('network unavailable'));
    }
    return Promise.resolve(response);
};
apiResponseCache.decorate(provider, settings, 100);

provider.fetch(args[0]).then(function (liveResponse) {
    assert.deepStrictEqual(liveResponse, response);
    assert.strictEqual(liveCalls, 1);
    liveFails = true;
    return provider.fetch(args[0]);
}).then(function (cachedResponse) {
    assert.deepStrictEqual(cachedResponse, response);
    assert.strictEqual(liveCalls, 2);
    fs.rmSync(temporaryDirectory, {recursive: true, force: true});
}).catch(function (error) {
    fs.rmSync(temporaryDirectory, {recursive: true, force: true});
    throw error;
});
