const net = require('net');
const EventEmitter = require('events');

const server = new net.Server();
const eventEmitter = new EventEmitter();

server.on('connection', (socket) => { // Scope is per client
    // console.log('Client connected');
    let uniqueId;
    let audioChunks = [];
    socket.on('data', (chunk) => {
        // If uniqueId is not yet received, assume the data is the uniqueId
        if (!uniqueId) {
            uniqueId = chunk.toString().trim();
            // console.log('Received unique ID:', uniqueId);
        } else {
            // Otherwise, append the audio data to audioChunks
            audioChunks.push(chunk);
        }
    });
    socket.on('end', () => {
        // When the data transmission ends, concatenate the audio chunks into a buffer
        const audioBuffer = Buffer.concat(audioChunks);
        // console.log('Received audio data for ID', uniqueId, ':', audioBuffer);
        // Emit an event with the audio data and uniqueId
        eventEmitter.emit('audioData', { uniqueId, audioBuffer });
        // Reset variables for the next request
        uniqueId = undefined;
        audioChunks = [];
    });
    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});
server.on('error', (err) => {
    console.error('Server error:', err);
});
server.listen(42022, '127.0.0.1', () => { // Make sure to block this port to the outside world on production
    console.log('Local Server listening on port 42022');
});

module.exports = eventEmitter;
