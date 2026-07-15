'use strict';

const assert = require('assert');
const getMediaType = require('../src/app/lib/media_type');

assert.strictEqual(getMediaType('movie.mp4'), 'video/mp4');
assert.strictEqual(getMediaType('movie.webm'), 'video/webm');
assert.strictEqual(getMediaType('movie.MP4'), 'video/mp4');
assert.strictEqual(getMediaType('movie.mkv'), null);
assert.strictEqual(getMediaType('movie.avi'), null);
assert.strictEqual(getMediaType(), null);
