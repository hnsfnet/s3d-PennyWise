$ErrorActionPreference = 'SilentlyContinue'
$env:PATH = "c:\Users\snail\Documents\TraeSolo\repos\repo-11\node-v20.11.1-win-x64;$env:PATH"

Write-Host "Starting tests..." -ForegroundColor Green

& node.exe node_modules/vitest/vitest.mjs run --no-color --reporter=verbose > test-results.txt 2>&1

$exitCode = $LASTEXITCODE

Write-Host "Tests completed with exit code: $exitCode" -ForegroundColor Yellow

Get-Content test-results.txt

exit $exitCode
