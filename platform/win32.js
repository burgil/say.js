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
    // psCommand += `$formatInfo = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono);`;
    // psCommand += `$speak.SetOutputToAudioStream($streamAudio, $formatInfo);`; // https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer.setoutputtoaudiostream?view=dotnet-plat-ext-8.0
    psCommand += `$speak.SetOutputToWaveStream($streamAudio);`; // https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer.setoutputtowavefile?view=dotnet-plat-ext-8.0
    // psCommand += `$handler = { param([object]$sender, [System.Speech.Synthesis.SpeechEventArgs]$eventArgs); $audioChunk = $eventArgs.AudioData; $streamAudio.Write($audioChunk, 0, $audioChunk.Length); };`;
    // psCommand += `Register-ObjectEvent -InputObject $speak -EventName "SpeakProgress" -Action $handler -SourceIdentifier "SpeechEventHandler";`;
    psCommand += `$speak.Speak('${text.replace(/'/g, "''")}');`;
    // psCommand += `Unregister-Event -SourceIdentifier "SpeechEventHandler";`;
    psCommand += `$streamAudio.Flush();`;
    psCommand += `$streamAudio.Position = 0;`;
    psCommand += `$streamAudio.ToArray();`;
    // psCommand += `$audioBytes = $streamAudio.ToArray();`;
    psCommand += `$speak.Dispose();`;
    psCommand += `$streamAudio.Dispose();`;
    // psCommand += `$audioBytes;`;
    // console.log("PowerShell Script:", psCommand);
    args.push(psCommand);
    options.shell = true;
    return { command: COMMAND, args, options };
  }

  buildStreamRealTimeCommand({ text, voice, speed }) {
    let args = [];
    let options = {};
    let psCommand = `chcp 65001;`; // Change PowerShell encoding to utf-8
    psCommand += `$text = '${text.replace(/'/g, "''")}';`;
    psCommand += `$voice = '${voice || ''}';`; // Voice is optional
    psCommand += `$speed = ${this.convertSpeed(speed || 1)};`; // Speed is optional
    psCommand += `$audioBytes = (Add-Type -AssemblyName System.speech;`;
    psCommand += ` $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;`;
    psCommand += ` if ($voice) { $speak.SelectVoice($voice) };`; // Select voice if provided
    psCommand += ` $speak.Rate = $speed;`; // Set speed if provided
    psCommand += ` $streamAudio = New-Object System.IO.MemoryStream;`;
    psCommand += ` $speak.SetOutputToWaveStream($streamAudio);`;
    psCommand += ` $speak.Speak($text);`;
    psCommand += ` $streamAudio.Flush();`;
    psCommand += ` $streamAudio.Position = 0;`;
    psCommand += ` $audioBytes = $streamAudio.ToArray());`;
    psCommand += `$response = Invoke-WebRequest -Uri "http://localhost:3000/upload" -Method POST -Body $audioBytes -ContentType "application/octet-stream";`; // Change URL to match your Node.js server endpoint
    psCommand += `$response.StatusCode;`; // Output status code
    options.shell = true;
    args.push(psCommand);
    return { command: COMMAND, args, options };
  }

  // buildStreamRealTimeWebServerCommand({ text, voice, speed }) { // Created by Burgil
  //   let args = [];
  //   let options = {};
  //   let psCommand = `chcp 65001;`; // Change powershell encoding to utf-8
  //   psCommand += `$listener = [System.Net.Sockets.TcpListener]::new('127.0.0.1', 12345);`; // port conflict requires attention
  //   psCommand += `$listener.Start();`;
  //   psCommand += `$client = $listener.AcceptTcpClient();`;
  //   psCommand += `$stream = $client.GetStream();`;
  //   psCommand += `Add-Type -AssemblyName System.speech;`;
  //   psCommand += `$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;`;
  //   if (voice) psCommand += `$speak.SelectVoice('${voice}');`;
  //   if (speed) {
  //     let adjustedSpeed = this.convertSpeed(speed || 1);
  //     psCommand += `$speak.Rate = ${adjustedSpeed};`
  //   }
  //   psCommand += `$streamAudio = New-Object System.IO.MemoryStream;`;
  //   psCommand += `$speak.SetOutputToWaveStream($streamAudio);`; // https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer.setoutputtowavefile?view=dotnet-plat-ext-8.0
  //   psCommand += `$speak.Speak('${text.replace(/'/g, "''")}');`;
  //   psCommand += `$streamAudio.Flush();`;
  //   psCommand += `$streamAudio.Position = 0;`;
  //   psCommand += `$audioBytes = $streamAudio.ToArray();`;
  //   psCommand += `$stream.Write($audioBytes, 0, $audioBytes.Length);`;
  //   psCommand += `$speak.Dispose();`;
  //   psCommand += `$streamAudio.Dispose();`;
  //   psCommand += `$stream.Close();`;
  //   psCommand += `$client.Close();`;
  //   // console.log("PowerShell Script:", psCommand);
  //   args.push(psCommand);
  //   options.shell = true;
  //   return { command: COMMAND, args, options };
  // }

  // buildStreamRealTimeChunksCommand({ text, voice, speed }) {
  //   let args = [];
  //   let options = {};
  //   let psCommand = `chcp 65001;`; // Change PowerShell encoding to utf-8
  //   psCommand += `$listener = [System.Net.Sockets.TcpListener]::new('127.0.0.1', 12345);`; // port conflict requires attention
  //   psCommand += `$listener.Start();`;
  //   psCommand += `$client = $listener.AcceptTcpClient();`;
  //   psCommand += `$stream = $client.GetStream();`;
  //   psCommand += `Add-Type -AssemblyName System.speech;`;
  //   psCommand += `$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;`;
  //   if (voice) psCommand += `$speak.SelectVoice('${voice}');`;
  //   if (speed) {
  //     let adjustedSpeed = this.convertSpeed(speed || 1);
  //     psCommand += `$speak.Rate = ${adjustedSpeed};`
  //   }
  //   psCommand += `$chunkSize = 256;`; // Adjust the chunk size as needed
  //   psCommand += `$chunks = [System.Collections.Generic.List[string]]::new();`;
  //   psCommand += `$textToSpeak = '${text.replace(/'/g, "''")}';`;
  //   psCommand += `for ($i = 0; $i -lt $textToSpeak.Length; $i += $chunkSize) {`;
  //   psCommand += `    $chunks.Add($textToSpeak.Substring($i, [Math]::Min($chunkSize, $textToSpeak.Length - $i)));`;
  //   psCommand += `}`;
  //   psCommand += `foreach ($chunk in $chunks) {`;
  //   psCommand += `    $streamAudio = New-Object System.IO.MemoryStream;`;
  //   psCommand += `    $speak.SetOutputToWaveStream($streamAudio);`;
  //   psCommand += `    $speak.Speak($chunk);`;
  //   psCommand += `    $streamAudio.Flush();`;
  //   psCommand += `    $streamAudio.Position = 0;`;
  //   psCommand += `    $audioBytes = $streamAudio.ToArray();`;
  //   psCommand += `    $streamAudio.Dispose();`;
  //   psCommand += `    $stream.Write($audioBytes, 0, $audioBytes.Length);`;
  //   psCommand += `}`;
  //   // psCommand += `$stream.Close();`;
  //   psCommand += `$client.Close();`;
  //   psCommand += `$listener.Close();`;
  //   args.push(psCommand);
  //   options.shell = true;
  //   return { command: COMMAND, args, options };
  // }

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
