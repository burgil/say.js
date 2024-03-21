(function () {
    'use strict';

    // Created by Burgil
    const URL = '/files/test.mp3'; // Requires a running web server - Can be a full URL or relative URL
    const playButton = document.querySelector('#play');
    const dbValueElement = document.querySelector('#dbValue');
    const levelElement = document.querySelector('#level');
    const waveformNormalCanvas = document.getElementById('normal-waveform');
    const waveformNormalCtx = waveformNormalCanvas.getContext('2d');
    const waveformCanvas = document.getElementById('waveform');
    const waveformCtx = waveformCanvas.getContext('2d');
    const waveformRoundCanvas = document.getElementById('round-waveform');
    const waveformRoundCtx = waveformRoundCanvas.getContext('2d');

    playButton.onclick = () => play();

    // Created by Burgil
    async function play() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await window.fetch(URL);
        const responseBuffer = await response.arrayBuffer();
        const arrayBuffer = await audioContext.decodeAudioData(responseBuffer);
        playButton.disabled = true;
        let isPlayingSound = true;
        let soundDelay = 0;
        const source = audioContext.createBufferSource();
        source.buffer = arrayBuffer;
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.onended = () => {
            playButton.disabled = false;
            isPlayingSound = false;
        };
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        source.start();

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
            if (!isPlayingSound) soundDelay++;
            if (soundDelay < 120) {
                requestAnimationFrame(updateDecibel);
            } else {
                levelElement.style.width = `0%`;
                levelElement.style.backgroundColor = `hsl(120, 100%, 50%)`;
                const emptyBufferLength = new Uint8Array();
                drawWaveform(emptyBufferLength, bufferLength);
                drawCircularWaveform(emptyBufferLength, bufferLength);
                drawOscilloscope(emptyBufferLength, bufferLength);
            }
        }
        updateDecibel();
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
        // waveformRoundCtx.beginPath();
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
                // waveformRoundCtx.beginPath();
                // console.log({endX,endY},{x,y})
                waveformRoundCtx.moveTo(x, y); // Move to the start position
                waveformRoundCtx.lineTo(endX, endY); // Draw a line to the end position
                // if (i === 0) {
                //     waveformRoundCtx.moveTo(x, y); // Move to the start position
                // } else {
                //     waveformRoundCtx.lineTo(endX, endY); // Draw a line to the end position
                // }
                // waveformRoundCtx.closePath();
                // waveformRoundCtx.stroke();
            }
            waveformRoundCtx.closePath();
            waveformRoundCtx.stroke();
        }
        // waveformRoundCtx.closePath();
        // waveformRoundCtx.stroke();
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