const say = require('../index.js')

// Export spoken audio to a stream
async function main() {
  const spokenStream = await say.stream("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75, (err) => {
    if (err) {
      return console.error(err)
    }
    console.log('Optionally run a callback when the stream is over.')
  });
  console.log(spokenStream) // Uint8Array
}
main();

