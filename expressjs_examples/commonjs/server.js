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
// app.post('/tts-stream', async (req, res) => {
//     const { text, voice, speed } = req.body;
//     try {
//         // Stream spoken audio
//         const spokenBuffer = await say.stream(text, voice, speed);
        
//         // Encode the spoken audio buffer as base64
//         const base64Data = spokenBuffer.toString('base64');

//         // Set the response headers for base64 audio data
//         res.set({
//             'Content-Type': 'text/plain'
//         });

//         // Send the base64-encoded audio data as the response
//         res.send(base64Data);
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
// async function a() {
//     const spokenBuffer = await say.stream("hello world", undefined, undefined);
//     const uint8Array = new Uint8Array(spokenBuffer);
//     console.log(uint8Array.buffer);
// }
// a();

app.post('/tts-stream', async (req, res) => {
    const { text, voice, speed } = req.body;
    try {
        // Stream spoken audio
        const spokenBuffer = await say.stream(text, voice, speed);
        const waitForStream = new Promise(function(resolve, reject) {
            const finalArray = [];
            say.streamRealTime(text, voice, speed,
                // Data callback
                (data) => {
                    // Write data to the PassThrough stream
                    console.log(typeof data, data);
                    finalArray.push(data);
                },
                // Finish callback
                (finalData) => {
                    // End the PassThrough stream when speech is complete
                    resolve(finalArray);
                },
                // Error callback
                (err) => {
                    // Handle any errors during streaming
                    console.error('Error:', err);
                    res.status(500).json({ error: 'An error occurred while generating speech.' });
                }
            );
        });
        const finalArray = await waitForStream();
        console.log('finalArray', finalArray);
        console.log(spokenBuffer);
        // Convert buffer to Uint8Array
        const uint8Array = new Uint8Array(spokenBuffer);
        // const uint8Array = new Uint8Array([255, 251, 148, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 88, 105, 110, 103, 0, 0, 0, 15, 0, 0, 0, 11, 0, 0, 7, 200, 0, 15, 15, 15, 15, 15, 15, 15, 15, 15, 30, 30, 30, 30, 30, 30, 30, 30, 30, 57, 57, 57, 57, 57, 57, 57, 57, 57, 103, 103, 103, 103, 103, 103, 103, 103, 103, 141, 141, 141, 141, 141, 141, 141, 141, 141, 179, 179, 179, 179, 179, 179, 179, 179, 179, 194, 194, 194, 194, 194, 194, 194, 194, 194, 210, 210, 210, 210, 210, 210, 210, 210, 210, 225, 225, 225, 225, 225, 225, 225, 225, 225, 240, 240, 240, 240, 240, 240, 240, 240, 240, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 60, 76, 65, 77, 69, 51, 46, 57, 56, 114, 4, 175, 0, 0, 0, 0, 0, 0, 0, 0, 52, 32, 36, 5, 192, 141, 0, 1, 204, 0, 0, 7, 200, 219, 4, 56, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 251, 20, 100, 0, 15, 240, 0, 0, 105, 0, 0, 0, 8, 0, 0, 13, 32, 0, 0, 1, 0, 0, 1, 254, 0, 0, 0, 32, 0, 0, 52, 128, 0, 0, 4, 1, 129, 64, 192, 80, 40, 28, 14, 6, 0, 0, 0, 0, 15, 66, 122, 183, 142, 234, 91, 223, 204, 254, 76, 167, 230, 103, 224, 20, 10, 5, 27, 151, 84, 170, 50, 226, 113, 199, 50, 189, 105, 55, 83, 106, 40, 52, 252, 51, 37, 41, 57, 70, 86, 78, 225, 158, 187, 57, 185, 255, 251, 20, 100, 30, 15, 240, 0, 0, 127, 128, 0, 0, 8, 0, 0, 13, 32, 0, 0, 1, 0, 0, 1, 254, 20, 0, 0, 32, 0, 0, 52, 130, 128, 0, 4, 153, 153, 108, 241, 245, 146, 67, 211, 168, 240, 89, 179, 110, 28, 65, 59, 203, 3, 128, 144, 111, 12, 41, 206, 0, 151, 99, 237, 36, 247, 65, 98, 52, 20, 210, 37, 6, 244, 98, 75, 8, 202, 32, 138, 109, 98, 26, 126, 234, 211, 195, 244, 48, 226, 199, 103, 116, 108, 238, 127, 255, 251, 68, 100, 60, 0, 0, 218, 8, 231, 238, 8, 0, 112, 0, 0, 13, 32, 192, 0, 0, 27, 157, 123, 75, 185, 188, 162, 0, 0, 0, 52, 131, 0, 0, 0, 176, 211, 74, 125, 109, 225, 23, 137, 197, 229, 110, 92, 142, 4, 116, 223, 183, 113, 244, 152, 116, 90, 107, 237, 17, 151, 210, 103, 150, 235, 223, 140, 191, 108, 178, 41, 239, 229, 35, 179, 122, 110, 83, 59, 142, 176, 215, 210, 90, 195, 63, 150, 75, 154, 196, 8, 252, 87, 236, 110, 109, 165, 72, 225, 151, 198, 253, 106, 92, 63, 63, 207, 249, 251, 213, 62, 29, 223, 105, 233, 237, 209, 190, 144, 52, 190, 180, 166, 130, 237, 201, 232, 106, 123, 255, 125, 255, 231, 127, 249, 255, 2, 50, 202, 89, 250, 78, 119, 120, 219, 195, 92, 100, 49, 151, 22, 164, 59, 91, 58, 88, 221, 141, 204, 181, 255, 255, 244, 42, 103, 115, 16, 255, 251, 116, 100, 1, 128, 244, 92, 94, 211, 255, 109, 0, 10, 0, 0, 13, 32, 224, 0, 1, 13, 153, 19, 69, 237, 164, 109, 96, 0, 0, 52, 128, 0, 0, 4, 2, 48, 146, 181, 214, 95, 140, 56, 84, 179, 161, 130, 161, 3, 171, 236, 28, 28, 4, 1, 8, 1, 77, 65, 24, 9, 136, 18, 154, 103, 169, 165, 3, 38, 43, 77, 138, 202, 165, 194, 162, 181, 200, 114, 56, 61, 18, 26, 13, 129, 181, 242, 72, 169, 161, 234, 175, 254, 176, 215, 74, 220, 59, 113, 148, 204, 42, 49, 65, 225, 230, 179, 69, 178, 11, 91, 50, 199, 5, 18, 57, 228, 216, 102, 52, 88, 87, 86, 105, 91, 90, 105, 85, 94, 86, 14, 152, 107, 21, 37, 14, 131, 174, 77, 133, 213, 38, 142, 36, 85, 163, 105, 165, 36, 214, 184, 126, 235, 36, 30, 197, 152, 88, 86, 30, 230, 67, 149, 215, 143, 255, 255, 254, 46, 249, 38, 88, 103, 2, 0, 3, 56, 187, 253, 182, 160, 73, 88, 132, 40, 183, 225, 6, 73, 248, 96, 33, 105, 202, 142, 41, 18, 220, 208, 200, 201, 39, 207, 24, 20, 160, 69, 239, 28, 109, 69, 23, 148, 232, 232, 148, 89, 10, 107, 34, 157, 179, 14, 132, 218, 40, 215, 172, 203, 5, 61, 91, 209, 46, 79, 99, 210, 115, 48, 211, 143, 93, 93, 180, 130, 209, 25, 99, 95, 41, 38, 100, 202, 106, 227, 27, 57, 183, 200, 244, 225, 24, 149, 87, 55, 84, 146, 29, 249, 218, 50, 134, 14, 129, 158, 168, 96, 136, 139, 132, 170, 255, 180, 3, 179, 77, 255, 255, 251, 100, 100, 3, 0, 243, 54, 74, 209, 107, 26, 26, 170, 0, 0, 13, 32, 0, 0, 1, 11, 216, 221, 63, 172, 24, 108, 232, 0, 0, 52, 128, 0, 0, 4, 247, 112, 16, 231, 208, 40, 224, 217, 195, 130, 165, 90, 9, 64, 243, 48, 116, 210, 50, 124, 235, 19, 105, 146, 248, 197, 60, 228, 99, 46, 49, 153, 90, 200, 109, 212, 88, 41, 202, 134, 35, 153, 40, 54, 114, 98, 185, 250, 19, 234, 96, 196, 241, 227, 1, 216, 249, 132, 133, 77, 129, 17, 90, 22, 90, 177, 27, 158, 74, 93, 218, 49, 159, 166, 167, 192, 166, 231, 155, 98, 152, 152, 205, 116, 115, 58, 143, 213, 9, 208, 228, 161, 60, 100, 3, 18, 246, 127, 64, 19, 75, 53, 246, 219, 3, 53, 122, 68, 140, 106, 114, 49, 4, 16, 183, 216, 57, 12, 45, 58, 73, 24, 10, 251, 245, 152, 64, 148, 198, 22, 157, 53, 105, 230, 93, 106, 130, 89, 65, 10, 189, 13, 84, 17, 117, 121, 154, 90, 81, 3, 129, 212, 43, 13, 141, 92, 203, 60, 255, 202, 32, 66, 144, 245, 205, 179, 44, 162, 189, 36, 14, 109, 4, 75, 181, 0, 99, 169, 117, 240, 204, 196, 75, 17, 122, 157, 119, 210, 201, 142, 120, 250, 88, 98, 0, 7, 85, 105, 191, 182, 72, 21, 26, 195, 255, 251, 100, 100, 6, 0, 243, 67, 78, 79, 251, 38, 27, 216, 0, 0, 13, 32, 0, 0, 1, 10, 189, 23, 57, 231, 176, 106, 160, 0, 0, 52, 128, 0, 0, 4, 0, 12, 7, 10, 181, 0, 197, 182, 52, 247, 100, 77, 89, 97, 12, 57, 130, 34, 158, 197, 255, 136, 92, 44, 243, 139, 222, 106, 83, 50, 154, 146, 46, 13, 88, 167, 172, 153, 222, 121, 183, 191, 94, 77, 93, 139, 96, 231, 16, 43, 51, 102, 217, 113, 224, 37, 241, 88, 105, 90, 27, 2, 204, 247, 5, 112, 85, 55, 61, 86, 69, 132, 156, 47, 222, 145, 82, 57, 153, 121, 243, 148, 146, 38, 69, 159, 153, 169, 150, 9, 5, 98, 164, 236, 198, 2, 208, 205, 255, 219, 219, 6, 84, 46, 32, 202, 1, 24, 4, 160, 65, 19, 243, 0, 225, 101, 10, 144, 130, 248, 118, 89, 180, 23, 119, 224, 171, 22, 44, 122, 141, 185, 107, 73, 133, 83, 227, 107, 175, 84, 139, 213, 86, 168, 146, 102, 246, 85, 85, 254, 74, 76, 198, 74, 93, 215, 225, 222, 198, 111, 255, 242, 141, 252, 58, 171, 255, 207, 148, 187, 84, 42, 212, 59, 149, 137, 67, 90, 42, 5, 59, 20, 22, 225, 192, 0, 0, 132, 202, 82, 197, 29, 196, 148, 15, 66, 13, 92, 243, 44, 183, 131, 65, 215, 255, 251, 20, 100, 12, 135, 240, 227, 7, 202, 104, 47, 97, 24, 0, 0, 13, 32, 0, 0, 1, 0, 152, 1, 91, 192, 0, 0, 32, 0, 0, 52, 128, 0, 0, 4, 125, 37, 162, 192, 0, 1, 255, 18, 85, 76, 65, 77, 69, 51, 46, 57, 56, 46, 52, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 255, 251, 20, 100, 25, 143, 240, 0, 0, 127, 128, 0, 0, 8, 0, 0, 13, 32, 0, 0, 1, 0, 0, 1, 254, 0, 0, 0, 32, 0, 0, 52, 128, 0, 0, 4, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 255, 251, 20, 100, 55, 143, 240, 0, 0, 127, 128, 0, 0, 8, 0, 0, 13, 32, 0, 0, 1, 0, 0, 1, 254, 0, 0, 0, 32, 0, 0, 52, 128, 0, 0, 4, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 255, 251, 20, 100, 85, 143, 240, 0, 0, 127, 128, 0, 0, 8, 0, 0, 13, 32, 0, 0, 1, 0, 0, 1, 164, 0, 0, 0, 32, 0, 0, 52, 128, 0, 0, 4, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 255, 251, 20, 100, 115, 143, 240, 0, 0, 105, 0, 0, 0, 8, 0, 0, 13, 32, 0, 0, 1, 0, 0, 1, 164, 0, 0, 0, 32, 0, 0, 52, 128, 0, 0, 4, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85]);
        // Set the response headers for WAV format
        // res.set({
        //     'Content-Type': 'audio/wav',
        //     'Content-Disposition': 'attachment; filename="speech.wav"'
        // });
        // Send the spoken audio buffer as the response
        res.send(uint8Array);
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
