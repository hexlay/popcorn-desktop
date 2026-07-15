'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Backbone = require('backbone');
const underscore = require('underscore');

const App = {
    Model: {}
};
const context = {
    App: App,
    Backbone: Backbone,
    Promise: Promise,
    window: {App: App},
    win: {
        error: function () {}
    },
    _: underscore
};

vm.runInNewContext(
    fs.readFileSync('src/app/lib/models/generic_collection.js', 'utf8'),
    context,
    {filename: 'generic_collection.js'}
);

let fetchCalls = 0;
let resolveFetch;
const provider = {
    hasMore: true,
    loading: false,
    page: 1,
    fetch: function () {
        fetchCalls++;
        return new Promise(function(resolve) {
            resolveFetch = resolve;
        });
    }
};
const TestCollection = App.Model.Collection.extend({
    getProviders: function () {
        return {
            torrents: [provider]
        };
    }
});
const collection = new TestCollection([], {
    filter: new Backbone.Model({sorter: 'trending'})
});

const firstFetch = collection.fetch();
const duplicateFetch = collection.fetch();

assert.strictEqual(firstFetch, duplicateFetch);
assert.strictEqual(fetchCalls, 1);
assert.strictEqual(provider.loading, true);

resolveFetch({
    results: [{imdb_id: 'tt123', title: 'Test'}]
});

firstFetch.then(function() {
    assert.strictEqual(collection.length, 1);
    assert.strictEqual(collection.state, 'loaded');
    assert.strictEqual(provider.loading, false);
    assert.strictEqual(provider.page, 2);

    provider.fetch = function() {
        fetchCalls++;
        return Promise.resolve({results: []});
    };
    return collection.fetch();
}).then(function() {
    assert.strictEqual(collection.hasMore, false);
    assert.strictEqual(provider.hasMore, false);
    assert.strictEqual(fetchCalls, 2);
    return collection.fetch();
}).then(function() {
    assert.strictEqual(fetchCalls, 2);
    console.log('generic collection tests passed');
}).catch(function(error) {
    throw error;
});
