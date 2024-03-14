const say = require('say');

const express = require('express');
// const path = require('path');
const app = express();
app.use(express.json());
const port = 80;
// app.use('../files', express.static(path.join(__dirname, '..')));
// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname, '../front-end/mp3.html'));
// });
app.post('/tts', (req, res) => {
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
app.get('/voices', async function (req, res) {
    say.getInstalledVoices((err, voices) => {
        if (err) {
            console.error('Error retrieving installed voices:', err);
            return res.status(500).json({ error: 'An error occurred while retrieving voices.' });
        }
        res.json(voices);
    });
});
app.listen(port);
console.log('Server started at http://localhost:' + port);

// stream spoken audio test
async function main() {
    try {
        const spokenStream = await say.stream("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75);
        console.log(spokenStream) // Buffer - Not Uint8Array yet ?
    } catch (e) {
        console.error("Error:", e)
    }
}
main();
