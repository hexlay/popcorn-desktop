'use strict';

const ENGINES = [
    {setting: 'enableThepiratebaySearch', client: 'tpb', provider: 'thepiratebay.org', icon: 'tpb', name: 'ThePirateBay'},
    {setting: 'enable1337xSearch', client: 'leet', provider: '1337x.to', icon: 'T1337x', name: '1337x'},
    {setting: 'enableSolidTorrentsSearch', client: 'stor', provider: 'solidtorrents.to', icon: 'solidtorrents', name: 'SolidTorrents'},
    {setting: 'enableTgxtorrentSearch', client: 'tgx', provider: 'torrentgalaxy.to', icon: 'TorrentGalaxy', name: 'TorrentGalaxy'},
    {setting: 'enableNyaaSearch', client: 'nyaa', provider: 'nyaa.si', icon: 'nyaa', name: 'Nyaa'},
];

function enabledEngines(settings) {
    return ENGINES.filter(function(engine) {
        return settings && settings[engine.setting];
    });
}

function parseQuality(title) {
    const value = title || '';
    const match = value.match(/(?:^|[^0-9])(2160p|1080p|720p|576p|480p)(?:[^0-9]|$)/i);
    if (match) {
        return match[1].toLowerCase();
    }
    if (/(?:^|[^a-z0-9])4k(?:[^a-z0-9]|$)/i.test(value)) {
        return '2160p';
    }
    return '-';
}

function detectAudioLanguages(title) {
    const value = String(title || '');
    const languages = [];
    const add = function(language) {
        if (languages.indexOf(language) === -1) {
            languages.push(language);
        }
    };

    if (/(?:^|[^a-z])(eng|english)(?:[^a-z]|$)/i.test(value)) {
        add('en');
    }
    if (/(?:^|[^a-z])(rus|russian)(?:[^a-z]|$)/i.test(value) || /[А-Яа-яЁё]/.test(value) || /(?:дубляж|многоголос|двухголос|лицензия)/i.test(value)) {
        add('ru');
    }
    if (/(?:^|[^a-z])(ukr|ukrainian)(?:[^a-z]|$)/i.test(value) || /(?:україн|украин)/i.test(value)) {
        add('uk');
    }
    if (/(?:^|[^a-z])(spa|spanish|castellano)(?:[^a-z]|$)/i.test(value)) {
        add('es');
    }
    if (/(?:^|[^a-z])(fre|french)(?:[^a-z]|$)/i.test(value)) {
        add('fr');
    }
    if (/(?:^|[^a-z])(ger|german)(?:[^a-z]|$)/i.test(value)) {
        add('de');
    }
    if (/(?:^|[^a-z])(ita|italian)(?:[^a-z]|$)/i.test(value)) {
        add('it');
    }
    if (/(?:^|[^a-z])(jpn|japanese)(?:[^a-z]|$)/i.test(value)) {
        add('ja');
    }

    return languages.length ? languages : ['en'];
}

function normalizeResult(item, engine) {
    if (!item || !item.magnet) {
        return null;
    }
    const title = item.title || item.name || 'Untitled torrent';
    const size = item.size || item.filesize || '-';
    const seed = Number(item.seed || item.seeds) || 0;
    const peer = Number(item.leech || item.peer || item.peers) || 0;
    return {
        isTorrentCollection: true,
        audioLanguages: detectAudioLanguages(title),
        provider: engine.provider,
        icon: '/src/app/images/icons/' + engine.icon + '.png',
        title: title,
        url: item.magnet,
        magnet: item.magnet,
        source: item.url || item.source || '',
        seed: seed,
        seeds: seed,
        peer: peer,
        peers: peer,
        filesize: size,
        size: size,
        quality: parseQuality(title),
    };
}

function seedCount(torrent) {
    return Number(torrent && (torrent.seed || torrent.seeds)) || 0;
}

function peerCount(torrent) {
    return Number(torrent && (torrent.peer || torrent.peers)) || 0;
}

function sortSources(torrents) {
    return (torrents || []).slice().sort(function(a, b) {
        if (Boolean(a.isTorrentCollection) !== Boolean(b.isTorrentCollection)) {
            return a.isTorrentCollection ? -1 : 1;
        }
        if (peerCount(a) !== peerCount(b)) {
            return peerCount(b) - peerCount(a);
        }
        return seedCount(b) - seedCount(a);
    });
}

function groupByAudioLanguage(torrents) {
    const languages = {};
    sortSources(torrents).forEach(function(torrent) {
        const audioLanguages = torrent.audioLanguages && torrent.audioLanguages.length ? torrent.audioLanguages : detectAudioLanguages(torrent.title);
        audioLanguages.forEach(function(language) {
            languages[language] = languages[language] || [];
            languages[language].push(torrent);
        });
    });
    return languages;
}

function preferByQuality(legacyTorrents, collectionTorrents) {
    const torrents = Object.assign({}, legacyTorrents || {});
    const preferred = sortSources(collectionTorrents).filter(function(torrent) {
        return torrent.quality && torrent.quality !== '-';
    });

    preferred.forEach(function(torrent) {
        if (!torrents[torrent.quality] || !torrents[torrent.quality].isTorrentCollection) {
            torrents[torrent.quality] = torrent;
        }
    });

    return {
        torrents: torrents,
        quality: preferred.length ? preferred[0].quality : null,
    };
}

function torrentsByQuality(torrents) {
    const grouped = {};
    sortSources(torrents).forEach(function(torrent) {
        const quality = torrent && torrent.quality;
        if (!quality || quality === '-' || grouped[quality]) {
            return;
        }
        grouped[quality] = torrent;
    });
    return grouped;
}

function base32ToHex(value) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let hex = '';
    for (let i = 0; i < value.length; i++) {
        const index = alphabet.indexOf(value[i].toUpperCase());
        if (index === -1) {
            return null;
        }
        bits += index.toString(2).padStart(5, '0');
    }
    for (let j = 0; j + 4 <= bits.length; j += 4) {
        hex += parseInt(bits.slice(j, j + 4), 2).toString(16);
    }
    return hex;
}

function infoHash(torrent) {
    const magnet = torrent && (torrent.magnet || torrent.url) || '';
    const match = magnet.match(/[?&]xt=urn:btih:([^&]+)/i);
    if (!match) {
        return null;
    }
    let hash;
    try {
        hash = decodeURIComponent(match[1]);
    } catch (error) {
        hash = match[1];
    }
    if (/^[a-f0-9]{40}$/i.test(hash)) {
        return hash.toLowerCase();
    }
    if (/^[a-z2-7]{32}$/i.test(hash)) {
        return base32ToHex(hash);
    }
    return hash.toLowerCase();
}

function fallbackKey(torrent, index) {
    const title = String(torrent.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    const size = String(torrent.filesize || torrent.size || '').toLowerCase().replace(/\s+/g, '');
    if (title && size) {
        return 'meta:' + title + ':' + size;
    }
    return 'item:' + (torrent.provider || '') + ':' + (torrent.source || '') + ':' + index;
}

function dedupe(torrents) {
    const found = Object.create(null);
    return (torrents || []).filter(function(torrent, index) {
        if (!torrent) {
            return false;
        }
        const hash = infoHash(torrent);
        const key = hash ? 'hash:' + hash : fallbackKey(torrent, index);
        if (found[key]) {
            return false;
        }
        found[key] = true;
        return true;
    });
}

function mergeSources(collectionTorrents, fallbackTorrents) {
    const collection = dedupe(collectionTorrents || []);
    const fallback = dedupe(fallbackTorrents || []).map(function(torrent) {
        torrent.isFallbackSource = !torrent.isTorrentCollection;
        return torrent;
    });
    return sortSources(dedupe(collection.concat(fallback)));
}

function logError(logger, message, error) {
    if (logger && typeof logger.error === 'function') {
        logger.error(message, error);
    }
}

function searchEngine(engine, options) {
    const client = options.clients && options.clients[engine.client];
    if (!client || typeof client.search !== 'function') {
        return Promise.resolve([]);
    }
    return new Promise(function(resolve) {
        let settled = false;
        let timer;
        const finish = function(results) {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timer);
            if (typeof options.onProviderResult === 'function') {
                options.onProviderResult(engine, results.length);
            }
            resolve(results);
        };
        timer = setTimeout(function() {
            logError(options.logger, engine.name + ' search timed out');
            finish([]);
        }, options.timeout);
        let request;
        try {
            request = client.search({
                query: options.query,
                category: options.category,
                verified: false,
            });
        } catch (error) {
            logError(options.logger, engine.name + ' search:', error);
            finish([]);
            return;
        }
        Promise.resolve(request).then(function(data) {
            const torrents = data && Array.isArray(data.torrents) ? data.torrents : [];
            finish(torrents.map(function(item) {
                return normalizeResult(item, engine);
            }).filter(Boolean));
        }).catch(function(error) {
            logError(options.logger, engine.name + ' search:', error);
            finish([]);
        });
    });
}

function search(options) {
    const opts = Object.assign({
        category: 'Movies',
        timeout: 8000,
        settings: {},
        clients: {},
    }, options);
    if (!opts.query) {
        return Promise.resolve([]);
    }
    return Promise.all(enabledEngines(opts.settings).map(function(engine) {
        return searchEngine(engine, opts);
    })).then(function(results) {
        const torrents = dedupe([].concat.apply([], results));
        torrents.sort(function(a, b) {
            return seedCount(b) - seedCount(a);
        });
        torrents.forEach(function(torrent, index) {
            torrent.index = index;
        });
        return torrents;
    });
}

module.exports = {
    engines: ENGINES,
    enabledEngines: enabledEngines,
    hasEnabledEngines: function(settings) {
        return enabledEngines(settings).length > 0;
    },
    parseQuality: parseQuality,
    detectAudioLanguages: detectAudioLanguages,
    normalizeResult: normalizeResult,
    infoHash: infoHash,
    dedupe: dedupe,
    sortSources: sortSources,
    groupByAudioLanguage: groupByAudioLanguage,
    preferByQuality: preferByQuality,
    torrentsByQuality: torrentsByQuality,
    mergeSources: mergeSources,
    search: search,
};
