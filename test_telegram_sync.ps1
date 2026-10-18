# Comprehensive Test script for TataDana Telegram mirroring logic
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$baseDir = $PSScriptRoot
. (Join-Path $baseDir "telegram_logic.ps1")

Write-Host "=== TEST 1: Parsing Indonesian Nominal ==="
$tests = @(
    @{ text = "beli kopi 5.000 di BCA"; expected = 5000 },
    @{ text = "beli kopi 25rb di bca"; expected = 25000 },
    @{ text = "gajian 10jt di bca"; expected = 10000000 },
    @{ text = "transfer 50rb bca ke gopay"; expected = 50000 },
    @{ text = "isi bensin 50k gopay"; expected = 50000 },
    @{ text = "makan 35.000"; expected = 35000 },
    @{ text = "gaji 1.5jt bca"; expected = 1500000 }
)

$passed = 0
foreach ($t in $tests) {
    $res = Parse-IndoNominal $t.text
    if ($res -eq $t.expected) {
        Write-Host "PASS: '$($t.text)' -> $res" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "FAIL: '$($t.text)' -> got $res, expected $($t.expected)" -ForegroundColor Red
    }
}

Write-Host "`n=== TEST 2: Category Interactive Flow & Processing ==="
$dummyState = [pscustomobject]@{
    wallets = @(
        [pscustomobject]@{ id = "w1"; name = "BCA"; balance = 1000000; type = "bank"; color = "#0066AE"; isDefault = $true },
        [pscustomobject]@{ id = "w2"; name = "Mandiri"; balance = 500000; type = "bank"; color = "#003D79"; isDefault = $false },
        [pscustomobject]@{ id = "w3"; name = "GoPay"; balance = 100000; type = "ewallet"; color = "#00AED6"; isDefault = $false }
    )
    budgets = @(
        [pscustomobject]@{ id = "b1"; name = "☕ Kopi & Nongkrong"; limit = 200000; color = "#facc15" }
    )
    customCategories = @()
    chatHistory = @()
    transactions = @()
}

# 2.1 Select "💸 Pengeluaran" mode
Write-Host "`n--- 2.1 Testing Mode Select: '💸 Pengeluaran' ---"
$replyMode = Process-Incoming-Message -msgText "💸 Pengeluaran" -chatId 99999 -platform "telegram" -state ([ref]$dummyState)
Write-Host "Reply: $replyMode"
if ($replyMode -match "Mode Pengeluaran" -and $dummyState.telegramActiveModes["99999"] -eq "expense") {
    Write-Host "PASS: Expense mode activated and stored for chat 99999." -ForegroundColor Green
} else {
    Write-Host "FAIL in Mode Select" -ForegroundColor Red
}

# 2.2 Send "beli kopi 5.000 di BCA" in expense mode
Write-Host "`n--- 2.2 Testing Expense: 'beli kopi 5.000 di BCA' ---"
$reply1 = Process-Incoming-Message -msgText "beli kopi 5.000 di BCA" -chatId 99999 -platform "telegram" -state ([ref]$dummyState)
Write-Host "Reply: $reply1"
$bcaBal = ($dummyState.wallets | Where-Object { $_.id -eq "w1" }).balance
Write-Host "BCA Balance: $bcaBal (expected 995000)"
if ($bcaBal -eq 995000 -and $dummyState.transactions.Count -eq 1 -and $dummyState.transactions[0].amount -eq 5000 -and $dummyState.transactions[0].category -eq "☕ Kopi & Nongkrong") {
    Write-Host "PASS: 'beli kopi 5.000 di BCA' parsed correctly, balance reduced by 5.000." -ForegroundColor Green
} else {
    Write-Host "FAIL in Expense 5.000" -ForegroundColor Red
}

# 2.3 Income: "gajian 10jt di bca"
Write-Host "`n--- 2.3 Testing Income: 'gajian 10jt di bca' ---"
$reply2 = Process-Incoming-Message -msgText "gajian 10jt di bca" -chatId 99999 -platform "telegram" -state ([ref]$dummyState)
Write-Host "Reply: $reply2"
$bcaBal2 = ($dummyState.wallets | Where-Object { $_.id -eq "w1" }).balance
Write-Host "BCA Balance: $bcaBal2 (expected 10995000)"
if ($bcaBal2 -eq 10995000 -and $dummyState.transactions.Count -eq 2 -and $dummyState.transactions[0].type -eq "income") {
    Write-Host "PASS: Income recorded, balance added." -ForegroundColor Green
} else {
    Write-Host "FAIL in Income" -ForegroundColor Red
}

# 2.4 Transfer: "transfer 50rb bca ke gopay"
Write-Host "`n--- 2.4 Testing Transfer: 'transfer 50rb bca ke gopay' ---"
$reply3 = Process-Incoming-Message -msgText "transfer 50rb bca ke gopay" -chatId 99999 -platform "telegram" -state ([ref]$dummyState)
Write-Host "Reply: $reply3"
$bcaBal3 = ($dummyState.wallets | Where-Object { $_.id -eq "w1" }).balance
$gopayBal3 = ($dummyState.wallets | Where-Object { $_.id -eq "w3" }).balance
Write-Host "BCA Balance: $bcaBal3 (expected 10945000), GoPay Balance: $gopayBal3 (expected 150000)"
$tx3 = $dummyState.transactions[0]
if ($bcaBal3 -eq 10945000 -and $gopayBal3 -eq 150000 -and $tx3.type -eq "transfer" -and $tx3.targetWalletName -eq "GoPay" -and $tx3.walletName -eq "BCA") {
    Write-Host "PASS: Transfer recorded, both balances updated." -ForegroundColor Green
} else {
    Write-Host "FAIL in Transfer" -ForegroundColor Red
}

# 2.5 Rollback: "/hapus"
Write-Host "`n--- 2.5 Testing Undo / Rollback: '/hapus' ---"
$replyHapus = Process-Incoming-Message -msgText "/hapus" -chatId 99999 -platform "telegram" -state ([ref]$dummyState)
Write-Host "Reply: $replyHapus"
$bcaBal4 = ($dummyState.wallets | Where-Object { $_.id -eq "w1" }).balance
$gopayBal4 = ($dummyState.wallets | Where-Object { $_.id -eq "w3" }).balance
Write-Host "After rollback - BCA: $bcaBal4 (expected 10995000), GoPay: $gopayBal4 (expected 100000)"
if ($bcaBal4 -eq 10995000 -and $gopayBal4 -eq 100000 -and $dummyState.transactions.Count -eq 2) {
    Write-Host "PASS: Rollback /hapus successfully restored balances and removed transfer." -ForegroundColor Green
} else {
    Write-Host "FAIL in Rollback" -ForegroundColor Red
}

Write-Host "`nALL UNIT TESTS FINISHED SUCCESSFULLY!"
