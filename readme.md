## Expected Behavior

Receive the wav sound as stream from socket and get the transcription using vosk

## Current Behavior

- Vosk works very well with wav stream captured directly from native microphone
- Vosk rec.acceptWaveform returns false with wav stream sent with socket from a native microphone
- Vosk rec.acceptWaveform returns false with wav stream sent with socket from a web microphone
- Vosk rec.acceptWaveform returns true with wav stream sent with socket from a web microphone and with stereo instead of mono


## Steps to Reproduce

- Download some vosk model like **vosk-model-en-us-0.42-gigaspeech** from  https://alphacephei.com/vosk/models 
- Unzip it and set the value as env variable:

```
export MODEL_PATH=/home/foo/vosk-model-small-en-us-0.1
```
- Install nodejs libraries

```
npm install
```

## It works without socket

```
node client_native_without_socket.js
```

Wait until model is loaded and this console message appears: **almost ready**

Then just speak something and the transcription works as expected:

![image](https://github.com/jrichardsz/nodejs-wav-vosk-transcription/assets/3322836/1adb2725-a057-43bc-a45b-d7b71d82b582)


## Don't work using native microphone and sockets

- In a new shell, start the socket server. Wait until this message appears: **Running on port: 2105**

```
node socket_server.js
```

- Start the native client in another shell

```
node client_native_with_socket.js
```

- Then press 1 in the shell to start
- Speak some words
- Press 2 in the shell to stop the recording and send the audio to the socket server

Audio will be sent to the server. In the server log you will see that is not a wave format for vosk but it is a valid wav file

![image](https://github.com/jrichardsz/nodejs-wav-vosk-transcription/assets/3322836/ed18e7dc-11a9-4eec-b36a-1bc18aeb09ee)


## Don't work using web microphone and sockets

- In a new shell, start the web server. Wait until this message appears: **Running on port: 8080**

```
node client_web.js
```

- Open in your browser `http://lolcahost:8080s`
- Select mono as channel
- Then press "start record" and speak some words
- Press "stop record".
- Finally press "send recorded wav to socket"

![image](https://github.com/jrichardsz/nodejs-wav-vosk-transcription/assets/3322836/529dbf18-36e6-4c88-81f6-d9da40ccfa36)

- Result is the same in the server

![image](https://github.com/jrichardsz/nodejs-wav-vosk-transcription/assets/3322836/ed18e7dc-11a9-4eec-b36a-1bc18aeb09ee)

### Note: 

If I choose **stereo**, and record again, the **rec.acceptWaveform** returns **true** but the transcription is not the expected
