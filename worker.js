
const encodeVideoWithSubtitles = require('./encoder')

// Youtube ID
const ID = process.argv[2]

// Index of Video
const INDEX  = process.argv[3]
const CORES = process.argv[4]

encodeVideoWithSubtitles(ID, INDEX, CORES)

