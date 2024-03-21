const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const audioPlayer = document.getElementById('audioPlayer');
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
playButton.addEventListener('click', () => {
  const text = textInput.value;
  const voice = voiceSelect.value;
  fetch('http://localhost/tts-export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, voice })
  }).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.blob();
  }).then(blob => {
    const blobURL = URL.createObjectURL(blob);
    audioPlayer.src = blobURL;
    audioPlayer.play();
  })
});

// Created by Burgil
stopButton.addEventListener('click', () => {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
});