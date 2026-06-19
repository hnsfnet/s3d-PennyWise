@echo off
cd /d "c:\Users\snail\Documents\TraeSolo\repos\repo-11"
".\node-v20.11.1-win-x64\node.exe" ".\node_modules\vitest\vitest.mjs" run --reporter=verbose --no-color > test-final-output.txt 2>&1
echo Exit code: %errorlevel%
