@echo off
cd commonjs
call npm audit fix
call npm install
npm install express@latest
npm install cors@latest
npm install wav@latest
npm install burgil/say.js
cd ..
cd es
call npm audit fix
call npm install
npm install express@latest
npm install cors@latest
npm install wav@latest
npm install burgil/say.js
cd ..
echo.
echo Packages that are looking for funding:
npm fund
echo Done!
pause
