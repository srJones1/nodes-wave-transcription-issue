const localVideo = document.getElementById('localVideo');
let chunks = [];
let mediaRecorder;
var startButton, stopButton, saveButton, sendSocketButton;
var audioBlobReady;
var socketio;

document.addEventListener("DOMContentLoaded", function (event) {
  //start ui listeners
  startButton = document.getElementById("start_button");
  startButton.addEventListener("click", startRecord)

  stopButton = document.getElementById("stop_button");
  stopButton.addEventListener("click", stopRecord)

  saveButton = document.getElementById("save_button");
  saveButton.addEventListener("click", saveFileListener)

  sendSocketButton = document.getElementById("send_socket_button");
  sendSocketButton.addEventListener("click", sendFileWithSocketListener)
});


const startRecord = async (event) => {

  chunks = [];
  audioBlobReady = null;
  startButton.disabled = true;
  saveButton.disabled = true;
  sendSocketButton.disabled = true;

  const mediaStream = await getLocalMediaStream();
  mediaRecorder = new MediaRecorder(mediaStream);
  setListeners();
  mediaRecorder.start();
};

const stopRecord = async () => {
  if (!mediaRecorder) return;

  startButton.disabled = false;
  saveButton.disabled = false;
  sendSocketButton.disabled = false;

  mediaRecorder.stop();
};

const saveFileListener = async () => {
  const blobUrl = URL.createObjectURL(audioBlobReady);
  const link = document.createElement('a');

  link.style = 'display: none';
  link.href = blobUrl;
  link.download = uuidv4();

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(blobUrl);
}

const sendFileWithSocketListener = async () => {

  if(typeof socketio === 'undefined'){
    socketio = io.connect("http://localhost:2105", { transports: ['websocket'] });
    socketio.on('connect', async function () {
      console.log("connected")
      socketio.emit('send-audio', audioBlobReady);
      await new Promise(r => setTimeout(r, 2000));
      window.location.reload(true);
    });    
  }else{
    socketio.emit('send-audio', audioBlobReady);
    await new Promise(r => setTimeout(r, 2000));
    window.location.reload(true);
  }
}

//TODO: channel change needs reload
const getLocalMediaStream = async () => {

  var selectedChannel = document.querySelector('input[name="channel_selection"]:checked').value;
  //sample rate don't works 
  //https://stackoverflow.com/questions/54045977/javascript-sample-rate-ignored-on-constructing-an-audiocontext/54047600#comment137256741_54047600
  // var sampleRate = document.getElementById('sample_rate_input').value

  var constraints = { audio: { 
    sampleRate: 44100 ,
    channelCount: selectedChannel=="mono" ? 1: 2
  } };
  console.log(constraints)
  const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  return mediaStream;
};

const setListeners = () => {
  mediaRecorder.ondataavailable = handleOnDataAvailable;
  mediaRecorder.onstop = handleOnStop;
};

const handleOnStop = () => {
  
  console.log(chunks)

  var blob = chunks[0]

  const audioContext = new AudioContext();
  audioContext.sampleRate = document.getElementById('sample_rate_input').value
  const fileReader = new FileReader();

  // Set up file reader on loaded end event
  fileReader.onloadend = () => {
    const arrayBuffer = fileReader.result; // as ArrayBuffer;

    // Convert array buffer into audio buffer
    audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
      // Do something with audioBuffer
      console.log(audioBuffer);
      var wavBlob = audioBufferToWav(audioBuffer);
      console.log(wavBlob)
      audioBlobReady = wavBlob;
      document.getElementById("localVideo").src = URL.createObjectURL(wavBlob);
      //destroyListeners();
      //mediaRecorder = undefined;
    });
  };

  //Load blob
  fileReader.readAsArrayBuffer(blob);
};

const destroyListeners = () => {
  mediaRecorder.ondataavailable = undefined;
  mediaRecorder.onstop = undefined;
};

const handleOnDataAvailable = ({ data }) => {
  if (data.size > 0) {
    chunks.push(data);
  }
};

function audioBufferToWav(aBuffer) {
  let numOfChan = aBuffer.numberOfChannels,
    btwLength = aBuffer.length * numOfChan * 2 + 44,
    btwArrBuff = new ArrayBuffer(btwLength),
    btwView = new DataView(btwArrBuff),
    btwChnls = [],
    btwIndex,
    btwSample,
    btwOffset = 0,
    btwPos = 0;
  setUint32(0x46464952); // "RIFF"
  setUint32(btwLength - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(aBuffer.sampleRate);
  setUint32(aBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" - chunk
  setUint32(btwLength - btwPos - 4); // chunk length

  for (btwIndex = 0; btwIndex < aBuffer.numberOfChannels; btwIndex++)
    btwChnls.push(aBuffer.getChannelData(btwIndex));

  while (btwPos < btwLength) {
    for (btwIndex = 0; btwIndex < numOfChan; btwIndex++) {
      // interleave btwChnls
      btwSample = Math.max(-1, Math.min(1, btwChnls[btwIndex][btwOffset])); // clamp
      btwSample =
        (0.5 + btwSample < 0 ? btwSample * 32768 : btwSample * 32767) | 0; // scale to 16-bit signed int
      btwView.setInt16(btwPos, btwSample, true); // write 16-bit sample
      btwPos += 2;
    }
    btwOffset++; // next source sample
  }

  return new Blob([btwArrBuff], { type: "audio/wav" })

  function setUint16(data) {
    btwView.setUint16(btwPos, data, true);
    btwPos += 2;
  }

  function setUint32(data) {
    btwView.setUint32(btwPos, data, true);
    btwPos += 4;
  }
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}