const {voiceChannels} = require("../index");
module.exports.timeToString = (time) => {
    let timeMinutes = Math.floor(time / 60).toString().padStart(2, "0");
    let timeSeconds = Math.floor(time % 60).toString().padStart(2, "0");
    return timeMinutes + ":" + timeSeconds;
}

const Struct = (...keys) => ((...v) => keys.reduce((o, k, i) => {o[k] = v[i]; return o} , {}));
module.exports.voiceChannelInfo = Struct('connection', 'player', 'queue', 'loop', 'resource', 'lastUnpause', 'lastUnpauseTimestamp');
module.exports.videoInfo = Struct('video', 'requestedBy');
