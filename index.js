const fs = require('fs')
const si = require('systeminformation')
const fork = require('child_process').fork
const youtubedl = require('youtube-dl')
const encodeVideoWithSubtitles = require('./encoder')

const url = 'https://www.youtube.com/watch?v=4pYlgOUJq58'
const id = url.split("?v=").pop()
var stack = [];
const start = process.hrtime()

async function getVideo(url){
  var percentage = 0;
  var fileName = `${id}.mp4`
  var fileSize = 0

  return new Promise(function(resolve, reject){ 
    if(fs.existsSync(fileName)){
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
    var worker = fork('./worker.js', [videoID, index, cores, 'parallel'])
    
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
  const perf = require('execution-time')()
  perf.start()
  
  var cores = await si.cpu()
  cores = cores.physicalCores

  console.log('Number of Cores:', cores)

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

async function processVideos(id, index, cores, prefix){
  
  console.log(`Processing video ${index} of ${cores}`)

  await encodeVideoWithSubtitles(id, index, cores, prefix)
  
  if(index < cores){
    await processVideos(id, index + 1, cores, prefix)
  }
}

async function singleCore(){
  const perf = require('execution-time')()
  perf.start()

  var cores = await si.cpu()
  cores = cores.physicalCores

  console.log('Number of Cores:', cores)

  var timer = process.hrtime(start)
  console.log('Starting...')
  try {
    await processVideos(id, 1, cores, 'single')
  }
  catch(e){
    console.log(e)
  }

  console.log('Completed All')
  console.info(`Execution time Single Core Processing: ${(perf.stop().time * .001).toFixed(2)} Seconds`)
}

(async () => {
  let titles = await getSubTitles(url)
  fs.renameSync(titles,`${id}.en.vtt`)
  let video = await getVideo(url)
  
  await singleCore();
  await multiCore();
})();