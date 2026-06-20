'use strict';

const assert = require('assert');
const getTorrentLocation = require('../src/app/lib/torrent_location');

const settings = {
    tmpLocation: '/tmp/cache',
    downloadsLocation: '/downloads',
    separateDownloadsDir: true,
    keepWatchedTorrentFiles: false
};

assert.strictEqual(getTorrentLocation(settings, false, false), '/tmp/cache');
assert.strictEqual(getTorrentLocation(settings, true, false), '/downloads');

settings.keepWatchedTorrentFiles = true;
assert.strictEqual(getTorrentLocation(settings, false, false), '/downloads');
assert.strictEqual(getTorrentLocation(settings, false, true), '/tmp/cache');

settings.separateDownloadsDir = false;
assert.strictEqual(getTorrentLocation(settings, false, false), '/tmp/cache');
