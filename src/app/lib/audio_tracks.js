'use strict';

function getTrack(trackList, index) {
    if (!trackList) {
        return undefined;
    }
    return typeof trackList.item === 'function' ? trackList.item(index) : trackList[index];
}

function getEnabledIndex(trackList) {
    for (let index = 0; trackList && index < trackList.length; index++) {
        const track = getTrack(trackList, index);
        if (track && track.enabled) {
            return index;
        }
    }
    return -1;
}

function selectTrack(trackList, selectedIndex) {
    if (!trackList || selectedIndex < 0 || selectedIndex >= trackList.length) {
        return false;
    }
    for (let index = 0; index < trackList.length; index++) {
        const track = getTrack(trackList, index);
        if (track) {
            track.enabled = index === selectedIndex;
        }
    }
    return true;
}

function label(track, index) {
    var description = track && (track.label || track.language);
    if (track && track.label && track.language && track.label.toLowerCase() !== track.language.toLowerCase()) {
        description += ' (' + track.language + ')';
    }
    return description || 'Audio ' + (index + 1);
}

module.exports = {
    getTrack: getTrack,
    getEnabledIndex: getEnabledIndex,
    selectTrack: selectTrack,
    label: label
};
