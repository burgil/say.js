const childProcess = require('child_process')
const once = require('one-time')
const symbolTTS = require('../symbol-tts.js')
const eventEmitter = require('./net.js');
const { v4: uuidv4 } = require('uuid');

class SayPlatformBase {
  constructor() {
    this.child = null
    this.baseSpeed = 0
  }

  /**
   * Uses system libraries to speak text via the speakers and stream it back.
   *
   * @param {string} text Text to be spoken
   * @param {string|null} voice Name of voice to be spoken with
   * @param {number|null} speed Speed of text (e.g. 1.0 for normal, 0.5 half, 2.0 double)
   */
  stream(text, voice, speed) {
    return new Promise((resolve, reject) => {
      if (!text) {
        reject(new TypeError('say.stream(): must provide text parameter'))
        return
      }
      const my_uuid = uuidv4();
      try {
        var { command, args, options } = this.buildStreamCommand({
          uuid: my_uuid,
          text: symbolTTS(text),
          voice,
          speed
        })
      } catch (error) {
        reject(error)
        return
      }
      this.child = childProcess.spawn(command, args, options);
      this.child.stdin.setEncoding('utf-8');
      this.child.stderr.setEncoding('utf-8');
      const audioStream = [];
      // The Old Way:
      // let ignoreCHCP = true;
      // this.child.stdout.on('data', data => {
      //   if (!ignoreCHCP || !data.toString().includes('Active code page: 65001')) {
      //     if (ignoreCHCP) ignoreCHCP = false;
      //     // console.log('Output from PowerShell:', data.toString());
      //     for (const audioBit of data.toString().split('\r\n')) {
      //       if (audioBit.trim() !== '') {
      //         audioStream.push(parseInt(audioBit.trim()));
      //       }
      //     }
      //   }
      // })
      const audioDataHandler = ({ uniqueId, audioBuffer }) => {
        if (uniqueId === my_uuid) {
          // Do something with the received audio data in the scope of streamRealTime
          console.log('Received audio data for ID', uniqueId, ':', audioBuffer);
          resolve(audioBuffer)
          // Remove the event listener after processing the data once
          eventEmitter.removeListener('audioData', audioDataHandler);
        }
      };
      eventEmitter.on('audioData', audioDataHandler);
      this.child.stderr.on('data', data => {
        console.error('Error output from PowerShell:', data.toString());
        reject(new Error(data.toString()))
      })
      this.child.stdin.end()
      this.child.addListener('exit', (code, signal) => {
        if (code === null || signal !== null) return reject(new Error(`say.stream(): could not talk, had an error [code: ${code}] [signal: ${signal}]`))
        this.child = null
      })
    });
  }

  /**
   * Uses system libraries to speak text via the speakers and stream it back in real time.
   *
   * @param {string} text Text to be spoken
   * @param {string|null} voice Name of voice to be spoken with
   * @param {number|null} speed Speed of text (e.g. 1.0 for normal, 0.5 half, 2.0 double)
   * @param {Function|null} data_callback A callback of type function to return data.
   * @param {Function|null} finish_callback A callback of type function to return all the data.
   * @param {Function|null} error_callback A callback of type function(err) to return.
   */
  streamRealTime(text, voice, speed, data_callback, finish_callback, error_callback) {
    if (typeof data_callback !== 'function') data_callback = () => { };
    if (typeof finish_callback !== 'function') finish_callback = () => { };
    finish_callback = once(finish_callback);
    if (typeof error_callback !== 'function') error_callback = () => { };
    error_callback = once(error_callback);
    if (!text) {
      return setImmediate(() => {
        error_callback(new TypeError('say.streamRealTime(): must provide text parameter'))
      })
    }
    const my_uuid = uuidv4();
    try {
      var { command, args, options } = this.buildStreamRealTimeCommand({
        uuid: my_uuid,
        text: symbolTTS(text),
        voice,
        speed
      });
    } catch (error) {
      return setImmediate(() => {
        error_callback(error);
      })
    }
    this.child = childProcess.spawn(command, args, options);
    this.child.stdin.setEncoding('utf-8');
    this.child.stderr.setEncoding('utf-8');
    const audioDataHandler = ({ uniqueId, audioBuffer }) => {
      if (uniqueId === my_uuid) {
        // Do something with the received audio data in the scope of streamRealTime
        console.log('Received audio data for ID', uniqueId, ':', audioBuffer);
        data_callback(audioBuffer)
        // Remove the event listener after processing the data once
        eventEmitter.removeListener('audioData', audioDataHandler);
      }
    };
    eventEmitter.on('audioData', audioDataHandler);
    this.child.stderr.on('data', data => {
      console.error('Error output from PowerShell:', data.toString());
      error_callback(new Error(data.toString()))
    })
    this.child.stdin.end()
    this.child.addListener('exit', (code, signal) => {
      if (code === null || signal !== null) return reject(new Error(`say.streamRealTime(): could not talk, had an error [code: ${code}] [signal: ${signal}]`))
      this.child = null
      finish_callback()
    })
  }

  /**
   * Uses system libraries to speak text via the speakers.
   *
   * @param {string} text Text to be spoken
   * @param {string|null} voice Name of voice to be spoken with
   * @param {number|null} speed Speed of text (e.g. 1.0 for normal, 0.5 half, 2.0 double)
   * @param {Function|null} callback A callback of type function(err) to return.
   */
  speak(text, voice, speed, callback) {
    if (typeof callback !== 'function') {
      callback = () => { }
    }

    callback = once(callback)

    if (!text) {
      return setImmediate(() => {
        callback(new TypeError('say.speak(): must provide text parameter'))
      })
    }

    let { command, args, pipedData, options } = this.buildSpeakCommand({
      text: symbolTTS(text),
      voice,
      speed
    })

    this.child = childProcess.spawn(command, args, options)

    this.child.stdin.setEncoding('utf-8')
    this.child.stderr.setEncoding('utf-8')

    if (pipedData) {
      this.child.stdin.end(pipedData)
    }

    this.child.stderr.once('data', (data) => {
      // we can't stop execution from this function
      callback(new Error(data))
    })

    this.child.addListener('exit', (code, signal) => {
      if (code === null || signal !== null) {
        return callback(new Error(`say.speak(): could not talk, had an error [code: ${code}] [signal: ${signal}]`))
      }

      this.child = null

      callback(null)
    })
  }

  /**
   * Uses system libraries to speak text via the speakers.
   *
   * @param {string} text Text to be spoken
   * @param {string|null} voice Name of voice to be spoken with
   * @param {number|null} speed Speed of text (e.g. 1.0 for normal, 0.5 half, 2.0 double)
   * @param {string} filename Path to file to write audio to, e.g. "greeting.wav"
   * @param {Function|null} callback A callback of type function(err) to return.
   */
  export(text, voice, speed, filename, callback) {
    if (typeof callback !== 'function') {
      callback = () => { }
    }

    callback = once(callback)

    if (!text) {
      return setImmediate(() => {
        callback(new TypeError('say.export(): must provide text parameter'))
      })
    }

    if (!filename) {
      return setImmediate(() => {
        callback(new TypeError('say.export(): must provide filename parameter'))
      })
    }

    try {
      var { command, args, pipedData, options } = this.buildExportCommand({
        text: symbolTTS(text),
        voice,
        speed,
        filename
      })
    } catch (error) {
      return setImmediate(() => {
        callback(error)
      })
    }

    this.child = childProcess.spawn(command, args, options)

    this.child.stdin.setEncoding('utf-8')
    this.child.stderr.setEncoding('utf-8')

    if (pipedData) {
      this.child.stdin.end(pipedData)
    }

    this.child.stderr.once('data', (data) => {
      // we can't stop execution from this function
      callback(new Error(data))
    })

    this.child.addListener('exit', (code, signal) => {
      if (code === null || signal !== null) {
        return callback(new Error(`say.export(): could not talk, had an error [code: ${code}] [signal: ${signal}]`))
      }

      this.child = null

      callback(null)
    })
  }

  /**
   * Stops currently playing audio. There will be unexpected results if multiple audios are being played at once
   *
   * TODO: If two messages are being spoken simultaneously, childD points to new instance, no way to kill previous
   *
   * @param {Function|null} callback A callback of type function(err) to return.
   */
  stop(callback) {
    if (typeof callback !== 'function') {
      callback = () => { }
    }

    callback = once(callback)

    if (!this.child) {
      return setImmediate(() => {
        callback(new Error('say.stop(): no speech to kill'))
      })
    }

    this.runStopCommand()

    this.child = null

    callback(null)
  }

  convertSpeed(speed) {
    return Math.ceil(this.baseSpeed * speed)
  }

  /**
   * Get Installed voices on system
   * @param {Function} callback A callback of type function(err,voices) to return.
   */
  getInstalledVoices(callback) {
    if (typeof callback !== 'function') {
      callback = () => { }
    }
    callback = once(callback)

    let { command, args } = this.getVoices()
    var voices = []
    this.child = childProcess.spawn(command, args)

    this.child.stdin.setEncoding('utf-8')
    this.child.stderr.setEncoding('utf-8')

    this.child.stderr.once('data', (data) => {
      // we can't stop execution from this function
      callback(new Error(data))
    })
    let ignoreCHCP = true;
    this.child.stdout.on('data', function (data) {
      if (!ignoreCHCP || !data.toString().includes('Active code page: 65001')) {
        if (ignoreCHCP) ignoreCHCP = false;
        // console.log('Output from PowerShell:', data.toString());
        voices += data
      }
    })

    this.child.addListener('exit', (code, signal) => {
      if (code === null || signal !== null) {
        return callback(new Error(`say.getInstalledVoices(): could not get installed voices, had an error [code: ${code}] [signal: ${signal}]`))
      }
      if (voices.length > 0) {
        voices = voices.split('\r\n')
        voices = (voices[voices.length - 1] === '') ? voices.slice(0, voices.length - 1) : voices
      }
      this.child = null
      const tmp_voices = [];
      for (const voice of voices) {
        if (voice !== 'Active code page: 65001') tmp_voices.push(voice); // UTF8 Support
      }
      voices = tmp_voices;
      callback(null, voices)
    })

    this.child.stdin.end()
  }
}

module.exports = SayPlatformBase
