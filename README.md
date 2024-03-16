#### Modified to support streaming and all open pull requests has been merged manually one by one - TTS (text to speech) for node.js. send text from node.js to your speakers (or clients using express.js). Join the discussions: https://github.com/burgil/say.js/discussions/1

### More info about this fork can be found on this comment: https://github.com/Marak/say.js/issues/123#issuecomment-1996546069

<img src="https://github.com/Marak/say.js/raw/master/logo.png" />

## Installing burgil say.js fork

```bash
npm install burgil/say.js
```

## Usage (Use it like you normally would)

```javascript
// automatically pick platform
const say = require('say')

// or, override the platform
const Say = require('say').Say
const say = new Say('darwin' || 'win32' || 'linux')

// Use default system voice and speed
say.speak('Hello!')

// Stop the text currently being spoken
say.stop()

// More complex example (with an OS X voice) and slow speed
say.speak("What's up, dog?", 'Alex', 0.5)

// Fire a callback once the text has completed being spoken
say.speak("What's up, dog?", 'Good News', 1.0, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log('Text has been spoken.')
});

// Export spoken audio to a WAV file
say.export("I'm sorry, Dave.", 'Cellos', 0.75, 'hal.wav', (err) => {
  if (err) {
    return console.error(err)
  }

  console.log('Text has been saved to hal.wav.')
})

// Stream spoken audio
async function main() {
  try {
    const spokenStream = await say.stream("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75);
    console.log(spokenStream)
  } catch (e) {
    console.error("Error:", e)
  }
}
main();
```

## Express JS Examples
Checkout the folder `expressjs_examples` on the repo root.
https://github.com/burgil/say.js/tree/master/expressjs_examples

### Methods

#### Speak:

* Speed: 1 = 100%, 0.5 = 50%, 2 = 200%, etc

```javascript
say.speak(text, voice || null, speed || null, callback || null)
```

#### Export Audio:

* MacOS / Windows Only
* Speed: 1 = 100%, 0.5 = 50%, 2 = 200%, etc

```javascript
say.export(text, voice || null, speed || null, filename, callback || null)
```

#### Stream Audio:

* Windows Only
* Speed: 1 = 100%, 0.5 = 50%, 2 = 200%, etc

```javascript
say.stream(text, voice || null, speed || null)
```

#### Stop Speaking:

```javascript
say.stop(callback || null)
```

#### Get List of Installed Voice(s):

```javascript
say.getInstalledVoices(callback)
```

### Testing examples:

```bash
git clone https://github.com/burgil/say.js/
cd say.js
npm install

echo test stream:
node ./examples/win32-stream.js

echo test streaming in real time:
node ./examples/win32-stream-real-time.js

echo get voices:
node ./examples/win32-voices.js

echo test voices:
node ./examples/win32-allvoices.js

echo export:
node ./examples/win32-export.js

echo speak:
node ./examples/win32-basic-callback.js
```

## Feature Matrix

Unfortunately every feature isn't supported on every platform. PR's welcome!

Platform | Speak | Export | Stop | Speed | Voice | List | Stream
---------|-------|--------|------|-------|-------|------|-------
macOS    | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :no_entry_sign: | :no_entry_sign:
Linux    | :white_check_mark: | :white_check_mark:    | :white_check_mark: | :white_check_mark: | :white_check_mark: | :no_entry_sign: | :no_entry_sign:
Windows  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:


## Requirements

* Mac OS X (comes with `say`)
* Linux with Festival installed
* Windows (comes with SAPI.SpVoice)
  * Needs to have Powershell installed and available in $PATH (see [issue #75](https://github.com/Marak/say.js/issues/75))


## Fork Patch Logs:

### Update 20: I fixed conflicts with IPC and streamed it all using one server, still need some work to do in order to link it back

### Update 19: I unlocked the speed - Enjoy streaming on ultra high speed now! still requires attention with ports, I wonder if there is any better IPC then making a local server with a port lol, or if there is a way to put it all on the same port or IPC or something idk

### Update 18: It works!! The frontend example is playing the stream!! Still room for improvement but holy heck dude I made the impossible possible again.

### Update 17: Still unable to play the streaming audio on the front end - But we're streaming!

### Update 16: Fixed backend streaming, now frontend is still returning Uncaught (in promise) DOMException: Failed to load because no supported source was found.

### Update 15: The new streaming feature is not gonna be easy to implement using express js not to mention making a front end for it, we already got the stream we just need to play it.. I am going to grab something to eat if anybody wanna do it now it's the time

### Update 14: Currently I am implementing front end and back end examples using express js for the new streaming and streaming in real time features!

### Update 13: Finished adding streaming in real time!

### Update 12: Ignored CHCP logs caused by utf8 support

### Update 11: Working on streaming in real time..

### Update 10: Added expressjs examples!

### Update 9: Ok so it works, But it's kind of slow, And it returns a buffer not a Uint8Array, I wonder how that will affect us later on, And I found a way to make it faster! I will add another function now called streaming in real time and two different examples just in-case it will not work and I will not feel like finishing it, at least I will have it in slow mode then, but the idea behind my logic is to use a callback function that hooks into the this.child.stdout.on('data', callback) and pipe it directly via expressjs for example.

### Update 8: Trying to return Uint8Array, when it works I will create an example express.js and a frontend no worries!

Goal in life: Uint8Array

* Debugged some lines
* Removed debugging
* Got the output to show on javascript!
* Found the issue thanks to `// console.log('Output from PowerShell:', data.toString());`
* resolve was null - changed to audioStream

```PS
PS C:\Users\Burgil\Desktop\say.js> node ./examples/win32-stream.js
<Buffer 41 63 74 69 76 65 20 63 6f 64 65 20 70 61 67 65 3a 20 36 35 30 30 31 0d 0a 38 32 0d 0a 37 33 0d 0a 37 30 0d 0a 37 30 0d 0a 31 34 30 0d 0a 33 37 0d 0a ... 511840 more bytes> 
```
Note: I feel like it's taking a lot of time to generate the stream.

### Update 7: The issue seems to be related to the use of single quotes within the text 'I'm sorry, Dave.' in the PowerShell script. Since the PowerShell script itself is enclosed in single quotes, the presence of single quotes within the text is causing a syntax error.
```js
psCommand += `$speak.Speak('${text}');`
->
psCommand += `$speak.Speak('${text.replace(/'/g, "''")}');`
```
Still getting null, but notice the error is gone:
```ps
PS C:\Users\Burgil\Desktop\say.js> node ./examples/win32-stream.js
PowerShell Script: chcp 65001;Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;$speak.SelectVoice('Microsoft David Desktop');$speak.Rate = -3;$streamAudio = New-Object System.IO.MemoryStream;$speak.SetOutputToWaveStream($streamAudio);$speak.Speak('I''m sorry, Dave.');$streamAudio.Position = 0; $streamAudio.ToArray()
null
```

Clearly we have an issue here:
```ps
After text.replace:
$speak.Speak('I''m sorry, Dave.');

Before text.replace:
$speak.Speak('I'm sorry, Dave.');
```

Let's open up the powershell script:
```
chcp 65001;
Add-Type -AssemblyName System.speech;
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
$speak.SelectVoice('Microsoft David Desktop');
$speak.Rate = -3;
$streamAudio = New-Object System.IO.MemoryStream;
$speak.SetOutputToWaveStream($streamAudio);
$speak.Speak('I''m sorry, Dave.');
$streamAudio.Position = 0;
$streamAudio.ToArray()
```

Now let's run it in powershell...

```PS
PS C:\Users\Burgil> chcp 65001;
Active code page: 65001
PS C:\Users\Burgil> Add-Type -AssemblyName System.speech;
PS C:\Users\Burgil> $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
PS C:\Users\Burgil> $speak.SelectVoice('Microsoft David Desktop');
PS C:\Users\Burgil> $speak.Rate = -3;
PS C:\Users\Burgil> $streamAudio = New-Object System.IO.MemoryStream;
PS C:\Users\Burgil> $speak.SetOutputToWaveStream($streamAudio);
PS C:\Users\Burgil> $speak.Speak('I''m sorry, Dave.');
PS C:\Users\Burgil> $streamAudio.Position = 0;
PS C:\Users\Burgil> $streamAudio.ToArray()
...
5
255
0
0
1
0
253
255
249
255
254
255
254
...
```

### It works!

Let's test if the use of single quotes really was the underlying issue:
```ps
$speak.Speak('I'm sorry, Dave.');
```

Yes this was an issue:
```
> $speak.Speak('I'm sorry, Dave.');
>>
>>
>> ^C
```

Let's move on to getting it to return the array now as Uint8Array or something on the javascript side.

### Update 6: Stream is still not working, with the same error as update 3, trying to figure out why, debugging:
```ps
PS C:\Users\Burgil\Desktop\say.js> node ./examples/win32-stream.js
PowerShell Script: chcp 65001;Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;$speak.SelectVoice('Microsoft David Desktop');$speak.Rate = -3;$streamAudio = New-Object System.IO.MemoryStream;$speak.SetOutputToWaveStream($streamAudio);$speak.Speak('I'm sorry, Dave.');$streamAudio.Position = 0; $streamAudio.ToArray()
Error: Error: At line:1 char:282

    at Socket.<anonymous> (C:\Users\Burgil\Desktop\say.js\platform\base.js:160:16)
    at Socket.emit (node:events:514:28)
    at addChunk (node:internal/streams/readable:343:12)
    at readableAddChunk (node:internal/streams/readable:312:11)
    at Readable.push (node:internal/streams/readable:253:10)
    at Pipe.onStreamRead (node:internal/stream_base_commons:190:23)
```

### Update 5: Added stream audio buffer
```js
let audioStream = Buffer.alloc(0)
this.child.stdout.on('data', data => {
  audioStream = Buffer.concat([audioStream, data])
})
this.child.stderr.on('data', data => {
  reject(new Error(data.toString()))
})
this.child.on('close', code => {
  if (code !== 0) {
    reject(new Error(`Process exited with code ${code}`))
  } else {
    resolve(audioStream)
  }
})
```

### Update 4: Stream is currently not returning any error, or anything:
```ps
PS C:\Users\Burgil\Desktop\say.js> node ./examples/win32-stream.js
null
```

### Update 3: First test failed, everything worked but stream.
```ps
PS C:\Users\Burgil\Desktop\say.js> node ./examples/basic-callback.js
about to speak...
done
PS C:\Users\Burgil\Desktop\say.js> node ./examples/win32-allvoices.js
Microsoft David Desktop
Microsoft Zira Desktop
PS C:\Users\Burgil\Desktop\say.js> node ./examples/win32-export.js
Text has been saved to hal.wav.
PS C:\Users\Burgil\Desktop\say.js> node ./examples/win32-stream.js
Error: Error: At line:1 char:282

    at Socket.<anonymous> (C:\Users\Burgil\Desktop\say.js\platform\base.js:157:16)
    at Object.onceWrapper (node:events:629:26)
    at Socket.emit (node:events:514:28)
    at addChunk (node:internal/streams/readable:343:12)
    at readableAddChunk (node:internal/streams/readable:312:11)
    at Readable.push (node:internal/streams/readable:253:10)
    at Pipe.onStreamRead (node:internal/stream_base_commons:190:23)
```

### Update 2: I decided to not use text-to-speech AI as it is too expensive for my use-case, starting to test streaming on windows and later on I will add it to linux

### Update 1: Stream is ready for Windows BUT was not tested yet, I probably still need to pipe it, But before I start - while closing tabs I've found Google's new Speech Synthesizer, An alternative that will save the time and effort required to later add support for linux or even worry about it: https://cloud.google.com/text-to-speech - AI Lifelike speech Synthesis - They give 300$ in free credits, But I'm not so sure about it yet, depending how cheap it is, and if I even get my 300$ in credits, I might recommend you to choose it instead if you're looking for hosting it behind a dedicated server like myself, I will update here as soon as I finished testing the pricing and the speed of this new AI lifelike speech synthesis by Google


## Windows Notes

Enjoy streaming!


## Linux Notes

Linux support requires [Festival](http://www.cstr.ed.ac.uk/projects/festival/). As far as I can tell there is no sane way to get a list of available voices. The only voice that seems to work is `voice_kal_diphone`, which seems to be the default anyway.

The `.export()` method is not available.

The `.stream()` method is not (yet) available.

Try the following command to install Festival with a default voice:

```shell
sudo apt-get install festival festvox-kallpc16k
```


## macOS Notes

Voices in macOS are associated with different localities. To a list of voices and their localities run the following command:

```sh
say -v "?"
```

As an example, the default voice is `Alex` and the voice used by Siri is `Samantha`.
