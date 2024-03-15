@echo off
cd commonjs
call npm audit fix
call npm install
npm install express@latest
npm install cors@latest
npm install uuid@latest
npm install burgil/say.js