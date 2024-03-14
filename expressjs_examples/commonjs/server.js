const say = require('say');
const express = require('express');
const path = require('path');
const cors = require('cors');
const wav = require('wav');
const { PassThrough, Readable } = require('stream');
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

// Route for text-to-speech streaming - slow
app.post('/tts-stream', async (req, res) => {
    const { text, voice, speed } = req.body;
    try {
        // Stream spoken audio
        const spokenBuffer = await say.stream(text, voice, speed);
        
        // Encode the spoken audio buffer as base64
        const base64Data = spokenBuffer.toString('base64');

        // Set the response headers for base64 audio data
        res.set({
            'Content-Type': 'text/plain'
        });

        // Send the base64-encoded audio data as the response
        res.send(base64Data);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'An error occurred while generating speech.' });
    }
});

// app.post('/tts-stream', async (req, res) => {
//     const { text, voice, speed } = req.body;
//     try {
//         // Stream spoken audio
//         const spokenBuffer = await say.stream(text, voice, speed);
//         // Set the response headers for WAV format
//         res.set({
//             'Content-Type': 'audio/wav',
//             'Content-Disposition': 'attachment; filename="speech.wav"'
//         });
//         // Send the spoken audio buffer as the response
//         res.send(spokenBuffer);
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({ error: 'An error occurred while generating speech.' });
//     }
// });

// app.post('/tts-stream', async (req, res) => {
//     const { text, voice, speed } = req.body;
//     try {
//         // Stream spoken audio
//         const spokenBuffer = await say.stream(text, voice, speed);
        
//         // Convert buffer to Uint8Array
//         const uint8Array = new Uint8Array(spokenBuffer);

//         // Set the response headers for WAV format
//         res.set({
//             'Content-Type': 'audio/wav',
//             'Content-Disposition': 'attachment; filename="speech.wav"'
//         });

//         // Send the spoken audio buffer as the response
//         res.send(uint8Array);
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({ error: 'An error occurred while generating speech.' });
//     }
// });

// app.post('/tts-stream', async (req, res) => {
//     const { text, voice, speed } = req.body;
//     try {
//         // Stream spoken audio
//         const spokenBuffer = await say.stream(text, voice, speed);
//         // Set the response headers for WAV format
//         res.set({
//             'Content-Type': 'audio/wav',
//             'Content-Disposition': 'attachment; filename="speech.wav"'
//         });
//         // Send the spoken audio buffer as the response
//         res.send(spokenBuffer);
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({ error: 'An error occurred while generating speech.' });
//     }
// });
// app.post('/tts-stream', async (req, res) => {
//     const { text, voice, speed } = req.body;
//     try {
//         // Stream spoken audio
//         const spokenBuffer = await say.stream(text, voice, speed);
//         // Convert buffer to readable stream
//         const spokenStream = new Readable();
//         spokenStream.push(spokenBuffer);
//         spokenStream.push(null);
//         // Set the response headers
//         res.set({
//             'Content-Type': 'audio/wav',
//             'Content-Disposition': 'attachment; filename="speech.wav"'
//         });
//         // Pipe the spoken stream to the response
//         spokenStream.pipe(res);
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({ error: 'An error occurred while generating speech.' });
//     }
// });
// app.post('/tts-stream', async (req, res) => {
//     const { text, voice, speed } = req.body;
//     try {
//         // Stream spoken audio
//         const spokenBuffer = await say.stream(text, voice, speed);
//         // Convert buffer to readable stream
//         const spokenStream = new PassThrough();
//         spokenStream.end(spokenBuffer);
//         // Create a WAV encoder stream
//         const wavEncoder = new wav.Writer({
//             sampleRate: 16000,  // Adjust sample rate if needed
//             channels: 1,        // Adjust number of channels if needed
//             bitDepth: 16        // Adjust bit depth if needed
//         });
//         // Pipe the spoken stream to the WAV encoder
//         spokenStream.pipe(wavEncoder);
//         // Set the response headers
//         res.setHeader('Content-Type', 'audio/wav');
//         // Pipe the WAV encoder to the response
//         wavEncoder.pipe(res);
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({ error: 'An error occurred while generating speech.' });
//     }
// });

// Route for text-to-speech streaming in real time - fast
app.post('/tts-stream-real-time', async (req, res) => {
    const { text, voice, speed } = req.body;
    try {
        const passThroughStream = new PassThrough();

        // Stream spoken audio in real-time
        say.streamRealTime(text, voice, speed,
            // Data callback
            (data) => {
                // Write data to the PassThrough stream
                passThroughStream.write(data);
            },
            // Finish callback
            () => {
                // End the PassThrough stream when speech is complete
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
