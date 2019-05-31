#!/usr/bin/env node

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
const youtubedl = require('youtube-dl')
ffmpeg.setFfmpegPath(ffmpegPath)

function encodeVideoWithSubtitles(ID, INDEX, CORES){
  console.log(`Processing video ${INDEX} of ${CORES}`)

  return new Promise(function(resolve, rejection){

    ffmpeg()
    .input(`${ID}.en.vtt`)
    .output(`${ID}.en.ass`)
    .exec()
  
    ffmpeg()
    .input(`${ID}.mp4`)
    .videoFilter(`subtitles=${ID}.en.ass`)
    .output(`./output/${ID}.${INDEX}.en.caption.mp4`)
    .on('end', function() {
      resolve();
    })
    .exec()
  })

}

module.exports = encodeVideoWithSubtitles