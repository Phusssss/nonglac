@echo off
echo Starting price batch job...
cd /d "d:\Nông Lạc\nonglac\server\batch"
npm install
node priceBatch.js
echo Batch job completed.
pause