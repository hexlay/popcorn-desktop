'use strict';

const requiredArgs = [
    '--enable-node-worker',
    '--no-sandbox'
];

function normalize(args, disableAudioResampler) {
    var result = String(args || '').split(/\s+/).filter(Boolean);
    var enabledFeatures = [];
    var enabledBlinkFeatures = [];
    result = result.filter(function (arg) {
        if (arg.indexOf('--enable-features=') === 0) {
            enabledFeatures = enabledFeatures.concat(arg.replace('--enable-features=', '').split(',').filter(Boolean));
            return false;
        }
        if (arg.indexOf('--enable-blink-features=') === 0) {
            enabledBlinkFeatures = enabledBlinkFeatures.concat(arg.replace('--enable-blink-features=', '').split(',').filter(Boolean));
            return false;
        }
        return arg !== '--disable-audio-output-resampler';
    });
    requiredArgs.forEach(function (arg) {
        if (result.indexOf(arg) === -1) {
            result.push(arg);
        }
    });
    if (enabledFeatures.indexOf('AudioVideoTracks') === -1) {
        enabledFeatures.push('AudioVideoTracks');
    }
    if (enabledBlinkFeatures.indexOf('AudioVideoTracks') === -1) {
        enabledBlinkFeatures.push('AudioVideoTracks');
    }
    result.push('--enable-features=' + Array.from(new Set(enabledFeatures)).join(','));
    result.push('--enable-blink-features=' + Array.from(new Set(enabledBlinkFeatures)).join(','));
    if (disableAudioResampler) {
        result.push('--disable-audio-output-resampler');
    }
    return result.join(' ');
}

module.exports = normalize;
