$baseDir = $PSScriptRoot
. (Join-Path $baseDir "..\telegram_logic.ps1")

$state = [pscustomobject]@{
    wallets = @(
        [pscustomobject]@{ id='w1'; name='BCA'; balance=100000; isDefault=$true },
        [pscustomobject]@{ id='w2'; name='GoPay'; balance=50000; isDefault=$false }
    )
    budgets = @(
        [pscustomobject]@{ id='b1'; name='🍜 Makanan & Minuman'; limit=500000 }
    )
    customCategories = @('ngopi cantik')
    chatHistory = @()
    transactions = @()
}

$reply1 = Process-Incoming-Message -msgText "ngopi cantik 35rb bca" -chatId 123 -platform "telegram" -state ([ref]$state)
Write-Host "=== TEST 1 (Custom Category & Wallet Match) ==="
Write-Host $reply1

$reply2 = Process-Incoming-Message -msgText "/saldo" -chatId 123 -platform "telegram" -state ([ref]$state)
Write-Host "`n=== TEST 2 (Command /saldo) ==="
Write-Host $reply2

$reply3 = Process-Incoming-Message -msgText "transfer 20rb bca ke gopay" -chatId 123 -platform "telegram" -state ([ref]$state)
Write-Host "`n=== TEST 3 (Transfer) ==="
Write-Host $reply3

Write-Host "`n=== TEST RESULTS ==="
Write-Host "Remaining BCA balance:" $state.wallets[0].balance
Write-Host "GoPay balance:" $state.wallets[1].balance
Write-Host "Transactions recorded:" $state.transactions.Count
Write-Host "Chat history recorded:" $state.chatHistory.Count
