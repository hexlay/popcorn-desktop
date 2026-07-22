'use strict';

const assert = require('assert');
const normalizeChromiumArgs = require('../src/app/lib/chromium_args');

const normal = normalizeChromiumArgs('--enable-node-worker --no-sandbox', false);
assert.ok(normal.includes('--enable-features=AudioVideoTracks'));
assert.ok(normal.includes('--enable-blink-features=AudioVideoTracks'));
assert.strictEqual(normal.match(/--enable-node-worker/g).length, 1);

const resampling = normalizeChromiumArgs('--disable-audio-output-resampler', false);
assert.ok(!resampling.includes('--disable-audio-output-resampler'));
assert.ok(normalizeChromiumArgs('', true).includes('--disable-audio-output-resampler'));

const features = normalizeChromiumArgs('--enable-features=ExistingFeature', false);
assert.ok(features.includes('--enable-features=ExistingFeature,AudioVideoTracks'));
assert.strictEqual(features.match(/--enable-features=/g).length, 1);

const blinkFeatures = normalizeChromiumArgs('--enable-blink-features=ExistingBlinkFeature', false);
assert.ok(blinkFeatures.includes('--enable-blink-features=ExistingBlinkFeature,AudioVideoTracks'));
assert.strictEqual(blinkFeatures.match(/--enable-blink-features=/g).length, 1);
