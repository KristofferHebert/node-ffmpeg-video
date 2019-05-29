#!/usr/bin/env node

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
const youtubedl = require('youtube-dl')
ffmpeg.setFfmpegPath(ffmpegPath)

// Youtube ID
const ID = process.argv[2]

// Index of Video
const INDEX  = process.argv[3]

function encodeVideoWithSubtitles(ID, INDEX){
    console.log('Burning Subtitles into video...')

    ffmpeg()
    .input(`${ID}.en.vtt`)
    .output(`${ID}.en.ass`)
    .exec()

    ffmpeg()
    .input(`${ID}.mp4`)
    .videoFilter(`subtitles=${ID}.en.ass`)
    .output(`./output/${ID}.${INDEX}.en.caption.mp4`)
    .exec()
}

encodeVideoWithSubtitles(ID, INDEX)

 module.exports = encodeVideoWithSubtitles