# TataDana Unified Telegram & NLP Financial Processing Logic
# Shared between server.ps1, telegram_worker.ps1, and test harnesses

function Parse-IndoNominal([string]$text) {
    if ([string]::IsNullOrWhiteSpace($text)) { return 0 }
    $clean = $text.ToLower().Trim()

    # 1. Juta (e.g. 1.5jt, 2.5 juta, 10jt, 1,5jt, 500mio, 500 miliun)
    if ($clean -match '(\d+(?:[.,]\d+)?)\s*(?:jt|juta|mio|miliun)\b') {
        $numStr = $matches[1].Replace(',', '.')
        $num = 0.0
        if ([double]::TryParse($numStr, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$num)) {
            return [long][Math]::Round($num * 1000000)
        }
    }

    # 2. Ribu (e.g. 50k, 35rb, 100ribu, 15rebu)
    if ($clean -match '(\d+(?:[.,]\d+)?)\s*(?:k|rb|ribu|rebu)\b') {
        $numStr = $matches[1].Replace(',', '.')
        $num = 0.0
        if ([double]::TryParse($numStr, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$num)) {
            return [long][Math]::Round($num * 1000)
        }
    }

    # 3. Dot-formatted Indonesian currency (e.g. 250.000, 1.500.000, 500.000.000)
    if ($clean -match '(?:^|\D)(\d{1,3}(?:\.\d{3})+)(?:,\d+)?(?:\D|$)') {
        $digits = $matches[1].Replace('.', '')
        $val = 0L
        if ([long]::TryParse($digits, [ref]$val) -and $val -gt 0) {
            return $val
        }
    }

    # 4. Standalone raw digits or digits with rp/rp. (e.g. rp 25000, 50000)
    if ($clean -match '(?:rp\.?\s*|\b)(\d{4,12})\b') {
        $val = 0L
        if ([long]::TryParse($matches[1], [ref]$val) -and $val -gt 0) {
            return $val
        }
    }

    # 5. Short number fallback
    if ($clean -match '\b(\d+)\b') {
        $val = 0L
        if ([long]::TryParse($matches[1], [ref]$val) -and $val -gt 0) {
            if ($val -gt 100) { return $val }
            else { return $val * 1000 }
        }
    }

    return 0
}

function Format-IndoRupiah($val) {
    $num = [long][Math]::Round([double]$val)
    $formatted = [string]::Format([System.Globalization.CultureInfo]::GetCultureInfo("id-ID"), "{0:N0}", $num)
    return "Rp$formatted"
}

function Generate-IndoProgressBar([int]$pct) {
    $clamped = [Math]::Max(0, [Math]::Min(100, $pct))
    $filledBlocks = [int][Math]::Round($clamped / 10)
    $emptyBlocks = [Math]::Max(0, 10 - $filledBlocks)
    return ("█" * $filledBlocks) + ("░" * $emptyBlocks)
}

function Get-WebLinksText {
    return "🌐 Tautan Langsung Web Aplikasi TataDana:`n" +
           "• 🏠 Dashboard Utama: http://localhost:3000/dashboard`n" +
           "• 📝 Catat Transaksi: http://localhost:3000/transaksi`n" +
           "• 💎 Upgrade Paket Pro: http://localhost:3000/register?plan=pro`n" +
           "• 🎯 Manajemen Budget: http://localhost:3000/budget`n" +
           "• 👛 Dompet & Saldo: http://localhost:3000/wallet`n" +
           "• 📊 Laporan & Grafik: http://localhost:3000/laporan`n" +
           "• 📝 Daftar Akun Baru: http://localhost:3000/register`n" +
           "• 🔐 Halaman Login: http://localhost:3000/login"
}

function Register-Telegram-Commands($token, $baseDir = "") {
    if (-not $token) { return }
    $cmdUrl = "https://api.telegram.org/bot$token/setMyCommands"
    $commands = @(
        @{ command = "start"; description = "Mulai bot & panduan awal TataDana" },
        @{ command = "menu"; description = "Tampilkan menu lengkap & tautan aplikasi" },
        @{ command = "saldo"; description = "Cek saldo semua rekening & e-wallet" },
        @{ command = "catat"; description = "Panduan cepat catat pemasukan / pengeluaran" },
        @{ command = "budget"; description = "Cek progres & limit budget bulanan" },
        @{ command = "upgrade"; description = "Upgrade ke paket TataDana Pro Quantum" },
        @{ command = "daftar"; description = "Daftar akun baru (Reset saldo ke 0)" },
        @{ command = "bantuan"; description = "Pusat bantuan & panduan format pesan" },
        @{ command = "laporan"; description = "Rekap mutasi & arus kas hari ini" },
        @{ command = "riwayat"; description = "Riwayat sinkronisasi chat web & telegram" },
        @{ command = "hapus"; description = "Batalkan transaksi terakhir (Rollback)" }
    )
    $bodyObj = @{ commands = $commands }
    try {
        Send-Telegram-Post -sendUrl $cmdUrl -postObj $bodyObj -baseDir $baseDir
    } catch {}
}

function Send-Telegram-Post([string]$sendUrl, [hashtable]$postObj, [string]$baseDir) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    $postBody = ConvertTo-Json $postObj -Depth 6 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($postBody)

    $sent = $false
    try {
        $req = [System.Net.HttpWebRequest]::Create($sendUrl)
        $req.Method = "POST"
        $req.ContentType = "application/json; charset=utf-8"
        $req.Timeout = 6000
        $req.ContentLength = $bytes.Length
        $reqStream = $req.GetRequestStream()
        $reqStream.Write($bytes, 0, $bytes.Length)
        $reqStream.Flush()
        $reqStream.Close()
        $resp = $req.GetResponse()
        $resp.Close()
        $sent = $true
    } catch {}

    if (-not $sent) {
        try {
            $tempDir = [System.IO.Path]::GetTempPath()
            $uId = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
            $tmpFile = Join-Path $tempDir "tg_send_${uId}_$([System.IO.Path]::GetRandomFileName()).json"
            [System.IO.File]::WriteAllText($tmpFile, $postBody, $utf8NoBom)
            & curl.exe -s --max-time 6 -X POST $sendUrl -H "Content-Type: application/json; charset=utf-8" --data-binary "@$tmpFile" | Out-Null
            if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue }
        } catch {
            Write-Host "[Telegram] Error sending message via curl fallback: $_"
        }
    }
}

function Send-Telegram-Message-With-Keyboards($token, $chatId, $replyText, $msgText = "", $baseDir = "") {
    if (-not $token -or -not $chatId -or -not $replyText) { return }
    $sendUrl = "https://api.telegram.org/bot$token/sendMessage"
    if (-not $baseDir) {
        $baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\RIZKY MUHAMMAD RIADY\.gemini\antigravity\scratch\tatadana" }
    }

    # 1. Main Reply Keyboard (Full 9 App Bot Menus)
    $replyKeyboard = @{
        keyboard = @(
            @( @{ text = "💸 Pengeluaran" }, @{ text = "💰 Pemasukan" }, @{ text = "🔄 Transfer" } ),
            @( @{ text = "👛 /saldo" }, @{ text = "🎯 /budget" }, @{ text = "📊 /laporan" } ),
            @( @{ text = "💎 /upgrade" }, @{ text = "📝 /catat" }, @{ text = "🌐 /menu" } )
        )
        resize_keyboard = $true
        one_time_keyboard = $false
    }

    # Send Message 1 with full 9-item Reply Keyboard
    try {
        $postObj = @{
            chat_id = $chatId
            text = $replyText
            reply_markup = $replyKeyboard
        }
        Send-Telegram-Post -sendUrl $sendUrl -postObj $postObj -baseDir $baseDir
    } catch {
        Write-Host "[Telegram] Error sending reply: $_"
    }

    # 2. Inline Keyboard with Category Selection & Web Navigation
    $cleanMsg = if ($msgText) { $msgText.ToLower().Trim() } else { "" }
    $isMenuOrStart = ($cleanMsg -match '^(?:/start|/menu|/help|/bantuan|/catat|/upgrade|/daftar|🌐\s*/?menu|^menu\b)') -or 
                     ($cleanMsg -match '^(?:/saldo|👛\s*/?saldo|/budget|🎯\s*/?budget|/laporan|📊\s*/?laporan|/riwayat|📋\s*/?riwayat|/hapus|↩️\s*/?hapus)') -or
                     ($cleanMsg -match '^(?:💸\s*/?pengeluaran|💰\s*/?pemasukan|🔄\s*/?transfer)$')

    if ($isMenuOrStart) {
        try {
            $inlineKeyboard = @{
                inline_keyboard = @(
                    @(
                        @{ text = "💸 Pengeluaran"; callback_data = "type_expense" },
                        @{ text = "💰 Pemasukan"; callback_data = "type_income" },
                        @{ text = "🔄 Transfer"; callback_data = "type_transfer" }
                    ),
                    @(
                        @{ text = "👛 Saldo"; callback_data = "cmd_saldo" },
                        @{ text = "🎯 Budget"; callback_data = "cmd_budget" },
                        @{ text = "📊 Laporan"; callback_data = "cmd_laporan" }
                    ),
                    @(
                        @{ text = "🏠 Dashboard Utama"; url = "http://localhost:3000/dashboard" },
                        @{ text = "📝 Catat Transaksi"; url = "http://localhost:3000/transaksi" }
                    ),
                    @(
                        @{ text = "💎 Upgrade Pro"; url = "http://localhost:3000/register?plan=pro" },
                        @{ text = "🔐 Halaman Login"; url = "http://localhost:3000/login" }
                    )
                )
            }
            $inlineObj = @{
                chat_id = $chatId
                text = "⚡ **Pilih Jenis Transaksi di Bawah Ini:**`nTap salah satu tombol kategori atau langsung ketik pesan transaksi Anda:"
                reply_markup = $inlineKeyboard
            }
            Send-Telegram-Post -sendUrl $sendUrl -postObj $inlineObj -baseDir $baseDir
        } catch {
            Write-Host "[Telegram] Error sending inline keyboard: $_"
        }
    }
}

function Process-Incoming-Message($msgText, $chatId, $platform, [ref]$state) {
    if ([string]::IsNullOrWhiteSpace($msgText)) {
        return "Pesan kosong tidak dapat diproses."
    }

    $cleanLower = $msgText.ToLower().Trim()
    $nominal = Parse-IndoNominal $msgText
    $formattedNominal = Format-IndoRupiah $nominal

    $now = Get-Date
    $dateStr = $now.ToString("yyyy-MM-dd")
    $timeStr = $now.ToString("HH:mm")
    $dtStr = "$dateStr $timeStr"
    $rnd = Get-Random -Minimum 100 -Maximum 999
    $txId = "tx_tg_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + "_$rnd"
    $chatIdStr = "ch_tg_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + "_$rnd"

    # Ensure required state arrays exist
    if ($state.Value.wallets -eq $null -or $state.Value.wallets.Count -eq 0) {
        $state.Value | Add-Member -MemberType NoteProperty -Name "wallets" -Value @(
            [pscustomobject]@{ id = "w1"; name = "BCA"; balance = 0; type = "bank"; color = "#0066AE"; isDefault = $true },
            [pscustomobject]@{ id = "w2"; name = "Mandiri"; balance = 0; type = "bank"; color = "#003D79"; isDefault = $false },
            [pscustomobject]@{ id = "w3"; name = "GoPay"; balance = 0; type = "ewallet"; color = "#00AED6"; isDefault = $false },
            [pscustomobject]@{ id = "w4"; name = "Cash"; balance = 0; type = "cash"; color = "#10B981"; isDefault = $false }
        ) -Force
    }
    if ($state.Value.chatHistory -eq $null) {
        $state.Value | Add-Member -MemberType NoteProperty -Name "chatHistory" -Value @() -Force
    }
    if ($state.Value.transactions -eq $null) {
        $state.Value | Add-Member -MemberType NoteProperty -Name "transactions" -Value @() -Force
    }
    if ($state.Value.budgets -eq $null) {
        $state.Value | Add-Member -MemberType NoteProperty -Name "budgets" -Value @() -Force
    }
    if ($state.Value.customCategories -eq $null) {
        $state.Value | Add-Member -MemberType NoteProperty -Name "customCategories" -Value @() -Force
    }

    $reply = ""

    # ==========================================
    # 1. BOT COMMANDS & GREETINGS
    # ==========================================
    # Auto-register commands with Telegram API on first interaction or start
    try {
        $botTok = if ($state.Value.telegramToken) { $state.Value.telegramToken } else { "8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ" }
        Register-Telegram-Commands -token $botTok -baseDir $baseDir
    } catch {}

    if ($cleanLower -match '^/start|^/menu|^🌐\s*/?menu|^menu\b|^halo\b|^hi\b|^hai\b') {
        $reply = "🌟 TATADANA QUANTUM AI - BOT MENU & NAVIGASI 🌟`n`n" +
                 "Selamat datang di @DANATATA_BOT! Asisten keuangan pintar berbasis Telegram & Web.`n`n" +
                 "⚡ Daftar Perintah Lengkap:`n" +
                 "• 👛 /saldo - Cek saldo rekening BCA, Mandiri, GoPay & Cash`n" +
                 "• 📝 /catat - Panduan format mencatat transaksi`n" +
                 "• 🎯 /budget - Status batas limit & sisa budget bulanan`n" +
                 "• 💎 /upgrade - Info fitur Pro Quantum & aktivasi`n" +
                 "• 📝 /daftar - Link registrasi akun baru (Mulai dari Rp0)`n" +
                 "• 📊 /laporan - Arus kas & ringkasan mutasi hari ini`n" +
                 "• 📋 /riwayat - Riwayat sinkronisasi pesan chat`n" +
                 "• ↩️ /hapus - Batalkan transaksi terakhir (Rollback saldo)`n" +
                 "• ❓ /bantuan - Panduan lengkap & format natural chat`n" +
                 "• 🌐 /menu - Tampilkan kembali menu ini`n`n" +
                 (Get-WebLinksText) + "`n`n" +
                 "💡 Tip Cepat: Cukup ketik langsung seperti 'ngopi 25rb bca' atau 'gajian 8.5jt bca'!"
        
        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($cleanLower -match '^/catat|📝\s*/?catat|^catat\b') {
        $reply = "📝 PANDUAN CEPAT MENCATAT TRANSAKSI TATADANA`n`n" +
                 "Anda bisa mencatat transaksi hanya dengan mengetik bahasa santai sehari-hari:`n`n" +
                 "💸 Contoh Pengeluaran:`n" +
                 "• makan siang 35rb di bca`n" +
                 "• beli bensin 50k gopay`n" +
                 "• belanja bulanan 500rb cash`n`n" +
                 "💰 Contoh Pemasukan:`n" +
                 "• gajian 10jt di bca`n" +
                 "• bonus freelance 2.5jt mandiri`n" +
                 "• cashback 50rb gopay`n`n" +
                 "🔄 Contoh Transfer Antar Dompet:`n" +
                 "• transfer 200rb dari BCA ke GoPay`n" +
                 "• pindah saldo 500k mandiri ke bca`n`n" +
                 (Get-WebLinksText)

        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($cleanLower -match '^/upgrade|💎\s*/?upgrade|^upgrade\b|^pro\b') {
        $reply = "💎 UPGRADE KE TATADANA PREMIUM`n`n" +
                 "Dapatkan fitur finansial eksekutif tanpa batas:`n" +
                 "✓ Transaksi Tanpa Batas (Unlimited pencatatan)`n" +
                 "✓ Akses Penuh Chat Bot AI & Bot Telegram (@DANATATA_BOT)`n" +
                 "✓ Ekspor Laporan PDF Berwarna & Excel Lengkap Kapan Saja`n" +
                 "✓ Unlimited Multi-Rekening Bank & E-Wallet`n" +
                 "✓ Unlimited Custom Categories & Target Budgeting`n" +
                 "✓ Scan Struk Belanja & Nota Otomatis (OCR Vision)`n`n" +
                 "💰 Pilihan Paket Berlangganan Baru:`n" +
                 "• ⚡ Rp 24.999 / 6 Bulan (Hemat & Praktis)`n" +
                 "• 👑 Rp 49.999 / Lifetime (Akses Seumur Hidup)`n`n" +
                 "⚡ Catatan: Pembayaran Premium diverifikasi via Admin untuk aktivasi instan.`n`n" +
                 "👉 Buka link untuk daftar/upgrade paket Premium:`n" +
                 "http://localhost:3000/register?plan=pro"

        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($cleanLower -match '^/daftar|📝\s*/?daftar|^daftar\b|^register\b') {
        $reply = "📝 DAFTAR AKUN BARU TATADANA`n`n" +
                 "Mulai kelola keuangan pribadi dan bisnis dengan saldo bersih mulai dari Rp0!`n`n" +
                 "Pilihan Paket Tersedia:`n" +
                 "• ⚡ Paket Free (Starter): Rp0 / Selamanya`n" +
                 "  (Maks 25 transaksi/hari, multi-wallet & budgeting aktif)`n" +
                 "• 💎 Paket Premium 6 Bulan: Rp 24.999`n" +
                 "• 👑 Paket Premium Lifetime: Rp 49.999 (Semua Fitur Unlimited)`n`n" +
                 "Setiap pendaftaran akun baru akan otomatis mereset seluruh transaksi dan dompet menjadi Rp0 bersih.`n`n" +
                 "👉 Klik tautan berikut untuk mendaftar sekarang:`n" +
                 "http://localhost:3000/register"

        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($cleanLower -match '^/bantuan|^/help|❓\s*/?bantuan|^bantuan\b|^help\b') {
        $reply = "❓ PUSAT BANTUAN & PANDUAN BOT TATADANA`n`n" +
                 "Bot ini dirancang untuk mencatat mutasi finansial secepat kilat langsung dari chat Telegram.`n`n" +
                 "📌 Format yang didukung:`n" +
                 "1. 'beli bakso 25rb bca' -> Pengeluaran Rp25.000 dari BCA`n" +
                 "2. 'gajian 8.5jt mandiri' -> Pemasukan Rp8.500.000 ke Mandiri`n" +
                 "3. 'transfer 100k bca ke gopay' -> Pindah dana Rp100.000`n" +
                 "4. '/hapus' -> Membatalkan transaksi terakhir & mengembalikan saldo`n`n" +
                 "Hubungi Admin jika butuh bantuan aktivasi paket Pro atau kendala akun.`n`n" +
                 (Get-WebLinksText)

        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($cleanLower -match '^/hapus|↩️\s*/?hapus|^/batal|^/undo|batal transaksi|hapus transaksi') {
        $delList = if ($state.Value.deletedTxIds) { @($state.Value.deletedTxIds) } else { @() }
        $lastTx = $null
        $txIdx = -1
        
        if ($state.Value.transactions) {
            for ($i = 0; $i -lt $state.Value.transactions.Count; $i++) {
                $candidate = $state.Value.transactions[$i]
                if ($delList -notcontains $candidate.id) {
                    $lastTx = $candidate
                    $txIdx = $i
                    break
                }
            }
        }

        if (-not $lastTx) {
            $reply = "⚠️ Tidak ada transaksi aktif yang dapat dibatalkan atau dihapus.`n`n" + (Get-WebLinksText)
        } else {
            # Financial Reversal
            if ($state.Value.wallets) {
                if ($lastTx.type -eq "expense") {
                    $w = $state.Value.wallets | Where-Object { $_.id -eq $lastTx.walletId -or $_.name -eq $lastTx.walletName } | Select-Object -First 1
                    if (-not $w -and $state.Value.wallets.Count -gt 0) { $w = $state.Value.wallets[0] }
                    if ($w) { $w.balance += $lastTx.amount }
                } elseif ($lastTx.type -eq "income") {
                    $w = $state.Value.wallets | Where-Object { $_.id -eq $lastTx.walletId -or $_.name -eq $lastTx.walletName } | Select-Object -First 1
                    if (-not $w -and $state.Value.wallets.Count -gt 0) { $w = $state.Value.wallets[0] }
                    if ($w) { $w.balance -= $lastTx.amount }
                } elseif ($lastTx.type -eq "transfer") {
                    $srcW = $state.Value.wallets | Where-Object { $_.id -eq $lastTx.walletId -or $_.name -eq $lastTx.walletName } | Select-Object -First 1
                    $tgtW = $state.Value.wallets | Where-Object { $_.id -eq $lastTx.targetWalletId -or $_.name -eq $lastTx.targetWalletName } | Select-Object -First 1
                    if ($srcW) { $srcW.balance += $lastTx.amount }
                    if ($tgtW) { $tgtW.balance -= $lastTx.amount }
                }
            }

            # Remove from transactions list
            $remaining = @()
            for ($i = 0; $i -lt $state.Value.transactions.Count; $i++) {
                if ($i -ne $txIdx) { $remaining += $state.Value.transactions[$i] }
            }
            $state.Value.transactions = $remaining

            # Add to deletedTxIds
            if ($delList -notcontains $lastTx.id) {
                $delList += $lastTx.id
            }
            $state.Value | Add-Member -MemberType NoteProperty -Name "deletedTxIds" -Value $delList -Force

            $fAmt = Format-IndoRupiah $lastTx.amount
            $reply = "✓ Transaksi Terakhir Berhasil Dihapus & Dibatalkan!`n" +
                     "├ Kategori : $($lastTx.category)`n" +
                     "├ Nominal : $fAmt`n" +
                     "├ Dompet : $($lastTx.walletName)`n" +
                     "└ Status Saldo : Telah Dikembalikan (Rollback Selesai)`n`n" +
                     (Get-WebLinksText)
        }

        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($cleanLower -match '^/saldo|👛\s*/?saldo|^saldo\b') {
        $total = 0
        $wLines = @()
        foreach ($w in $state.Value.wallets) {
            $total += $w.balance
            $wBal = Format-IndoRupiah $w.balance
            $icon = if ($w.isDefault) { "⭐" } elseif ($w.type -eq "ewallet") { "📱" } else { "👛" }
            $wLines += "├ $icon $($w.name) : $wBal"
        }
        $formattedTotal = Format-IndoRupiah $total
        $reply = "👛 SALDO MULTI-DOMPET TATADANA`n" + ($wLines -join "`n") + "`n└ Total Saldo : $formattedTotal`n`n" +
                 (Get-WebLinksText)

        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($cleanLower -match '^/budget|🎯\s*/?budget|^budget\b') {
        if (-not $state.Value.budgets -or $state.Value.budgets.Count -eq 0) {
            $reply = "🎯 Belum ada target budget bulanan yang diset. Buka menu Budgeting di aplikasi untuk mengatur target:`n`n" + (Get-WebLinksText)
        } else {
            $bLines = @()
            foreach ($b in $state.Value.budgets) {
                $bRaw = ($b.name -replace '^[^\w\s]+', '').Trim().ToLower()
                $bNameLower = $b.name.ToLower().Trim()
                $spent = 0
                if ($state.Value.transactions) {
                    foreach ($t in $state.Value.transactions) {
                        if ($t.type -eq "expense" -and $t.category) {
                            $tCat = $t.category.ToLower().Trim()
                            if ($tCat -eq $bNameLower -or ($bRaw.Length -ge 2 -and ($tCat.Contains($bRaw) -or $bNameLower.Contains($tCat)))) {
                                $spent += $t.amount
                            }
                        }
                    }
                }
                $pct = if ($b.limit -gt 0) { [Math]::Min(100, [int][Math]::Round(($spent / $b.limit) * 100)) } else { 0 }
                $bar = Generate-IndoProgressBar $pct
                $fSpent = Format-IndoRupiah $spent
                $fLim = Format-IndoRupiah $b.limit
                $bLines += "• $($b.name): [$bar] $pct%`n  Terpakai: $fSpent / $fLim"
            }
            $reply = "🎯 STATUS BUDGETING BULAN INI`n`n" + ($bLines -join "`n`n") + "`n`n" +
                     (Get-WebLinksText)
        }

        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($cleanLower -match '^/laporan|📊\s*/?laporan|^/hari ini|^/bulan ini|^laporan\b') {
        $todayStr = $dateStr
        $todayIncome = 0
        $todayExpense = 0
        $txCount = 0
        if ($state.Value.transactions) {
            foreach ($t in $state.Value.transactions) {
                if ($t.date -eq $todayStr) {
                    $txCount++
                    if ($t.type -eq "income") { $todayIncome += $t.amount }
                    elseif ($t.type -eq "expense") { $todayExpense += $t.amount }
                }
            }
        }
        $net = $todayIncome - $todayExpense
        $reply = "📊 REKAP ARUS KAS HARI INI ($todayStr)`n`n" +
                 "├ Pemasukan : +$(Format-IndoRupiah $todayIncome)`n" +
                 "├ Pengeluaran : -$(Format-IndoRupiah $todayExpense)`n" +
                 "├ Arus Kas Bersih : $(Format-IndoRupiah $net)`n" +
                 "└ Jumlah Transaksi : $txCount transaksi`n`n" +
                 (Get-WebLinksText)

        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($cleanLower -match '^/riwayat|📋\s*/?riwayat|^/history|^riwayat\b|^history\b') {
        $lines = @()
        if ($state.Value.chatHistory) {
            $recent = $state.Value.chatHistory | Select-Object -First 5
            foreach ($c in $recent) {
                $platBadge = if ($c.platform -eq "telegram" -or $c.sender -eq "telegram_user") { "[📱 Telegram]" } else { "[🌐 Web]" }
                $lines += "$platBadge - $($c.time) : $($c.text)"
            }
        }
        if ($lines.Count -eq 0) {
            $reply = "💬 Belum ada riwayat percakapan yang tersimpan.`n`n" + (Get-WebLinksText)
        } else {
            $reply = "💬 RIWAYAT CHAT TERAKHIR (Sinkron Web & Telegram):`n" + ($lines -join "`n") + "`n`n" +
                     (Get-WebLinksText)
        }

        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    if ($chatId) {
        $state.Value | Add-Member -MemberType NoteProperty -Name "telegramChatId" -Value $chatId -Force
    }

    # Mode Selection Prompts (matches web quick buttons: 💸 Pengeluaran, 💰 Pemasukan, 🔄 Transfer)
    # Mode Selection Prompts (matches web quick buttons: 💸 Pengeluaran, 💰 Pemasukan, 🔄 Transfer)
    # ONLY when nominal is 0, so real transactions like 'transfer 100rb dari BCA ke GoPay' are processed normally!
    if ($nominal -le 0) {
        if ($cleanLower -match '^(?:/pengeluaran|💸\s*/?pengeluaran|pengeluaran)$') {
            if ($chatId) {
                if (-not $state.Value.telegramActiveModes) {
                    $state.Value | Add-Member -MemberType NoteProperty -Name "telegramActiveModes" -Value @{} -Force
                }
                $state.Value.telegramActiveModes["$chatId"] = "expense"
            }
            $reply = "Mode Pengeluaran 💸 Aktif!`n`n" +
                     "Silakan ketik detail pengeluaranmu beserta nominal dan dompetnya.`n`n" +
                     "Contoh format:`n" +
                     "• beli kopi 5.000 di BCA`n" +
                     "• ngopi 25rb di bca`n" +
                     "• beli nasi padang 35rb`n" +
                     "• isi bensin 50k gopay`n`n" +
                     (Get-WebLinksText)
            $chatEntry = [pscustomobject]@{
                id = $chatIdStr
                sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
                text = $msgText
                reply = $reply
                time = $dtStr
                platform = $platform
            }
            $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
            return $reply
        }

        if ($cleanLower -match '^(?:/pemasukan|💰\s*/?pemasukan|pemasukan)$') {
            if ($chatId) {
                if (-not $state.Value.telegramActiveModes) {
                    $state.Value | Add-Member -MemberType NoteProperty -Name "telegramActiveModes" -Value @{} -Force
                }
                $state.Value.telegramActiveModes["$chatId"] = "income"
            }
            $reply = "Mode Pemasukan 💰 Aktif!`n`n" +
                     "Silakan ketik detail uang masuk atau gajianmu.`n`n" +
                     "Contoh format:`n" +
                     "• gajian 10jt bca`n" +
                     "• gajian 8.5jt bca`n" +
                     "• bonus freelance 1.5jt mandiri`n" +
                     "• cair cashback 100k gopay`n`n" +
                     (Get-WebLinksText)
            $chatEntry = [pscustomobject]@{
                id = $chatIdStr
                sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
                text = $msgText
                reply = $reply
                time = $dtStr
                platform = $platform
            }
            $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
            return $reply
        }

        if ($cleanLower -match '^(?:/transfer|🔄\s*/?transfer|transfer)$') {
            if ($chatId) {
                if (-not $state.Value.telegramActiveModes) {
                    $state.Value | Add-Member -MemberType NoteProperty -Name "telegramActiveModes" -Value @{} -Force
                }
                $state.Value.telegramActiveModes["$chatId"] = "transfer"
            }
            $reply = "Mode Transfer Antar Dompet 🔄 Aktif!`n`n" +
                     "Sebutkan nominal, dompet asal, dan dompet tujuan.`n`n" +
                     "Contoh format:`n" +
                     "• transfer 50rb bca ke gopay`n" +
                     "• transfer 100rb dari BCA ke GoPay`n" +
                     "• pindah dana 500k mandiri ke bca`n" +
                     "• topup gopay 200rb dari bca`n`n" +
                     (Get-WebLinksText)
            $chatEntry = [pscustomobject]@{
                id = $chatIdStr
                sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
                text = $msgText
                reply = $reply
                time = $dtStr
                platform = $platform
            }
            $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
            return $reply
        }

        # Casual chat without nominal fallback
        $reply = "🌟 Halo Budi! Ingin mencatat transaksi apa sekarang?`n`n" +
                 "Silakan pilih jenis transaksi (Pengeluaran, Pemasukan, Transfer) atau langsung ketik detail transaksi:`n`n" +
                 "💡 Contoh format langsung:`n" +
                 "• beli kopi 5.000 di BCA`n" +
                 "• makan siang 35rb di GoPay`n" +
                 "• gajian 10jt di bca`n" +
                 "• transfer 50rb bca ke gopay`n`n" +
                 (Get-WebLinksText) + "`n`n" +
                 "Ketik /menu untuk bantuan menu navigasi lengkap atau gunakan tombol di bawah."
        $chatEntry = [pscustomobject]@{
            id = $chatIdStr
            sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
            text = $msgText
            reply = $reply
            time = $dtStr
            platform = $platform
        }
        $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)
        return $reply
    }

    # ==========================================
    # 3. TRANSACTION TYPE DETECTION
    # ==========================================
    $userActiveMode = $null
    if ($chatId -and $state.Value.telegramActiveModes) {
        try {
            $userActiveMode = $state.Value.telegramActiveModes["$chatId"]
            $state.Value.telegramActiveModes["$chatId"] = $null
        } catch {}
    }

    $isTransfer = ($cleanLower -match 'transfer|tf|pindah|oper|topup') -or ($cleanLower -match 'dari\s+\w+\s+ke\s+\w+') -or ($userActiveMode -eq "transfer")
    $isIncome = ((($cleanLower -match 'gaji|gajian|masuk|cair|bonus|thr|freelance|proyek|investasi|dividen|saham|crypto|hadiah|angpao|jual|cashback|piutang|pemasukan') -or ($userActiveMode -eq "income")) -and (-not $isTransfer))

    # Helper function to find wallet
    $findWallet = {
        param([string]$text, $wallets, $excludeId = $null)
        if (-not $wallets) { return $null }
        $t = $text.ToLower()
        foreach ($w in $wallets) {
            if ($excludeId -and $w.id -eq $excludeId) { continue }
            $wName = $w.name.ToLower().Trim()
            if ($t -match "\b$wName\b" -or $t.Contains($wName)) {
                return $w
            }
        }
        return $null
    }

    # ==========================================
    # 3. TRANSFER TRANSACTION
    # ==========================================
    if ($isTransfer) {
        $sourceW = $null
        $targetW = $null

        # Check explicit "X ke Y" (e.g. "bca ke gopay", "mandiri ke bca")
        if ($cleanLower -match '([a-zA-Z0-9]+)\s+ke\s+([a-zA-Z0-9]+)') {
            $w1 = $matches[1].ToLower().Trim()
            $w2 = $matches[2].ToLower().Trim()
            $match1 = $state.Value.wallets | Where-Object { $_.name.ToLower() -eq $w1 -or $_.name.ToLower().Contains($w1) -or $w1.Contains($_.name.ToLower()) } | Select-Object -First 1
            $match2 = $state.Value.wallets | Where-Object { $_.name.ToLower() -eq $w2 -or $_.name.ToLower().Contains($w2) -or $w2.Contains($_.name.ToLower()) } | Select-Object -First 1
            if ($match1 -and $match2 -and $match1.id -ne $match2.id) {
                $sourceW = $match1
                $targetW = $match2
            }
        }

        # Check explicit "dari X"
        if ((-not $sourceW) -and ($cleanLower -match 'dari\s+([a-zA-Z0-9]+)')) {
            $srcName = $matches[1].ToLower().Trim()
            $sourceW = $state.Value.wallets | Where-Object { $_.name.ToLower() -eq $srcName -or $_.name.ToLower().Contains($srcName) -or $srcName.Contains($_.name.ToLower()) } | Select-Object -First 1
        }
        # Check explicit "ke Y"
        if ((-not $targetW) -and ($cleanLower -match 'ke\s+([a-zA-Z0-9]+)')) {
            $tgtName = $matches[1].ToLower().Trim()
            $targetW = $state.Value.wallets | Where-Object { ($sourceW -eq $null -or $_.id -ne $sourceW.id) -and ($_.name.ToLower() -eq $tgtName -or $_.name.ToLower().Contains($tgtName) -or $tgtName.Contains($_.name.ToLower())) } | Select-Object -First 1
        }
        # Check "top up / topup [wallet]"
        if ((-not $targetW) -and ($cleanLower -match 'top\s*up\s+([a-zA-Z0-9]+)')) {
            $topName = $matches[1].ToLower().Trim()
            $targetW = $state.Value.wallets | Where-Object { ($sourceW -eq $null -or $_.id -ne $sourceW.id) -and ($_.name.ToLower() -eq $topName -or $_.name.ToLower().Contains($topName) -or $topName.Contains($_.name.ToLower())) } | Select-Object -First 1
        }

        # Scan for wallet names present in message
        if (-not $sourceW -or -not $targetW) {
            $foundWallets = @()
            foreach ($w in $state.Value.wallets) {
                if ($cleanLower.Contains($w.name.ToLower())) {
                    $foundWallets += $w
                }
            }

            if ($foundWallets.Count -ge 2) {
                if (-not $sourceW -and -not $targetW) {
                    $sourceW = $foundWallets[0]
                    $targetW = $foundWallets[1]
                } elseif (-not $sourceW -and $targetW) {
                    $sourceW = $foundWallets | Where-Object { $_.id -ne $targetW.id } | Select-Object -First 1
                } elseif ($sourceW -and -not $targetW) {
                    $targetW = $foundWallets | Where-Object { $_.id -ne $sourceW.id } | Select-Object -First 1
                }
            } elseif ($foundWallets.Count -eq 1) {
                if ($cleanLower -match 'ke\s+|top\s*up') {
                    $targetW = $foundWallets[0]
                    $sourceW = $state.Value.wallets | Where-Object { $_.id -ne $targetW.id -and $_.isDefault -eq $true } | Select-Object -First 1
                    if (-not $sourceW) { $sourceW = $state.Value.wallets | Where-Object { $_.id -ne $targetW.id } | Select-Object -First 1 }
                } else {
                    $sourceW = $foundWallets[0]
                    $targetW = $state.Value.wallets | Where-Object { $_.id -ne $sourceW.id } | Select-Object -First 1
                }
            }
        }

        if (-not $sourceW) {
            $sourceW = $state.Value.wallets | Where-Object { ($targetW -eq $null -or $_.id -ne $targetW.id) -and $_.isDefault -eq $true } | Select-Object -First 1
            if (-not $sourceW) { $sourceW = $state.Value.wallets | Where-Object { $targetW -eq $null -or $_.id -ne $targetW.id } | Select-Object -First 1 }
            if (-not $sourceW) { $sourceW = $state.Value.wallets[0] }
        }
        if (-not $targetW -or $targetW.id -eq $sourceW.id) {
            $targetW = $state.Value.wallets | Where-Object { $_.id -ne $sourceW.id } | Select-Object -First 1
            if (-not $targetW) { $targetW = $sourceW }
        }

        # Apply balance change
        $sourceW.balance = [long]$sourceW.balance - $nominal
        $targetW.balance = [long]$targetW.balance + $nominal

        $tx = [pscustomobject]@{
            id = $txId
            type = "transfer"
            amount = $nominal
            walletId = $sourceW.id
            walletName = $sourceW.name
            targetWalletId = $targetW.id
            targetWalletName = $targetW.name
            category = "🔄 Transfer Antar Dompet"
            note = $msgText
            date = $dateStr
            datetime = $dtStr
        }
        $state.Value.transactions = @($tx) + @($state.Value.transactions)

        $srcIcon = if ($sourceW.type -eq "ewallet") { "📱" } else { "👛" }
        $tgtIcon = if ($targetW.type -eq "ewallet") { "📱" } else { "👛" }

        $reply = "✓ Transfer Antar Dompet Berhasil!`n" +
                 "├ Nominal : $formattedNominal`n" +
                 "├ Dari Dompet : $srcIcon $($sourceW.name) (Sisa: $(Format-IndoRupiah $sourceW.balance))`n" +
                 "├ Ke Dompet : $tgtIcon $($targetW.name) (Saldo: $(Format-IndoRupiah $targetW.balance))`n" +
                 "└ Status : Terbukukan Real-time`n`n" +
                 (Get-WebLinksText)

    # ==========================================
    # 4. INCOME TRANSACTION
    # ==========================================
    } elseif ($isIncome) {
        $w = & $findWallet $cleanLower $state.Value.wallets
        if (-not $w) {
            $w = $state.Value.wallets | Where-Object { $_.isDefault -eq $true } | Select-Object -First 1
            if (-not $w) { $w = $state.Value.wallets[0] }
        }

        $cat = "💰 Gaji Pokok & Upah"
        if ($cleanLower -match 'bonus|thr') { $cat = "⚡ Bonus, THR & Insentif" }
        elseif ($cleanLower -match 'freelance|proyek|paruh') { $cat = "💼 Freelance & Side Project" }
        elseif ($cleanLower -match 'investasi|dividen|saham|crypto|reksadana|bitcoin') { $cat = "📈 Hasil Investasi & Dividen" }
        elseif ($cleanLower -match 'hadiah|angpao') { $cat = "🎁 Hadiah & Pemberian Uang" }
        elseif ($cleanLower -match 'jual|cashback') { $cat = "🏷️ Penjualan Barang / Cashback" }
        elseif ($cleanLower -match 'piutang|utang|pinjaman') { $cat = "💵 Pengembalian Pinjaman / Piutang" }

        $w.balance = [long]$w.balance + $nominal

        $tx = [pscustomobject]@{
            id = $txId
            type = "income"
            amount = $nominal
            walletId = $w.id
            walletName = $w.name
            targetWalletId = $null
            targetWalletName = $null
            category = $cat
            note = $msgText
            date = $dateStr
            datetime = $dtStr
        }
        $state.Value.transactions = @($tx) + @($state.Value.transactions)

        $wIcon = if ($w.type -eq "ewallet") { "📱" } else { "👛" }

        $reply = "✓ Pemasukan Berhasil Dicatat!`n" +
                 "├ Nominal : +$formattedNominal`n" +
                 "├ Kategori : $cat`n" +
                 "├ Masuk ke : $wIcon $($w.name)`n" +
                 "└ Saldo Baru : $(Format-IndoRupiah $w.balance)`n`n" +
                 (Get-WebLinksText)

    # ==========================================
    # 5. EXPENSE TRANSACTION (Default)
    # ==========================================
    } else {
        $w = & $findWallet $cleanLower $state.Value.wallets
        if (-not $w) {
            $w = $state.Value.wallets | Where-Object { $_.isDefault -eq $true } | Select-Object -First 1
            if (-not $w) { $w = $state.Value.wallets[0] }
        }

        # 5.1 Check custom categories from budgets & customCategories FIRST
        $matchedCategory = $null
        $allCustomCats = @()
        if ($state.Value.budgets) {
            foreach ($b in $state.Value.budgets) {
                if ($b.name -and (-not $allCustomCats.Contains($b.name))) { $allCustomCats += $b.name }
            }
        }
        if ($state.Value.customCategories) {
            foreach ($c in $state.Value.customCategories) {
                if ($c -and (-not $allCustomCats.Contains($c))) { $allCustomCats += $c }
            }
        }

        foreach ($c in $allCustomCats) {
            $cleanCat = ($c -replace '^[^\w\s]+', '').Trim().ToLower()
            if ($cleanCat -and ($cleanLower.Contains($cleanCat) -or $cleanLower -match [regex]::Escape($cleanCat))) {
                $matchedCategory = $c
                break
            }
        }

        # 5.2 Fallback to standard expense categories
        if (-not $matchedCategory) {
            if ($cleanLower -match 'bensin|pertamax|pertalite|gojek|grab|parkir|tol|transport') {
                $matchedCategory = "🚗 Transportasi & Bensin"
            } elseif ($cleanLower -match 'kopi|ngopi|kafe|cafe|nongkrong') {
                $matchedCategory = "☕ Kopi & Nongkrong"
            } elseif ($cleanLower -match 'listrik|pln|air|pdam|tagihan|utilitas') {
                $matchedCategory = "🏠 Listrik PLN, Air & Tagihan"
            } elseif ($cleanLower -match 'pulsa|wifi|kuota|indihome|data') {
                $matchedCategory = "🌐 Pulsa, Data & WiFi"
            } elseif ($cleanLower -match 'belanja|baju|sepatu|fashion|celana|kaos') {
                $matchedCategory = "👕 Belanja Fashion & Pakaian"
            } elseif ($cleanLower -match 'supermarket|indomaret|alfamart|sayur|sembako') {
                $matchedCategory = "🛒 Supermarket & Kebutuhan Rumah"
            } elseif ($cleanLower -match 'game|steam|netflix|nonton|bioskop|streaming') {
                $matchedCategory = "🎮 Hiburan, Game & Streaming"
            } elseif ($cleanLower -match 'obat|dokter|apotek|bpjs|klinik|sakit') {
                $matchedCategory = "💊 Kesehatan, Obat & BPJS"
            } elseif ($cleanLower -match 'buku|kursus|sekolah|kuliah|pelatihan') {
                $matchedCategory = "📚 Pendidikan, Buku & Kursus"
            } elseif ($cleanLower -match 'sedekah|zakat|donasi|infaq|amal') {
                $matchedCategory = "🎁 Sedekah, Zakat & Donasi"
            } else {
                $matchedCategory = "🍜 Makanan & Minuman"
            }
        }

        $w.balance = [long]$w.balance - $nominal

        $tx = [pscustomobject]@{
            id = $txId
            type = "expense"
            amount = $nominal
            walletId = $w.id
            walletName = $w.name
            targetWalletId = $null
            targetWalletName = $null
            category = $matchedCategory
            note = $msgText
            date = $dateStr
            datetime = $dtStr
        }
        $state.Value.transactions = @($tx) + @($state.Value.transactions)

        # Budget Progress & Warning
        $budgetAlertText = ""
        if ($state.Value.budgets) {
            $cleanCatName = ($matchedCategory -replace '^[^\w\s]+', '').Trim().ToLower()
            $matchedLower = $matchedCategory.ToLower().Trim()
            $relBudget = $state.Value.budgets | Where-Object {
                $bRaw = ($_.name -replace '^[^\w\s]+', '').Trim().ToLower()
                $bLower = $_.name.ToLower().Trim()
                ($bLower -eq $matchedLower) -or ($cleanCatName.Length -ge 2 -and ($bLower.Contains($cleanCatName) -or $matchedLower.Contains($bRaw)))
            } | Select-Object -First 1

            if ($relBudget -and $relBudget.limit -gt 0) {
                $spent = 0
                $bRaw = ($relBudget.name -replace '^[^\w\s]+', '').Trim().ToLower()
                $bLower = $relBudget.name.ToLower().Trim()
                if ($state.Value.transactions) {
                    foreach ($t in $state.Value.transactions) {
                        if ($t.type -eq "expense" -and $t.category) {
                            $tCat = $t.category.ToLower().Trim()
                            if ($tCat -eq $bLower -or ($bRaw.Length -ge 2 -and ($tCat.Contains($bRaw) -or $bLower.Contains($tCat)))) {
                                $spent += $t.amount
                            }
                        }
                    }
                }
                $pct = [Math]::Min(100, [int][Math]::Round(($spent / $relBudget.limit) * 100))
                $bar = Generate-IndoProgressBar $pct
                $sisa = [Math]::Max(0, ($relBudget.limit - $spent))
                $fSpent = Format-IndoRupiah $spent
                $fLim = Format-IndoRupiah $relBudget.limit
                $fSisa = Format-IndoRupiah $sisa

                $budgetAlertText = "`n`n📊 Budget $($relBudget.name): [$bar] $pct%`n├ Terpakai : $fSpent / $fLim`n└ Sisa : $fSisa"
                if ($pct -ge 100) {
                    $budgetAlertText += "`n⚠️ PERINGATAN: Budget telah melampaui 100%! Harap rem pengeluaran!"
                } elseif ($pct -ge 80) {
                    $budgetAlertText += "`n⚡ Waspada: Budget sudah mencapai $pct%! Kendalikan pengeluaran."
                }
            }
        }

        $wIcon = if ($w.type -eq "ewallet") { "📱" } else { "👛" }

        $reply = "✓ Pengeluaran Berhasil Dicatat!`n" +
                 "├ Nominal : -$formattedNominal`n" +
                 "├ Kategori : $matchedCategory`n" +
                 "├ Dompet : $wIcon $($w.name)`n" +
                 "└ Sisa Saldo : $(Format-IndoRupiah $w.balance)" +
                 $budgetAlertText + "`n`n" +
                 (Get-WebLinksText)
    }

    # Record to chat history
    $chatEntry = [pscustomobject]@{
        id = $chatIdStr
        sender = if ($platform -eq "telegram") { "telegram_user" } else { "web_user" }
        text = $msgText
        reply = $reply
        time = $dtStr
        platform = $platform
    }
    $state.Value.chatHistory = @($chatEntry) + @($state.Value.chatHistory)

    return $reply
}
