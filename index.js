// const sv = require ('./src')
// https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
// https://github.com/vvo/gifify/blob/master/example/index.js

// brew install gifsicle
// brew install ffmpeg --with-fontconfig --with-libass
// brew tap varenc/ffmpeg
// brew tap-pin varenc/ffmpeg
// brew install ffmpeg $(brew options ffmpeg --compact)

// ffmpeg -ss 00:01:00 -i aQReOmNN3e4.mp4 -to 00:01:5 -vf drawtext="text='Stack Overflow': fontcolor=white: fontsize=24: box=1: boxcolor=black@0.5: \
// boxborderw=5: x=(w-text_w)/2: y=(h-text_h)/2" -codec:a copy aQReOmNN3e4-2.mp4
// https://github.com/vvo/gifify/blob/master/index.js

// sv()
// const gifify = require('gifify')

// ffmpeg -ss 00:01:00 -i aQReOmNN3e4.mp4 -to 00:01:5 -vf drawtext="text='Stack Overflow': fontcolor=white: fontsize=24: box=1: boxcolor=black@0.5: \
// boxborderw=5: x=(w-text_w)/2: y=(h-text_h)/2" -codec:a copy aQReOmNN3e4-2.mp4
// subtitle-utils
// https://gist.github.com/rick4470/0e051cbceae6fd591fd3c02a8ab417cc

const fs = require('fs')
const si = require('systeminformation')
const path = require('path')
const fork = require('child_process').fork;
var url = 'https://www.youtube.com/watch?v=4pYlgOUJq58';
var id = url.split("?v=").pop()


const now = new Date()
const start = process.hrtime()

var numberOfCores = 0
var timemark = null

// const command = ffmpeg()

function getObjectFromXml(text) {
  var result
  parseString(text, (e, r) => { result = r })
  return result
}

function progress(progress){
  if (progress.timemark != timemark) {
    timemark = progress.timemark
    console.log(timemark)
  }
 }

function error(err, stdout, stderr){
  console.log('Video Error: ' + err.message)
}

function end(){
  console.log('Finished')
}


var youtubedl = require('youtube-dl');
var url = 'https://www.youtube.com/watch?v=4pYlgOUJq58';
var id = url.split("?v=").pop()
var fileSize = 0

async function getVideo(url){
  var percentage = 0;
  var size = 0; 

  // // youtube-dl -v https://www.youtube.com/watch\?v\=Y6e_m9iq-4Q --skip-download --write-sub --all-subs --convert-subs srt
  console.log('Getting video...')
  var video = youtubedl(url,
    // Optional arguments passed to youtube-dl.
    [
    '--format=18',
    '--skip-download',
    '--write-sub',
    '--all-subs',
    '--convert-subs=srt'
  ],
  
    { start: percentage, cwd: __dirname });
   
  // Will be called when the download starts.
  video.on('info', function(info) {
    console.log('Download started');
    fileSize = info.size;

  })

  video.on('data', function data(chunk) {
    percentage += chunk.length;
    if (fileSize) {
      console.log('Percentage: ', (percentage / fileSize * 100).toFixed(2))
    }
  })
   
  video.pipe(fs.createWriteStream(`${id}.mp4`))

  return video
}

async function getSubTitles(url){
  console.log('Getting subtitles...')
  var options = {
    auto: true,
    all: false,
    lang: 'en',
    cwd: __dirname,
  }  

  return new Promise(function(resolve, reject){
    return youtubedl.getSubs(url, options, function(err, files) {
      if (err) return reject(err)
      return resolve(files[0])
    }) 
  })
}

async function sv(){
  let video = await getVideo(url)
  video.on('end', async function end () {
    console.log('Done downloading video')
    let titles = await getSubTitles(url)
    fs.renameSync(titles,`${id}.en.vtt`)

    // var worker = spawn('node ./worker.js', ['4pYlgOUJq58', '1'])
    var worker = fork('./worker.js', ['4pYlgOUJq58', '1'])
    var worker1 = fork('./worker.js', ['4pYlgOUJq58', '2'])
    var worker2 = fork('./worker.js', ['4pYlgOUJq58', '3'])
    var worker3 = fork('./worker.js', ['4pYlgOUJq58', '4'])

    worker.on('data', function (data) {
      console.log('stdout: ' + data);
    });
    
    worker.on('error', function (error) {
      console.log('stderr: ' + error);
    });
    
    worker.on('exit', function (code) {
      console.log('child process exited with code ' + code);
    });


    var total = new Date() - now,
    end = process.hrtime(start)

    console.info('Execution time: %dms', total)
    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)

  })

}

sv()





