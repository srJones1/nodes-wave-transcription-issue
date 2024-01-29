const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const mic = require("mic");
const socketClient = require('socket.io-client')
const stdin = process.stdin;

SAMPLE_RATE = 44100

var micInstance = mic({
    rate: String(SAMPLE_RATE),
    channels: '1',
    debug: false,
    device: 'default',
    fileType: 'wav'
});

var micInputStream = micInstance.getAudioStream();

var chunks = [];

micInputStream.on('data', async (data) => {
    console.log("Recieved Input Stream: ", data);
    chunks.push(data)
});

micInputStream.on('stopComplete', async function () {
    var id = uuidv4();
    var wavLocation = `/tmp/${id}.wav`;
    var buf = Buffer.concat(chunks);
    await fs.promises.writeFile(wavLocation, buf);
    console.log(wavLocation)
    var socket = socketClient.connect('http://localhost:2105');
    socket.on('connect', async function () {
        console.log("audio sent")
        socket.emit('send-audio', buf);
        await new Promise(r => setTimeout(r, 2000));
        process.exit();
    });
});

micInputStream.on('silence', function () {
    console.log("Got SIGNAL silence");
});

process.on('SIGINT', function () {
    console.log("\nStopping");
    micInstance.stop();
});


stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
var microphoneAlreadyStarted = false;
stdin.on('data', function (key) {
    if (key === 'q') { //quit
        process.exit();
    } else if (key === '1') { //start
        console.log("start")
        micInstance.start();
    } if (key === '2') { //stop
        console.log("stop")
        micInstance.stop();
    }

});