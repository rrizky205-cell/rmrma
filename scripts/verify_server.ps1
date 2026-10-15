$resp = Invoke-WebRequest -Uri "http://localhost:3000/login" -UseBasicParsing
Write-Host "GET /login Status:" $resp.StatusCode

$state = Invoke-RestMethod -Uri "http://localhost:3000/api/state" -Method GET
Write-Host "GET /api/state Status: OK"
Write-Host "Wallets count:" $state.wallets.Count
Write-Host "Budgets count:" $state.budgets.Count
Write-Host "Telegram Bot Username:" $state.telegramBot.username
Write-Host "Telegram Bot Connected:" $state.telegramBot.connected
