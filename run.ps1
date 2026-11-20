$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', "Start-Process npm.cmd -WorkingDirectory '$root\Client' -ArgumentList 'run','dev' -NoNewWindow; Start-Process npm.cmd -WorkingDirectory '$root\Server' -ArgumentList 'run','dev' -NoNewWindow; Wait-Process -Name node"