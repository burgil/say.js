const say = require('../')

// Stream spoken audio in real time
const audioStream = Buffer.alloc(0);
say.streamRealTime("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75, (data) => {
    console.log(data)
    audioStream = Buffer.concat([audioStream, data])
}, (err) => {
    console.error(err)
});
