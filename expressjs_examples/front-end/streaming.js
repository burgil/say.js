const playButton = document.getElementById('playButton');
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');

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

// Created by Burgil
playButton.addEventListener('click', async () => { // Play button click event listener
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
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        source = audioCtx.createBufferSource();
        audioCtx.decodeAudioData(audioData.buffer.slice(0), function (buffer) {
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
        }, function (e) {
            console.log("Error with decoding audio data: " + e.err);
        });
    } catch (error) {
        console.error('There was a problem playing audio:', error);
    }
});
// Created by Burgil