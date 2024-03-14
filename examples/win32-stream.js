const say = require('../')

// Export spoken audio to a stream
async function main() {
  try {
    const spokenStream = await say.stream("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75);
    console.log(spokenStream) // Buffer - Not Uint8Array yet ?
  } catch (e) {
    console.error("Error:", e)
  }
}
main();

