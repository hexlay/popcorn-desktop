'use strict';

const fs = require('fs');
const path = require('path');
const parseTorrent = require('parse-torrent');

const videoExtensions = ['.mp4', '.m4v', '.avi', '.mov', '.mkv', '.wmv'];
var cachedRoots;
var cachedIndex;
var refreshInProgress = false;

function normalize(value) {
    return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function episodeKeys(filePath) {
    var keys = [];
    var name = String(filePath || '');
    var patterns = [
        /(?:^|[^a-z0-9])s0*(\d{1,2})[ ._-]*e0*(\d{1,3})(?=[^0-9]|$)/ig,
        /(?:^|[^0-9])0*(\d{1,2})x0*(\d{1,3})(?=[^0-9]|$)/ig
    ];

    patterns.forEach(function(pattern) {
        var match;
        while ((match = pattern.exec(name)) !== null) {
            keys.push(parseInt(match[1], 10) + ':' + parseInt(match[2], 10));
        }
    });

    return keys;
}

async function scanTorrentCache(directory, index) {
    var entries;
    try {
        entries = await fs.promises.readdir(directory);
    } catch (error) {
        return;
    }
    await Promise.all(entries.map(async function(name) {
        if (/^[a-f0-9]{40}$/i.test(name)) {
            var cachedHash = name.toLowerCase();
            index.cachedHashes.add(cachedHash);
            index.hashPaths.set(cachedHash, path.dirname(directory));
            return;
        }
        var match = name.match(/^([a-f0-9]{40})\.json$/i);
        if (!match) {
            return;
        }
        var manifest;
        try {
            manifest = JSON.parse(await fs.promises.readFile(path.join(directory, name), 'utf8'));
            var stats = await fs.promises.stat(manifest.filePath);
            if (stats.size > 0) {
                var availableHash = match[1].toLowerCase();
                index.availableHashes.add(availableHash);
                index.hashFiles.set(availableHash, manifest.filePath);
                index.hashPaths.set(availableHash, path.dirname(directory));
                index.manifests.push(manifest);
            }
        } catch (error) {
            return;
        }
    }));
}

async function scanDirectory(directory, index) {
    var entries;
    try {
        entries = await fs.promises.readdir(directory, {withFileTypes: true});
    } catch (error) {
        return;
    }
    await Promise.all(entries.map(async function(entry) {
        if (entry.name === 'TorrentCache') {
            return scanTorrentCache(path.join(directory, entry.name), index);
        }
        var entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            return scanDirectory(entryPath, index);
        }
        if (!entry.isFile() || videoExtensions.indexOf(path.extname(entry.name).toLowerCase()) === -1) {
            return;
        }
        var keys = episodeKeys(entryPath);
        var stats;
        try {
            stats = await fs.promises.stat(entryPath);
        } catch (error) {
            return;
        }
        if (stats.size > 0) {
            index.files.push({
                path: entryPath,
                normalizedPath: normalize(entryPath),
                episodeKeys: keys
            });
            keys.forEach(function(key) {
                index.episodes.add(key);
            });
        }
    }));
}

async function createIndex(roots) {
    var index = {
        availableHashes: new Set(),
        cachedHashes: new Set(),
        episodes: new Set(),
        files: [],
        hashFiles: new Map(),
        manifests: [],
        hashPaths: new Map()
    };
    var uniqueRoots = Array.from(new Set((roots || []).filter(Boolean)));
    await Promise.all(uniqueRoots.map(function(root) {
        return scanDirectory(root, index);
    }));
    return index;
}

function getIndex(roots, refresh) {
    var rootKey = (roots || []).filter(Boolean).sort().join('|');
    var rootsChanged = cachedRoots !== rootKey;
    if (!cachedIndex || rootsChanged || (refresh && !refreshInProgress)) {
        cachedRoots = rootKey;
        refreshInProgress = Boolean(refresh);
        cachedIndex = createIndex(roots);
        cachedIndex.then(function() {
            refreshInProgress = false;
        }, function() {
            refreshInProgress = false;
        });
    }
    return cachedIndex;
}

function invalidate() {
    cachedIndex = null;
    refreshInProgress = false;
}

function scan(roots, refresh) {
    return getIndex(roots, refresh).then(function(index) {
        return index.episodes;
    });
}

function titleMatches(file, title, year) {
    var normalizedTitle = normalize(title);
    if (!normalizedTitle || file.normalizedPath.indexOf(normalizedTitle) === -1) {
        return false;
    }
    var fileYears = file.normalizedPath.match(/\b(?:19|20)\d{2}\b/g) || [];
    if (year && fileYears.length && fileYears.indexOf(String(year)) === -1) {
        return false;
    }
    if (normalizedTitle.length <= 3) {
        return Boolean(year) && file.normalizedPath.indexOf(String(year)) !== -1;
    }
    return true;
}

function movieAvailable(index, title, year) {
    return Boolean(index && index.files.some(function(file) {
        return file.episodeKeys.length === 0 && titleMatches(file, title, year);
    }));
}

function showAvailable(index, title) {
    return Boolean(index && index.files.some(function(file) {
        return file.episodeKeys.length > 0 && titleMatches(file, title);
    }));
}

function sourceInfoHash(source) {
    var uri = source && (source.magnet || source.url || source);
    try {
        return parseTorrent(uri).infoHash.toLowerCase();
    } catch (error) {
        return null;
    }
}

function sourceAvailable(index, source, title, year) {
    var infoHash = sourceInfoHash(source);
    if (!infoHash || !index) {
        return false;
    }
    if (index.availableHashes.has(infoHash)) {
        return true;
    }
    return index.cachedHashes.has(infoHash) && index.files.some(function(file) {
        return titleMatches(file, title, year);
    });
}

function annotateSources(roots, sources, title, year, refresh) {
    return getIndex(roots, refresh).then(function(index) {
        (sources || []).forEach(function(source) {
            var infoHash = sourceInfoHash(source);
            source.offlineAvailable = sourceAvailable(index, source, title, year);
            source.offlineFilePath = source.offlineAvailable && infoHash ? index.hashFiles.get(infoHash) : null;
            if (source.offlineAvailable && !source.offlineFilePath) {
                var matchingFile = index.files.find(function(file) {
                    return titleMatches(file, title, year);
                });
                source.offlineFilePath = matchingFile ? matchingFile.path : null;
            }
            source.offlinePath = source.offlineAvailable && infoHash ? index.hashPaths.get(infoHash) : null;
        });
        return sources;
    });
}

function writeManifest(torrent, torrentModel) {
    var videoFile = torrentModel && torrentModel.get('video_file');
    if (!torrent || !torrent.infoHash || !videoFile || !videoFile.path) {
        return false;
    }
    var manifest = {
        infoHash: torrent.infoHash,
        filePath: videoFile.path,
        fileSize: videoFile.size,
        imdbId: torrentModel.get('imdb_id'),
        title: torrentModel.get('title'),
        year: torrentModel.get('year'),
        season: torrentModel.get('season'),
        episode: torrentModel.get('episode')
    };
    try {
        fs.writeFileSync(path.join(torrent.path, 'TorrentCache', torrent.infoHash + '.json'), JSON.stringify(manifest));
        invalidate();
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    annotateSources: annotateSources,
    episodeKeys: episodeKeys,
    getIndex: getIndex,
    invalidate: invalidate,
    movieAvailable: movieAvailable,
    normalize: normalize,
    scan: scan,
    showAvailable: showAvailable,
    sourceAvailable: sourceAvailable,
    sourceInfoHash: sourceInfoHash,
    writeManifest: writeManifest
};
