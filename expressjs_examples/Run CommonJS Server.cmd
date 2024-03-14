@echo off
cd commonjs
call npm audit
echo You might want to run npm audit fix, if more than 0 vulnerabilities are found, Click any key to continue installing and running
pause
call npm install
call npm start
pause
