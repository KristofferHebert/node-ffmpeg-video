#!/usr/bin/env node

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
const youtubedl = require('youtube-dl')
ffmpeg.setFfmpegPath(ffmpegPath)

function encodeVideoWithSubtitles(ID, INDEX, CORES, PREFIX){

  return new Promise(function(resolve, reject){

    ffmpeg()
    .input(`${ID}.en.vtt`)
    .output(`${ID}.en.ass`)
    .exec()
    
    ffmpeg()
    .input(`${ID}.mp4`)
    .videoFilter(`subtitles=${ID}.en.ass`)
    .inputOptions('-threads 0')
    .output(`./output/${ID}.${INDEX}.${PREFIX}.en.caption.mp4`)
    .on('end', function() {
      resolve();
    })
    .on( 'error', (error) => { console.log(error); reject(error)  })
    .exec()
     
  })

}

module.exports = encodeVideoWithSubtitles