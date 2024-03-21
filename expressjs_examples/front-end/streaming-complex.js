(function () {
  'use strict';

  // Created by Burgil
  const playButton = document.getElementById('playButton');
  const textInput = document.getElementById('textInput');
  const voiceSelect = document.getElementById('voiceSelect');
  const dbValueElement = document.getElementById('dbValue');
  const levelElement = document.getElementById('level');
  const waveformNormalCanvas = document.getElementById('normal-waveform');
  const waveformNormalCtx = waveformNormalCanvas.getContext('2d');
  const waveformCanvas = document.getElementById('waveform');
  const waveformCtx = waveformCanvas.getContext('2d');
  const waveformRoundCanvas = document.getElementById('round-waveform');
  const waveformRoundCtx = waveformRoundCanvas.getContext('2d');

  // Created by Burgil
  fetch('http://localhost/voices').then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }).then(voices => {
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice;
      option.textContent = voice;
      voiceSelect.appendChild(option);
    });
  }).catch(error => {
    console.error('There was a problem fetching available voices:', error);
  });

  playButton.onclick = () => play();

  // Created by Burgil
  async function play() { // Play button click event listener
    const text = textInput.value;
    const voice = voiceSelect.value;
    try {
      const response = await fetch('http://localhost/tts-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, voice })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Old method that also works but lags the UI for a moment: (Cool way to end uint8Arrays with express.js)
      // const responseData = await response.json();
      // let audioData = new Uint8Array(Object.values(responseData).join().split(','));
      const responseData = await response.arrayBuffer();
      let audioData = new Uint8Array(responseData);
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const responseBuffer = await audioContext.decodeAudioData(audioData.buffer.slice(0));
      const source = audioContext.createBufferSource();
      source.buffer = responseBuffer;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start();

      // Update decibel levels and visualization
      updateDecibel();

      // Created by Burgil
      function updateDecibel() {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, cur) => acc + cur, 0);
        const average = sum / bufferLength;
        const db = 20 * Math.log10(average / 255);
        dbValueElement.textContent = db.toFixed(2);
        const normalizedValue = Math.min(Math.max(average / 255, 0), 1);
        levelElement.style.width = `${normalizedValue * 100}%`;
        levelElement.style.backgroundColor = `hsl(${120 * (1 - normalizedValue)}, 100%, 50%)`;
        drawWaveform(dataArray, bufferLength);
        drawCircularWaveform(dataArray, bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        drawOscilloscope(dataArray, bufferLength);
        requestAnimationFrame(updateDecibel);
      }
    } catch (error) {
      console.error('There was a problem playing audio:', error);
    }
  }

  // Created by Burgil
  function drawWaveform(dataArray, bufferLength) {
    waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
    waveformCtx.beginPath();
    const sliceWidth = waveformCanvas.width * 1.0 / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = waveformCanvas.height - v * waveformCanvas.height / 2;
      if (i === 0) {
        waveformCtx.moveTo(x, y);
      } else {
        waveformCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    waveformCtx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    waveformCtx.lineWidth = 0.5;
    waveformCtx.stroke();
  }

  // Created by Burgil
  function drawCircularWaveform(dataArray, bufferLength, offset = 130) {
    const centerX = waveformRoundCanvas.width / 2;
    const centerY = waveformRoundCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - offset;
    const sliceAngle = (Math.PI * 2) / bufferLength;
    waveformRoundCtx.clearRect(0, 0, waveformRoundCanvas.width, waveformRoundCanvas.height);
    waveformRoundCtx.lineWidth = 2;
    waveformRoundCtx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    for (let j = 0; j < 4; j++) {
      waveformRoundCtx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        const angle = sliceAngle * i;
        const copyAngle = angle + (j * Math.PI / 2);
        const amplitude = dataArray[i] / 128.0;
        const x = centerX + Math.cos(copyAngle) * radius;
        const y = centerY + Math.sin(copyAngle) * radius;
        const endX = centerX + Math.cos(copyAngle) * (radius + amplitude * radius);
        const endY = centerY + Math.sin(copyAngle) * (radius + amplitude * radius);
        waveformRoundCtx.moveTo(x, y);
        waveformRoundCtx.lineTo(endX, endY);
      }
      waveformRoundCtx.stroke();
    }
  }

  function drawOscilloscope(dataArray, bufferLength) { // Almost untouched, self constructed - Original source is Mozilla Docs: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
    waveformNormalCtx.fillStyle = "rgb(255 255 255)";
    waveformNormalCtx.fillRect(0, 0, waveformNormalCanvas.width, waveformNormalCanvas.height);
    waveformNormalCtx.lineWidth = 2;
    waveformNormalCtx.strokeStyle = "rgb(0 0 0)";
    waveformNormalCtx.beginPath();
    const sliceWidth = (waveformNormalCanvas.width * 1.0) / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * waveformNormalCanvas.height) / 2;
      if (i === 0) {
        waveformNormalCtx.moveTo(x, y);
      } else {
        waveformNormalCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    waveformNormalCtx.lineTo(waveformNormalCanvas.width, waveformNormalCanvas.height / 2);
    waveformNormalCtx.stroke();
  }
}());