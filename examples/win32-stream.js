const say = require('../')

// Export spoken audio to a stream
async function main() {
  try {
    const spokenStream = await say.stream("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75);
    console.log(spokenStream) // Uint8Array
  } catch (e) {
    console.error("Error:", e)
  }
}
main();

