$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell.exe -NoNewWindow -ArgumentList '-NoExit', '-Command', "Set-Location -LiteralPath '$root\Client'; npm run dev"
Start-Process powershell.exe -NoNewWindow -ArgumentList '-NoExit', '-Command', "Set-Location -LiteralPath '$root\Server'; npm run dev"