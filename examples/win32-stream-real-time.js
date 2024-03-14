const say = require('../')

// Stream spoken audio in real time
say.streamRealTime("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75, (data) => {
    console.log(data)
}, (err) => {
    console.error(err)
});
