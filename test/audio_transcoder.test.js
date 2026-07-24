'use strict';

const assert = require('assert');
const AudioTranscoder = require('../src/app/lib/audio_transcoder');

const args = AudioTranscoder.buildArguments('http://127.0.0.1/video', 12.5);
assert.deepStrictEqual(args.slice(0, 8), [
    '-nostdin', '-hide_banner', '-loglevel', 'error', '-ss', '12.5', '-i', 'http://127.0.0.1/video'
]);
assert.ok(args.includes('copy'));
assert.ok(args.includes('libmp3lame'));
assert.ok(args.includes('aresample=async=1:first_pts=0'));
assert.strictEqual(args[args.length - 1], 'pipe:1');

console.log('audio transcoder tests passed');
