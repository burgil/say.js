const say = require('../')

// Stream spoken audio in real time
const audioStream = [];
say.streamRealTime("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75, (data) => {
    console.log(data)
    audioStream.push(data);
}, (finalAudioStream) => {
    console.log("Finished!", finalAudioStream.length === audioStream.length, finalAudioStream.length, audioStream.length, finalAudioStream, audioStream);
}, (err) => {
    console.error(err);
});
