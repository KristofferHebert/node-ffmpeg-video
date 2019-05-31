## Node FFMPEG Video
### Example program that demonstates Parallel programing with FFMPEG in Nodejs

Uses FFMPEG to burn subtitles into a youtube video, and compares processing time for both Parallel and Single core processing.
### Getting started
`npm i`
`node index.js`

### Sample Output
```
$ node index.js
Getting subtitles...

Number of Cores: 4
Starting...
Processing video 1 of 4
Processing video 2 of 4
Processing video 3 of 4
Processing video 4 of 4
Completed All
Execution time Single Core Processing: 57.16 Seconds

Number of Cores: 4
Processing video 1 of 4
Processing video 2 of 4
Processing video 3 of 4
Processing video 4 of 4
Starting...
Completed:  3
Completed:  1
Completed:  4
Completed:  2
Completed All
Execution time Parallel Processing: 22.24 Seconds

```