const fs = require('fs');
const ytdl = require('ytdl-core');
function sv (){
  var result = ytdl('http://www.youtube.com/watch?v=A02s8omM_hI')
  //.pipe(fs.createWriteStream('video.mp4'));
  console.log(result.videoInfo)
}

module.exports = sv