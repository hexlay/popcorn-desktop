'use strict';

const assert = require('assert');
const downloadedEpisodeFiles = require('../src/app/lib/downloaded_episode_files');

assert.deepStrictEqual(downloadedEpisodeFiles.episodeKeys('Show.Name.S01E02.1080p.mkv'), ['1:2']);
assert.deepStrictEqual(downloadedEpisodeFiles.episodeKeys('Show Name - 2x07.mp4'), ['2:7']);
assert.deepStrictEqual(downloadedEpisodeFiles.episodeKeys('Movie.2026.1080p.mkv'), []);
assert.strictEqual(downloadedEpisodeFiles.normalize('Spider-Man: No Way Home'), 'spider man no way home');

const index = {
    availableHashes: new Set(),
    cachedHashes: new Set(['0123456789012345678901234567890123456789']),
    files: [
        {normalizedPath: '/downloads/dune part two 2024 1080p mkv', episodeKeys: []},
        {normalizedPath: '/downloads/the bear s02e03 mkv', episodeKeys: ['2:3']}
    ]
};
assert.strictEqual(downloadedEpisodeFiles.movieAvailable(index, 'Dune: Part Two', 2024), true);
assert.strictEqual(downloadedEpisodeFiles.movieAvailable(index, 'Dune', 1984), false);
assert.strictEqual(downloadedEpisodeFiles.showAvailable(index, 'The Bear'), true);
assert.strictEqual(downloadedEpisodeFiles.sourceAvailable(index, {
    url: 'magnet:?xt=urn:btih:0123456789012345678901234567890123456789'
}, 'Dune: Part Two', 2024), true);

downloadedEpisodeFiles.invalidate();
const firstRefresh = downloadedEpisodeFiles.getIndex([], true);
const coalescedRefresh = downloadedEpisodeFiles.getIndex([], true);
assert.strictEqual(coalescedRefresh, firstRefresh);
