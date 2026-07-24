'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const installNwjsFfmpeg = require('../scripts/install_nwjs_ffmpeg');

assert.strictEqual(installNwjsFfmpeg.assets['osx-arm64'].binary, 'libffmpeg.dylib');
assert.strictEqual(installNwjsFfmpeg.assets.win64.binary, 'ffmpeg.dll');
assert.strictEqual(installNwjsFfmpeg.assets.linux64.binary, 'libffmpeg.so');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'popcorn-ffmpeg-test-'));
const nested = path.join(root, 'Framework.framework', 'Versions', '1');
fs.mkdirSync(nested, {recursive: true});
const binary = path.join(nested, 'libffmpeg.dylib');
fs.writeFileSync(binary, 'verified codec');

assert.deepStrictEqual(installNwjsFfmpeg.findFiles(root, 'libffmpeg.dylib'), [binary]);
assert.strictEqual(installNwjsFfmpeg.hashFile(binary), '7530d6dd7572732b3916cc770e47feff272094a31036c353561c1732f415267c');

fs.rmSync(root, {recursive: true, force: true});
console.log('NW.js FFmpeg installer tests passed');
