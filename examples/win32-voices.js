#!/usr/bin/env node

const say = require('../')

say.getInstalledVoices((err, voices) => {
  if (err) return console.error('Error retrieving installed voices:', err);
  console.log(voices);
});