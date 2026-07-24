'use strict';

const crypto = require('crypto');
const child = require('child_process');
const fs = require('fs');
const path = require('path');
const request = require('request');
const extract = require('extract-zip');

const assets = {
    linux64: {
        suffix: 'linux-x64',
        binary: 'libffmpeg.so',
        sha256: 'e5532d59117f527fc34f9f7af2aedf78719627fdf7b5527d84b2e71126764ec6'
    },
    osx64: {
        suffix: 'osx-x64',
        binary: 'libffmpeg.dylib',
        sha256: 'b1adc378901332b565a60dc0ea95cc9ed2e672810409448c21694081c19ead73'
    },
    'osx-arm64': {
        suffix: 'osx-arm64',
        binary: 'libffmpeg.dylib',
        sha256: '1740ccab265957e91ce3def7f1a8e22d5c358f85aa2bb7d5a2dd6704d36ef73a'
    },
    win32: {
        suffix: 'win-ia32',
        binary: 'ffmpeg.dll',
        sha256: '6e93e6e3216bcd96f37de5a27ac195c65f1c4e2a6487b68d298e4a864386c87d'
    },
    win64: {
        suffix: 'win-x64',
        binary: 'ffmpeg.dll',
        sha256: '8d427ff36f7b3f3adf2a5579540eb7611cb2f77c93052304f2ea9920e569c264'
    }
};

function hashFile(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function download(url, destination) {
    return new Promise(function(resolve, reject) {
        var output = fs.createWriteStream(destination);
        var response = request.get(url);
        response.on('error', reject);
        response.on('response', function(result) {
            if (result.statusCode !== 200) {
                reject(new Error('Codec download failed with HTTP ' + result.statusCode));
            }
        });
        output.on('error', reject);
        output.on('finish', resolve);
        response.pipe(output);
    });
}

function findFiles(root, name) {
    if (!fs.existsSync(root)) {
        return [];
    }
    return fs.readdirSync(root, {withFileTypes: true}).reduce(function(matches, entry) {
        var target = path.join(root, entry.name);
        if (entry.isDirectory()) {
            return matches.concat(findFiles(target, name));
        }
        if (entry.name === name) {
            matches.push(target);
        }
        return matches;
    }, []);
}

function signMacApp(app) {
    if (process.platform !== 'darwin' || !fs.existsSync(app)) {
        return Promise.resolve();
    }
    return new Promise(function(resolve, reject) {
        var signer = child.spawn('codesign', ['--force', '--deep', '--sign', '-', app]);
        var errors = '';
        signer.stderr.on('data', function(data) {
            errors += String(data);
        });
        signer.once('error', reject);
        signer.once('close', function(code) {
            if (code) {
                reject(new Error('Could not sign codec-enabled app: ' + errors.trim()));
            } else {
                console.log('Signed codec-enabled app:', app);
                resolve();
            }
        });
    });
}

async function prepareBinary(version, platform, cacheDir) {
    var asset = assets[platform];
    if (!asset) {
        throw new Error('No codec-enabled FFmpeg asset configured for ' + platform);
    }
    var name = version + '-' + asset.suffix + '.zip';
    var codecCache = path.resolve(cacheDir, 'ffmpeg', version, asset.suffix);
    var archive = path.join(codecCache, name);
    var extracted = path.join(codecCache, 'extracted');
    var binary = path.join(extracted, asset.binary);
    fs.mkdirSync(codecCache, {recursive: true});

    if (!fs.existsSync(archive) || hashFile(archive) !== asset.sha256) {
        if (fs.existsSync(archive)) {
            fs.unlinkSync(archive);
        }
        var url = 'https://github.com/nwjs-ffmpeg-prebuilt/nwjs-ffmpeg-prebuilt/releases/download/' + version + '/' + name;
        console.log('Downloading codec-enabled FFmpeg for %s', platform);
        await download(url, archive);
    }
    if (hashFile(archive) !== asset.sha256) {
        throw new Error('Codec archive checksum mismatch for ' + platform);
    }
    if (!fs.existsSync(binary)) {
        fs.mkdirSync(extracted, {recursive: true});
        await extract(archive, {dir: extracted});
    }
    return {asset: asset, binary: binary};
}

async function install(options) {
    for (var index = 0; index < options.platforms.length; index++) {
        var platform = options.platforms[index];
        var prepared = await prepareBinary(options.version, platform, options.cacheDir);
        var roots = [
            path.resolve(options.cacheDir, options.version + '-' + options.flavor, platform),
            path.resolve(options.buildDir, options.appName, platform)
        ];
        var targets = roots.reduce(function(found, root) {
            return found.concat(findFiles(root, prepared.asset.binary));
        }, []);
        if (!targets.length) {
            throw new Error('Could not locate NW.js FFmpeg library for ' + platform);
        }
        targets.forEach(function(target) {
            fs.copyFileSync(prepared.binary, target);
            console.log('Installed codec-enabled FFmpeg:', target);
        });
        if (platform.indexOf('osx') === 0) {
            await signMacApp(path.resolve(options.cacheDir, options.version + '-' + options.flavor, platform, 'nwjs.app'));
            await signMacApp(path.resolve(options.buildDir, options.appName, platform, options.appName + '.app'));
        }
    }
}

install.assets = assets;
install.findFiles = findFiles;
install.hashFile = hashFile;
install.signMacApp = signMacApp;

module.exports = install;
