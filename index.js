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
const fork = require('child_process').fork
const youtubedl = require('youtube-dl')
const encodeVideoWithSubtitles = require('./encoder')
const perf = require('execution-time')()

const url = 'https://www.youtube.com/watch?v=4pYlgOUJq58'
const id = url.split("?v=").pop()
var stack = [];
const start = process.hrtime()

var timemark = null

async function getVideo(url){
  var percentage = 0;
  var fileName = `${id}.mp4`
  var fileSize = 0

  return new Promise(function(resolve, reject){ 
    if(fs.existsSync(fileName)){
      console.log(fileName, 'exists')
      return resolve()
    }
  
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
      console.log('Download started')
      fileSize = info.size;
    })
  
    video.on('data', function data(chunk) {
      percentage += chunk.length;
      if (fileSize) {
        console.log('Percentage: ', (percentage / fileSize * 100).toFixed(2))
      }
    })

    video.on('end', function () {
      resolve()
    })
     
    video.pipe(fs.createWriteStream(fileName))
  })

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

function scheduleWorker(videoID, index, cores){
  return new Promise(function(resolve, reject){
    console.log(`Processing video ${index} of ${cores}`)
    var worker = fork('./worker.js', [videoID, index])
    
    worker.on('error', function (error) {
      console.log('stderr: ' + error)
      reject(error)
    })
    
    worker.on('exit', function (code) {
      console.log('Completed: ', index)
      resolve(index)
    });
  })
}

async function multiCore(){
  perf.start()
  let video = await getVideo(url)

  console.log('Done downloading video')
  let titles = await getSubTitles(url)
  var cores = await si.cpu()
  cores = cores.physicalCores

  console.log('Number of Cores:', cores)

  fs.renameSync(titles,`${id}.en.vtt`)

  for(var i = 1; i <= cores; i++){
    stack.push(scheduleWorker(id, i, cores));
  }

  var timer = process.hrtime(start)
  console.log('Starting...')
  await Promise.all(stack)
  stack = []
  console.log('Completed All')
  console.info(`Execution time Parallel Processing: ${(perf.stop().time * .001).toFixed(2)} Seconds`)

}

async function processVideos(id, index, cores){
  console.log(`Processing video ${index} of ${cores}`)

  await encodeVideoWithSubtitles(id, index, cores)
  
  if(index < cores){
    await processVideos(id, index + 1, cores)
  }
}

async function singleCore(){
  perf.start()

  var cores = await si.cpu()
  cores = cores.physicalCores

  console.log('Number of Cores:', cores)

  var timer = process.hrtime(start)
  console.log('Starting...')
  try {
    await processVideos(id, 1, cores)
  }
  catch(e){
    console.log(e)
  }

  console.log('Completed All')
  console.info(`Execution time Single Core: ${(perf.stop().time * .001).toFixed(2)} Seconds`)
}

(async () => {
  await singleCore();
  await multiCore();
})();