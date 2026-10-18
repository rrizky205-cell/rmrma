# Comprehensive Test Suite for telegram_logic.ps1
$baseDir = "C:\Users\RIZKY MUHAMMAD RIADY\.gemini\antigravity\scratch\tatadana"
. (Join-Path $baseDir "telegram_logic.ps1")

Write-Host "==========================================================="
Write-Host "TATADANA POWERSHELL LOGIC VERIFICATION SUITE"
Write-Host "===========================================================`n"

$passed = 0
$failed = 0

function Assert-Test($name, $actual, $expected) {
    if ($actual -eq $expected) {
        Write-Host "✅ PASS: $name"
        $script:passed++
    } else {
        Write-Host "❌ FAIL: $name | Expected: '$expected' | Actual: '$actual'"
        $script:failed++
    }
}

function Assert-Contains($name, $string, $substring) {
    if ($string -and $string.Contains($substring)) {
        Write-Host "✅ PASS: $name"
        $script:passed++
    } else {
        Write-Host "❌ FAIL: $name | Expected to contain '$substring' in: '$string'"
        $script:failed++
    }
}

# Test 1: Indo Nominal Parsing
Assert-Test "Nominal '35rb'" (Parse-IndoNominal "makan siang 35rb di bca") 35000
Assert-Test "Nominal '50k'" (Parse-IndoNominal "isi bensin 50k di bca") 50000
Assert-Test "Nominal '1.5jt'" (Parse-IndoNominal "bonus 1.5jt mandiri") 1500000
Assert-Test "Nominal '1,5jt'" (Parse-IndoNominal "bonus 1,5jt mandiri") 1500000
Assert-Test "Nominal '10jt'" (Parse-IndoNominal "gajian 10jt bca") 10000000
Assert-Test "Nominal '2 juta'" (Parse-IndoNominal "gajian 2 juta bca") 2000000
Assert-Test "Nominal '1.000.000'" (Parse-IndoNominal "transfer 1.000.000 bca ke gopay") 1000000
Assert-Test "Nominal '500.000.000'" (Parse-IndoNominal "beli mobil 500.000.000 bca") 500000000
Assert-Test "Nominal 'rp 25000'" (Parse-IndoNominal "beli kopi rp 25000") 25000

# Test 2: Formatting
Assert-Test "Format Rupiah 1000000" (Format-IndoRupiah 1000000) "Rp1.000.000"
Assert-Test "Format Rupiah 50000" (Format-IndoRupiah 50000) "Rp50.000"
Assert-Test "Format Rupiah 15000000" (Format-IndoRupiah 15000000) "Rp15.000.000"

# Test 3: Progress Bar
Assert-Test "Progress Bar 0%" (Generate-IndoProgressBar 0) "░░░░░░░░░░"
Assert-Test "Progress Bar 50%" (Generate-IndoProgressBar 50) "█████░░░░░"
Assert-Test "Progress Bar 80%" (Generate-IndoProgressBar 80) "████████░░"
Assert-Test "Progress Bar 100%" (Generate-IndoProgressBar 100) "██████████"

# Test 4: Full State Transaction Processing
$mockState = [pscustomobject]@{
    wallets = @(
        [pscustomobject]@{ id = "w1"; name = "BCA"; balance = 15000000; type = "bank"; color = "#0066AE"; isDefault = $true },
        [pscustomobject]@{ id = "w2"; name = "Mandiri"; balance = 5000000; type = "bank"; color = "#003D79"; isDefault = $false },
        [pscustomobject]@{ id = "w3"; name = "GoPay"; balance = 500000; type = "ewallet"; color = "#00AED6"; isDefault = $false },
        [pscustomobject]@{ id = "w4"; name = "Cash"; balance = 100000; type = "cash"; color = "#10B981"; isDefault = $false }
    )
    budgets = @(
        [pscustomobject]@{ id = "b1"; name = "🍜 Makanan & Minuman"; limit = 3000000; color = "#facc15" },
        [pscustomobject]@{ id = "b2"; name = "🚗 Transportasi"; limit = 1200000; color = "#38bdf8" },
        [pscustomobject]@{ id = "b_custom_1"; name = "🎮 Top Up Skin ML"; limit = 1000000; color = "#facc15" }
    )
    customCategories = @("🎮 Top Up Skin ML", "🏋️ member gym", "👶 Kebutuhan Anak")
    chatHistory = @()
    transactions = @()
}

# 4.1 Process Expense with Custom Category
$rep1 = Process-Incoming-Message -msgText "top up skin ml 50rb pake gopay" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Custom Budget match" $rep1 "🎮 Top Up Skin ML"
Assert-Contains "Nominal in reply" $rep1 "-Rp50.000"
Assert-Contains "Wallet in reply" $rep1 "GoPay"
Assert-Test "GoPay balance updated" $mockState.wallets[2].balance 450000
Assert-Test "Transaction recorded" $mockState.transactions[0].category "🎮 Top Up Skin ML"
Assert-Test "Chat recorded with platform" $mockState.chatHistory[0].platform "telegram"

# 4.2 Process Transfer
$rep2 = Process-Incoming-Message -msgText "transfer 200rb dari BCA ke GoPay" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Transfer title" $rep2 "✓ Transfer Antar Dompet Berhasil!"
Assert-Contains "Nominal in transfer" $rep2 "Rp200.000"
Assert-Test "BCA balance after transfer" $mockState.wallets[0].balance 14800000
Assert-Test "GoPay balance after transfer" $mockState.wallets[2].balance 650000

# 4.3 Process Income
$rep3 = Process-Incoming-Message -msgText "gajian 10jt bca" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Income title" $rep3 "✓ Pemasukan Berhasil Dicatat!"
Assert-Contains "Income category" $rep3 "💰 Gaji Pokok & Upah"
Assert-Contains "Income nominal" $rep3 "+Rp10.000.000"
Assert-Test "BCA balance after income" $mockState.wallets[0].balance 24800000

# 4.4 Process /saldo Command
$rep4 = Process-Incoming-Message -msgText "/saldo" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Saldo multi-wallet" $rep4 "SALDO MULTI-DOMPET"
Assert-Contains "BCA in saldo" $rep4 "BCA"

# 4.5 Process /budget Command
$rep5 = Process-Incoming-Message -msgText "/budget" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Budget command" $rep5 "STATUS BUDGETING"

# 4.6 Process Mode Selection Prompts
$txCountBefore = $mockState.transactions.Count
$repModeExp = Process-Incoming-Message -msgText "💸 Pengeluaran" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Mode Pengeluaran prompt" $repModeExp "Mode Pengeluaran 💸 Aktif!"
Assert-Test "No transaction added for mode prompt" $mockState.transactions.Count $txCountBefore

$repModeInc = Process-Incoming-Message -msgText "💰 Pemasukan" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Mode Pemasukan prompt" $repModeInc "Mode Pemasukan 💰 Aktif!"
Assert-Test "No transaction added for mode prompt" $mockState.transactions.Count $txCountBefore

$repModeTrf = Process-Incoming-Message -msgText "🔄 Transfer" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Mode Transfer prompt" $repModeTrf "Mode Transfer Antar Dompet 🔄 Aktif!"
Assert-Test "No transaction added for mode prompt" $mockState.transactions.Count $txCountBefore

# 4.7 Reject text without nominal
$repCasual = Process-Incoming-Message -msgText "kamu siapa" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Non-nominal warning" $repCasual "Mohon sertakan nominal"
Assert-Test "No transaction added for casual text" $mockState.transactions.Count $txCountBefore
Assert-Test "telegramChatId saved" $mockState.telegramChatId 123456

# 4.8 Process /menu and 🌐 /menu Command
$repMenu = Process-Incoming-Message -msgText "/menu" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Menu title" $repMenu "TATADANA QUANTUM AI - BOT MENU & NAVIGASI"
Assert-Contains "Menu link dashboard" $repMenu "http://localhost:3000/dashboard"
Assert-Contains "Menu link transaksi" $repMenu "http://localhost:3000/transaksi"
Assert-Contains "Menu link budget" $repMenu "http://localhost:3000/budget"
Assert-Contains "Menu link wallet" $repMenu "http://localhost:3000/wallet"
Assert-Contains "Menu link laporan" $repMenu "http://localhost:3000/laporan"
Assert-Contains "Menu link login" $repMenu "http://localhost:3000/login"

$repMenuButton = Process-Incoming-Message -msgText "🌐 /menu" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Menu button title" $repMenuButton "TATADANA QUANTUM AI - BOT MENU & NAVIGASI"

# 4.9 Process Button Commands with Emojis
$repSaldoBtn = Process-Incoming-Message -msgText "👛 /saldo" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Saldo button" $repSaldoBtn "SALDO MULTI-DOMPET"
Assert-Contains "Saldo wallet link" $repSaldoBtn "http://localhost:3000/wallet"

$repBudgetBtn = Process-Incoming-Message -msgText "🎯 /budget" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Budget button" $repBudgetBtn "STATUS BUDGETING"
Assert-Contains "Budget link" $repBudgetBtn "http://localhost:3000/budget"

$repLaporanBtn = Process-Incoming-Message -msgText "📊 /laporan" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Laporan button" $repLaporanBtn "REKAP ARUS KAS"
Assert-Contains "Laporan link" $repLaporanBtn "http://localhost:3000/laporan"

$repRiwayatBtn = Process-Incoming-Message -msgText "📋 /riwayat" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Riwayat button" $repRiwayatBtn "RIWAYAT CHAT TERAKHIR"
Assert-Contains "Riwayat link" $repRiwayatBtn "http://localhost:3000/transaksi"

$txCountBeforeHapus = $mockState.transactions.Count
$repHapusBtn = Process-Incoming-Message -msgText "↩️ /hapus" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Hapus button title" $repHapusBtn "Dihapus & Dibatalkan"
Assert-Contains "Hapus link" $repHapusBtn "http://localhost:3000/transaksi"
Assert-Test "Transaction removed on hapus" $mockState.transactions.Count ($txCountBeforeHapus - 1)

# 4.10 Complete Localhost URLs in all responses (specifically http://localhost:3000/login)
Assert-Contains "Expense summary contains /login" $rep1 "http://localhost:3000/login"
Assert-Contains "Transfer summary contains /login" $rep2 "http://localhost:3000/login"
Assert-Contains "Income summary contains /login" $rep3 "http://localhost:3000/login"
Assert-Contains "Saldo response contains /login" $rep4 "http://localhost:3000/login"
Assert-Contains "Budget response contains /login" $rep5 "http://localhost:3000/login"
Assert-Contains "Laporan response contains /login" $repLaporanBtn "http://localhost:3000/login"
Assert-Contains "Riwayat response contains /login" $repRiwayatBtn "http://localhost:3000/login"
Assert-Contains "Hapus response contains /login" $repHapusBtn "http://localhost:3000/login"
Assert-Contains "Mode Exp prompt contains /login" $repModeExp "http://localhost:3000/login"
Assert-Contains "Mode Inc prompt contains /login" $repModeInc "http://localhost:3000/login"
Assert-Contains "Mode Trf prompt contains /login" $repModeTrf "http://localhost:3000/login"

# 4.11 Regression Test: Real transactions starting with 'transfer', 'pengeluaran', 'pemasukan' are NOT blocked by mode prompts
$repTransferReal = Process-Incoming-Message -msgText "transfer 100rb dari BCA ke GoPay" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Real transfer starting with 'transfer' executes correctly" $repTransferReal "✓ Transfer Antar Dompet Berhasil!"

$repExpReal = Process-Incoming-Message -msgText "pengeluaran bensin 50rb bca" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Real expense starting with 'pengeluaran' executes correctly" $repExpReal "✓ Pengeluaran Berhasil Dicatat!"

$repIncReal = Process-Incoming-Message -msgText "pemasukan gaji 5jt bca" -chatId 123456 -platform "telegram" -state ([ref]$mockState)
Assert-Contains "Real income starting with 'pemasukan' executes correctly" $repIncReal "✓ Pemasukan Berhasil Dicatat!"

# 4.12 Send-Telegram-Message-With-Keyboards validation
Assert-Test "Send-Telegram-Message-With-Keyboards function exists" (Get-Command "Send-Telegram-Message-With-Keyboards" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name) "Send-Telegram-Message-With-Keyboards"
Assert-Test "Get-WebLinksText function exists" (Get-Command "Get-WebLinksText" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name) "Get-WebLinksText"
Assert-Contains "Get-WebLinksText includes login URL" (Get-WebLinksText) "http://localhost:3000/login"
Assert-Contains "Get-WebLinksText includes dashboard URL" (Get-WebLinksText) "http://localhost:3000/dashboard"
Assert-Contains "Get-WebLinksText includes transaksi URL" (Get-WebLinksText) "http://localhost:3000/transaksi"
Assert-Contains "Get-WebLinksText includes budget URL" (Get-WebLinksText) "http://localhost:3000/budget"
Assert-Contains "Get-WebLinksText includes wallet URL" (Get-WebLinksText) "http://localhost:3000/wallet"
Assert-Contains "Get-WebLinksText includes laporan URL" (Get-WebLinksText) "http://localhost:3000/laporan"

Write-Host "`n==========================================================="
Write-Host "TOTAL: $($passed + $failed) | PASSED: $passed | FAILED: $failed"
Write-Host "==========================================================="
