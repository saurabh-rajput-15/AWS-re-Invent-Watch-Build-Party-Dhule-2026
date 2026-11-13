# ==============================================================================
# AWS re:Invent Dhule 2026 - Agent Co-Host Session Setup
# Launches visible browser to sign in to the "agent" account and captures session
# ==============================================================================
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath "$root\Server"
Write-Host "🤖 Starting AWS Builder Center Agent Session Setup..." -ForegroundColor Cyan
npm run agent:sync
