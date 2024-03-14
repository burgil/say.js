const childProcess = require('child_process')

const SayPlatformBase = require('./base.js')

const BASE_SPEED = 0 // Unsupported
const COMMAND = 'powershell'

// Make 3rd party voice available: https://github.com/Marak/say.js/pull/124/commits/54db0b2461c6684c3af3c7b7e457c09eb68242a8#diff-0050c265833e044a117f818c557214bf7743ef0c0e0922837c38f691c03f5a74

class SayPlatformWin32 extends SayPlatformBase {
  constructor() {
    super()
    this.baseSpeed = BASE_SPEED
  }

  buildSpeakCommand({ text, voice, speed }) {
    let args = [];
    let options = {};
    let psCommand = `chcp 65001;`; // Change powershell encoding to utf-8
    psCommand += `Add-Type -AssemblyName System.speech;`;
    psCommand += `$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;`;
    if (voice) psCommand += `$speak.SelectVoice('${voice}');`;
    if (speed) {
      let adjustedSpeed = this.convertSpeed(speed || 1);
      psCommand += `$speak.Rate = ${adjustedSpeed};`;
    }
    psCommand += `$speak.Speak([Console]::In.ReadToEnd())`;
    // console.log("PowerShell Script:", psCommand);
    args.push(psCommand);
    options.shell = true;
    return { command: COMMAND, args, pipedData: text, options };
  }

  buildExportCommand({ text, voice, speed, filename }) {
    let args = [];
    let options = {};
    let psCommand = `chcp 65001;`; // Change powershell encoding to utf-8
    psCommand += `Add-Type -AssemblyName System.speech;`;
    psCommand += `$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;`;
    if (voice) psCommand += `$speak.SelectVoice('${voice}');`;
    if (speed) {
      let adjustedSpeed = this.convertSpeed(speed || 1);
      psCommand += `$speak.Rate = ${adjustedSpeed};`;
    }
    if (!filename) {
      throw new Error('Filename must be provided in export();');
    } else {
      psCommand += `$speak.SetOutputToWaveFile('${filename}');`; // https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer.setoutputtowavefile?view=dotnet-plat-ext-8.0
    }
    psCommand += `$speak.Speak([Console]::In.ReadToEnd());$speak.Dispose()`;
    // console.log("PowerShell Script:", psCommand);
    args.push(psCommand);
    options.shell = true;

    return { command: COMMAND, args, pipedData: text, options };
  }

  buildStreamCommand({ text, voice, speed }) { // Created by Burgil
    let args = [];
    let options = {};
    let psCommand = `chcp 65001;`; // Change powershell encoding to utf-8
    psCommand += `Add-Type -AssemblyName System.speech;`;
    psCommand += `$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;`;
    if (voice) psCommand += `$speak.SelectVoice('${voice}');`;
    if (speed) {
      let adjustedSpeed = this.convertSpeed(speed || 1);
      psCommand += `$speak.Rate = ${adjustedSpeed};`
    }
    psCommand += `$streamAudio = New-Object System.IO.MemoryStream;`;
    psCommand += `$speak.SetOutputToWaveStream($streamAudio);`; // https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer.setoutputtowavefile?view=dotnet-plat-ext-8.0
    psCommand += `$handler = { param([object]$sender, [System.Speech.Synthesis.SpeechEventArgs]$eventArgs); $audioChunk = $eventArgs.AudioData; $streamAudio.Write($audioChunk, 0, $audioChunk.Length); };`;
    psCommand += `Register-ObjectEvent -InputObject $speak -EventName "SpeakProgress" -Action $handler -SourceIdentifier "SpeechEventHandler";`;
    psCommand += `$speak.Speak('${text.replace(/'/g, "''")}');`;
    psCommand += `Unregister-Event -SourceIdentifier "SpeechEventHandler";`;
    psCommand += `$streamAudio.Flush();`;
    psCommand += `$streamAudio.Position = 0;`;
    psCommand += `$streamAudio.ToArray();`;
    // console.log("PowerShell Script:", psCommand);
    args.push(psCommand);
    options.shell = true;
    return { command: COMMAND, args, pipedData: text, options };
  }

  runStopCommand() {
    this.child.stdin.pause();
    childProcess.exec(`taskkill /pid ${this.child.pid} /T /F`);
  }

  convertSpeed(speed) {
    // Overriden to map playback speed (as a ratio) to Window's values (-10 to 10, zero meaning x1.0)
    return Math.max(-10, Math.min(Math.round((9.0686 * Math.log(speed)) - 0.1806), 10));
  }

  getVoices() {
    let args = [];
    let psCommand = `chcp 65001;`; // Change powershell encoding to utf-8
    psCommand += 'Add-Type -AssemblyName System.speech;';
    psCommand += '$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;$speak.GetInstalledVoices() | % {$_.VoiceInfo.Name}';
    // console.log("PowerShell Script:", psCommand);
    args.push(psCommand);
    return { command: COMMAND, args };
  }
}

module.exports = SayPlatformWin32
