'use strict';

const assert = require('assert');
const audioTracks = require('../src/app/lib/audio_tracks');

const tracks = [
    {label: 'English', language: 'en', enabled: true},
    {label: 'Commentary', language: 'en', enabled: false}
];

assert.strictEqual(audioTracks.getEnabledIndex(tracks), 0);
assert.strictEqual(audioTracks.selectTrack(tracks, 1), true);
assert.strictEqual(audioTracks.getEnabledIndex(tracks), 1);
assert.strictEqual(tracks[0].enabled, false);
assert.strictEqual(audioTracks.selectTrack(tracks, 3), false);
assert.strictEqual(audioTracks.label(tracks[1], 1), 'Commentary (en)');
assert.strictEqual(audioTracks.label({}, 2), 'Audio 3');

const itemList = {
    length: tracks.length,
    item: function (index) {
        return tracks[index];
    }
};
assert.strictEqual(audioTracks.getEnabledIndex(itemList), 1);
