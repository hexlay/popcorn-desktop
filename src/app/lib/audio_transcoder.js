'use strict';

const child = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

function executableCandidates() {
    var executable = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
    var candidates = String(process.env.PATH || '').split(path.delimiter).filter(Boolean).map(function(directory) {
        return path.join(directory, executable);
    });
    if (process.platform === 'darwin') {
        candidates.unshift('/usr/local/bin/ffmpeg');
        candidates.unshift('/opt/homebrew/bin/ffmpeg');
    }
    if (process.env.POPCORN_FFMPEG_PATH) {
        candidates.unshift(process.env.POPCORN_FFMPEG_PATH);
    }
    return candidates;
}

function findExecutable() {
    return executableCandidates().find(function(candidate) {
        try {
            fs.accessSync(candidate, fs.constants.X_OK);
            return true;
        } catch (error) {
            return false;
        }
    }) || null;
}

function buildArguments(source, startTime) {
    var args = ['-nostdin', '-hide_banner', '-loglevel', 'error'];
    if (startTime > 0) {
        args.push('-ss', String(startTime));
    }
    return args.concat([
        '-i', source,
        '-map', '0:v:0',
        '-map', '0:a:0',
        '-c:v', 'copy',
        '-c:a', 'libmp3lame',
        '-b:a', '192k',
        '-ac', '2',
        '-af', 'aresample=async=1:first_pts=0',
        '-avoid_negative_ts', 'make_zero',
        '-f', 'mp4',
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
        'pipe:1'
    ]);
}

class AudioTranscoder {
    constructor(executable) {
        this.executable = executable || findExecutable();
        this.server = null;
        this.process = null;
        this.stopped = false;
    }

    start(source, startTime) {
        if (!this.executable) {
            return Promise.reject(new Error('FFmpeg is not installed'));
        }
        this.stopped = false;
        return new Promise(function(resolve, reject) {
            this.server = http.createServer(function(request, response) {
                if (request.method === 'OPTIONS') {
                    response.writeHead(204, {'Access-Control-Allow-Origin': '*'});
                    response.end();
                    return;
                }
                if (request.method !== 'GET') {
                    response.writeHead(405);
                    response.end();
                    return;
                }
                if (this.process) {
                    this.process.kill();
                }
                response.writeHead(200, {
                    'Content-Type': 'video/mp4',
                    'Cache-Control': 'no-store',
                    'Access-Control-Allow-Origin': '*'
                });
                this.process = child.spawn(this.executable, buildArguments(source, startTime));
                this.process.once('error', function(error) {
                    response.destroy(error);
                });
                this.process.stderr.on('data', function(data) {
                    if (!this.stopped) {
                        console.warn('Audio transcoder:', String(data).trim());
                    }
                }.bind(this));
                this.process.stdout.pipe(response);
                response.once('close', function() {
                    if (this.process && !this.process.killed) {
                        this.process.kill();
                    }
                    this.process = null;
                }.bind(this));
            }.bind(this));
            this.server.once('error', reject);
            this.server.listen(0, '127.0.0.1', function() {
                var address = this.server.address();
                resolve('http://127.0.0.1:' + address.port + '/audio-compatible.mp4');
            }.bind(this));
        }.bind(this));
    }

    stop() {
        this.stopped = true;
        if (this.process && !this.process.killed) {
            this.process.kill();
        }
        this.process = null;
        if (this.server) {
            this.server.close();
        }
        this.server = null;
    }
}

AudioTranscoder.buildArguments = buildArguments;
AudioTranscoder.findExecutable = findExecutable;

module.exports = AudioTranscoder;
