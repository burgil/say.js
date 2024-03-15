const say = require('../')

// Stream spoken audio
async function main() {
  try {
    const spokenStream = await say.stream("I'm sorry, Dave.", 'Microsoft David Desktop', 0.75);
    console.log(spokenStream)
  } catch (e) {
    console.error("Error:", e)
  }
}
main();

