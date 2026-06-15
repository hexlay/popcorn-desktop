'use strict';

const assert = require('assert');
const torrentCollectionSearch = require('../src/app/lib/torrent_collection_search');

const tpbEngine = torrentCollectionSearch.engines[0];

async function run() {
    const normalized = torrentCollectionSearch.normalizeResult({
        title: 'Example.Movie.2026.4K.WEB-DL',
        magnet: 'magnet:?xt=urn:btih:0123456789012345678901234567890123456789',
        url: 'https://example.test/torrent/1',
        seed: '42',
        leech: '7',
        size: '2.4 GB',
    }, tpbEngine);
    assert.strictEqual(normalized.url, normalized.magnet);
    assert.strictEqual(normalized.source, 'https://example.test/torrent/1');
    assert.strictEqual(normalized.quality, '2160p');
    assert.strictEqual(normalized.seed, 42);
    assert.strictEqual(normalized.peer, 7);
    assert.strictEqual(normalized.filesize, '2.4 GB');
    assert.strictEqual(normalized.isTorrentCollection, true);
    assert.deepStrictEqual(normalized.audioLanguages, ['en']);

    assert.strictEqual(torrentCollectionSearch.parseQuality('Movie.1080P.BluRay'), '1080p');
    assert.strictEqual(torrentCollectionSearch.parseQuality('Movie without quality'), '-');
    assert.deepStrictEqual(torrentCollectionSearch.detectAudioLanguages('Movie.ENG.RUS.DUB.1080p'), ['en', 'ru']);
    assert.deepStrictEqual(torrentCollectionSearch.detectAudioLanguages('Фильм.Лицензия.1080p'), ['ru']);
    assert.deepStrictEqual(torrentCollectionSearch.detectAudioLanguages('Movie.1080p'), ['en']);
    assert.strictEqual(torrentCollectionSearch.normalizeResult({title: 'No magnet'}, tpbEngine), null);

    const hexMagnet = 'magnet:?xt=urn:btih:0000000000000000000000000000000000000000&dn=one';
    const base32Magnet = 'magnet:?xt=urn:btih:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&dn=two';
    const unique = torrentCollectionSearch.dedupe([
        {title: 'One', url: hexMagnet},
        {title: 'Two', url: base32Magnet},
        {title: 'Same.Movie', filesize: '1 GB', provider: 'a'},
        {title: 'same movie', size: '1GB', provider: 'b'},
    ]);
    assert.strictEqual(unique.length, 2);

    const errors = [];
    const results = await torrentCollectionSearch.search({
        query: 'Example Movie',
        category: 'Movies',
        timeout: 50,
        settings: {
            enableThepiratebaySearch: true,
            enable1337xSearch: true,
            enableSolidTorrentsSearch: true,
        },
        clients: {
            tpb: {
                search: function() {
                    return Promise.resolve({torrents: [
                        {title: 'Low.720p', magnet: 'magnet:?xt=urn:btih:1111111111111111111111111111111111111111', seed: 2},
                        {title: 'High.1080p', magnet: 'magnet:?xt=urn:btih:2222222222222222222222222222222222222222', seed: 20},
                    ]});
                },
            },
            leet: {
                search: function() {
                    return Promise.reject(new Error('provider failure'));
                },
            },
            stor: {
                search: function() {
                    return new Promise(function() {});
                },
            },
        },
        logger: {
            error: function(message) {
                errors.push(message);
            },
        },
    });
    assert.deepStrictEqual(results.map(function(result) {
        return result.seed;
    }), [20, 2]);
    assert.strictEqual(results[0].index, 0);
    assert.strictEqual(errors.length, 2);
    assert.strictEqual(torrentCollectionSearch.hasEnabledEngines({enableNyaaSearch: true}), true);
    assert.strictEqual(torrentCollectionSearch.hasEnabledEngines({}), false);

    const preferred = torrentCollectionSearch.preferByQuality({
        '1080p': {provider: 'legacy', seed: 999},
        '720p': {provider: 'legacy', seed: 10},
    }, [
        {provider: 'collection-low', quality: '1080p', seed: 20, isTorrentCollection: true},
        {provider: 'collection-best', quality: '2160p', seed: 80, isTorrentCollection: true},
        {provider: 'collection-high', quality: '1080p', seed: 50, isTorrentCollection: true},
    ]);
    assert.strictEqual(preferred.quality, '2160p');
    assert.strictEqual(preferred.torrents['1080p'].provider, 'collection-high');
    assert.strictEqual(preferred.torrents['720p'].provider, 'legacy');
    assert.deepStrictEqual(torrentCollectionSearch.sortSources([
        {provider: 'legacy', seed: 999},
        {provider: 'collection', seed: 1, isTorrentCollection: true},
    ]).map(function(torrent) {
        return torrent.provider;
    }), ['collection', 'legacy']);
    const grouped = torrentCollectionSearch.groupByAudioLanguage([
        {title: 'Movie.ENG.1080p', seed: 10, isTorrentCollection: true},
        {title: 'Фильм.RUS.720p', seed: 20, isTorrentCollection: true},
    ]);
    assert.strictEqual(grouped.en.length, 1);
    assert.strictEqual(grouped.ru.length, 1);

    console.log('torrent_collection_search tests passed');
}

run().catch(function(error) {
    console.error(error);
    process.exitCode = 1;
});
