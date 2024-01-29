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

![image](https://github.com/srJones1/nodes-wave-transcription-issue/assets/67037530/02009642-af19-44a0-8f9b-3f170d01464e)



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

![image](https://github.com/srJones1/nodes-wave-transcription-issue/assets/67037530/22a7e012-eccd-4376-b3b0-4ebf5e6f0df9)



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

![image](https://github.com/srJones1/nodes-wave-transcription-issue/assets/67037530/4d076c5f-8a88-40f4-94c9-bc8a37b79afb)


- Result is the same of **Don't work using native microphone and sockets**


### Note: 

If I choose **stereo**, and record again, the **rec.acceptWaveform** returns **true** but the transcription is not the expected
