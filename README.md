# Update I decided to not use text-to-speech AI as it is too expensive for my use-case, starting to test streaming on windows and later on I will add it to linux

# Stream is ready for Windows BUT was not tested yet, I probably still need to pipe it, But before I start - while closing tabs I've found Google's new Speech Synthesizer, An alternative that will save the time and effort required to later add support for linux or even worry about it: https://cloud.google.com/text-to-speech - AI Lifelike speech Synthesis - They give 300$ in free credits, But I'm not so sure about it yet, depending how cheap it is, and if I even get my 300$ in credits, I might recommend you to choose it instead if you're looking for hosting it behind a dedicated server like myself, I will update here as soon as I finished testing the pricing and the speed of this new AI lifelike speech synthesis by Google

<img src="https://travis-ci.org/Marak/say.js.svg?branch=master" />

<img src="https://github.com/Marak/say.js/raw/master/logo.png" />

## Installing say.js

```bash
npm install say
```


## Usage

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

// Export spoken audio to a Stream
async function main() {
  try {
    const spokenStream = await say.stream("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75);
    console.log(spokenStream) // Uint8Array
  } catch (e) {
    console.error("Error:", e)
  }
}
main();
```

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

## Feature Matrix

Unfortunately every feature isn't supported on every platform. PR's welcome!

Platform | Speak | Export | Stop | Speed | Voice | List | Stream
---------|-------|--------|------|-------|-------|------|-------
macOS    | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :no_entry_sign: | :no_entry_sign:
Linux    | :white_check_mark: | :no_entry_sign:    | :white_check_mark: | :white_check_mark: | :white_check_mark: | :no_entry_sign: | :no_entry_sign:
Windows  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:


## macOS Notes

Voices in macOS are associated with different localities. To a list of voices and their localities run the following command:

```sh
say -v "?"
```

As an example, the default voice is `Alex` and the voice used by Siri is `Samantha`.


## Windows Notes

Streaming was never tested before.

## Linux Notes

Linux support requires [Festival](http://www.cstr.ed.ac.uk/projects/festival/). As far as I can tell there is no sane way to get a list of available voices. The only voice that seems to work is `voice_kal_diphone`, which seems to be the default anyway.

The `.export()` method is not available.

The `.stream()` method is not (yet) available.

Try the following command to install Festival with a default voice:

```shell
sudo apt-get install festival festvox-kallpc16k
```


## Requirements

* Mac OS X (comes with `say`)
* Linux with Festival installed
* Windows (comes with SAPI.SpVoice)
  * Needs to have Powershell installed and available in $PATH (see [issue #75](https://github.com/Marak/say.js/issues/75))
