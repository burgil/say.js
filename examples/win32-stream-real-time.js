const say = require('../')

// Stream spoken audio in real time
const audioStream = [];
say.streamRealTime("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75, (data) => {
    console.log(data)
    audioStream.push(data);
}, () => {
    console.log("Finished!");
}, (err) => {
    console.error(err);
});
