const { v4: uuidv4 } = require('uuid');
const express = require('express');
const fs = require('fs')
const path = require('path')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, { maxHttpBufferSize: 1e7 })
const WaveFile = require('wavefile').WaveFile;
const vosk = require('vosk')

var port = process.env.PORT || 2105;
var sampleRate = 44100

//vosk initialization
if (!fs.existsSync(process.env.MODEL_PATH)) {
  console.log('Please download the model from https://alphacephei.com/vosk/models, unpack it and export as as env variable. Sample: \n'+
  'export MODEL_PATH="/home/foo/voks-models/vosk-model-small-en-us-0.15"')
  process.exit()
}
vosk.setLogLevel(0);
const model = new vosk.Model(process.env.MODEL_PATH);
rec = new vosk.Recognizer({model: model, sampleRate: sampleRate});  

io.on('connection', function (socket) {
  socket.on('send-audio', async function (data) {
    console.log("received:", data)
    if(rec.acceptWaveform(data)){
      console.log("rec.acceptWaveform:", true)
      console.log("rec.result():", rec.result())
    }else{
      console.log("rec.acceptWaveform:", false)
    }

    console.log("0  >  4 : "+data.slice(0,4).toString())
    console.log("8  > 12 : "+data.slice(8,12).toString())
    console.log("12 > 14 : "+data.slice(12,14).toString())
    console.log("36 > 40 : "+data.slice(36,40).toString())
    console.log("45 > end:", data.slice(45))  
    
    var wav = new WaveFile();
    try{
      wav.fromBuffer(data);
      console.log(wav.Y, wav.fmt)
    }catch(err){
      console.log(err)
    }    
  })    
});

app.use(express.static(path.join(__dirname, "web")));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "web", 'index.html'));
});

server.listen(port)
console.log("Running on port: " + port);