'use strict';

const mime = require('mime');

const browserSelectableTypes = new Set([
    'video/mp4',
    'video/webm',
    'video/ogg'
]);

module.exports = function getMediaType(filename) {
    const type = mime.getType(filename || '');
    return browserSelectableTypes.has(type) ? type : null;
};
