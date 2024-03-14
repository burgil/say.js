Pick your syntax:

# CommonJS:

```bash
cd commonjs
```

# ES Module:

```bash
cd es
```

# Instructions:

1. CD Install and run:
```bash
npm install
npm start
```

2. Open any of the front ends

TODO: add authentication, security, rate limits and etc

# Advanced:

This is how I installed this fork on those projects:

```bash
npm install burgil/say.js
```

```js
// package.json dependencies + "say": "github:burgil/say.js"

// CommonJS:
const say = require('say');

// ES Module:
import say from 'say';
```
