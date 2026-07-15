'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const FileServer = require('../src/app/fileserver');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'popcorn-fileserver-'));
const filePath = path.join(directory, 'video.mp4');
const contents = Buffer.from('local playback test');
fs.writeFileSync(filePath, contents);

const server = new FileServer({
    index: 0,
    length: contents.length,
    name: 'video.mp4',
    path: filePath
});

server.on('error', function(error) {
    if (error.code === 'EPERM') {
        fs.rmSync(directory, {recursive: true, force: true});
        console.log('file server tests skipped: loopback binding is not permitted');
        return;
    }
    throw error;
});

server.listen(0, '127.0.0.1', function() {
    const port = server.address().port;
    const request = http.get({
        hostname: '127.0.0.1',
        path: '/0',
        port: port,
        headers: {Range: 'bytes=0-4'}
    }, function(response) {
        const chunks = [];
        response.on('data', function(chunk) {
            chunks.push(chunk);
        });
        response.on('end', function() {
            assert.strictEqual(response.statusCode, 206);
            assert.strictEqual(Buffer.concat(chunks).toString(), 'local');
            server.destroy(function() {
                assert.strictEqual(server.listening, false);
                fs.rmSync(directory, {recursive: true, force: true});
                console.log('file server tests passed');
            });
        });
    });
    request.on('error', function(error) {
        throw error;
    });
});
