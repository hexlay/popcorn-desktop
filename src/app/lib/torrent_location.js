'use strict';

module.exports = function (settings, downloadOnly, preload) {
    var keepWatchedTorrentFiles = settings.keepWatchedTorrentFiles && !preload;
    var useDownloadsLocation = settings.separateDownloadsDir && (downloadOnly || keepWatchedTorrentFiles);

    return useDownloadsLocation ? settings.downloadsLocation : settings.tmpLocation;
};
