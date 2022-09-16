const ytSearch = require("yt-search");

module.exports.timeToString = (time) => {
    let timeMinutes = Math.floor(time / 60).toString().padStart(2, "0");
    let timeSeconds = Math.floor(time % 60).toString().padStart(2, "0");
    return timeMinutes + ":" + timeSeconds;
}

module.exports.videoFinder = async (query) => {
    const videoResult = await ytSearch(query);
    return videoResult.videos.length > 0 ? videoResult.videos[0] : null;
}

const Struct = (...keys) => ((...v) => keys.reduce((o, k, i) => {o[k] = v[i]; return o} , {}));
module.exports.voiceChannelInfo = Struct('connection', 'player', 'queue', 'nowPlaying', 'loop', 'resource',
                                              'paused', 'lastUnpause', 'lastUnpauseTimestamp', 'isIdle', 'skipVotes');
module.exports.videoInfo = Struct('video', 'requestedBy');
