const say = require('say');
const express = require('express');
const path = require('path');
const cors = require('cors');
const { PassThrough } = require('stream');
const app = express();
app.use(cors({
    origin: '*', // Allows access to all origins! - Insecure - Replace with site url in real world applications - http://example.com
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(express.json());

// app.use('/files', express.static(path.join(__dirname, '../files')));
// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname, '../front-end/mp3.html'));
// });

// Route for text-to-speech export
app.post('/tts-export', (req, res) => { // warning unless some unique uuid will be used instead of output.wav as the file name then conflicts will happen in run time - TODO: add tmp folder and UUID as file name and also delete the files after usage - but who the heck will even want to stream it like this?
    const { text, voice } = req.body;
    const filePath = path.join(__dirname, 'output.wav');
    say.export(text, voice, 1, filePath, (err) => {
        if (err) {
            console.error('Error generating speech:', err);
            return res.status(500).json({ error: 'An error occurred while generating speech.' });
        }
        res.set({
            'Content-Type': 'audio/wav',
            'Content-Disposition': 'attachment; filename="speech.wav"'
        });
        res.sendFile(filePath);
    });
});

// Route for text-to-speech streaming
app.post('/tts-stream', async (req, res) => {
    const { text, voice, speed } = req.body;
    try {
        const spokenStream = await say.stream(text, voice, speed);
        res.setHeader('Content-Type', 'audio/wav');
        spokenStream.pipe(res);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'An error occurred while generating speech.' });
    }
});

// Route for text-to-speech streaming in real time

app.post('/tts-stream-real-time', async (req, res) => {
    const { text, voice, speed } = req.body;
    try {
        const passThroughStream = new PassThrough();
        
        // Stream spoken audio in real-time
        say.streamRealTime(text, voice, speed,
            // Data callback
            (data) => {
                // Send each chunk of audio data to the client in real-time
                passThroughStream.write(data);
            },
            // Finish callback
            () => {
                // Finish streaming when speech is complete
                passThroughStream.end();
            },
            // Error callback
            (err) => {
                // Handle any errors during streaming
                console.error('Error:', err);
                res.status(500).json({ error: 'An error occurred while generating speech.' });
            }
        );

        // Set the response headers
        res.setHeader('Content-Type', 'audio/wav');
        
        // Pipe the PassThrough stream to the response
        passThroughStream.pipe(res);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'An error occurred while generating speech.' });
    }
});

app.get('/voices', async function (req, res) {
    say.getInstalledVoices((err, voices) => {
        if (err) {
            console.error('Error retrieving installed voices:', err);
            return res.status(500).json({ error: 'An error occurred while retrieving voices.' });
        }
        res.json(voices);
    });
});

const port = 80;
app.listen(port);
console.log('Server started at http://localhost:' + port);

// stream spoken audio test
async function test() {
    try {
        const spokenStream = await say.stream("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75);
        console.log(spokenStream) // Buffer - Not Uint8Array yet ?
    } catch (e) {
        console.error("Error:", e)
    }
}
test();
