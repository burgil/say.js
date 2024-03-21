@echo off
cd commonjs
call npm audit fix
call npm install
npm install express@latest
npm install cors@latest
npm install uuid@latest
npm install burgil/sayjs
cd ..
cd es
call npm audit fix
call npm install
npm install express@latest
npm install cors@latest
npm install uuid@latest
npm install burgil/sayjs
cd ..
echo.
echo Packages that are looking for funding:
npm fund
echo Done!
pause
