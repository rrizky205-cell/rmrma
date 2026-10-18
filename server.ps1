[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# TataDana Ultra-Fast HTTP Server
$port = 3000
$listener = New-Object System.Net.HttpListener

try {
    $listener.Prefixes.Add("http://localhost:$port/")
    try {
        $listener.Prefixes.Add("http://127.0.0.1:$port/")
    } catch {}
    $listener.Start()
    Write-Host "TataDana Server STARTED on http://localhost:$port/ and http://127.0.0.1:$port/"
} catch {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Start()
        Write-Host "TataDana Server STARTED on http://localhost:$port/"
    } catch {
        Write-Host "Failed to start listener: $_"
        exit 1
    }
}

$baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\RIZKY MUHAMMAD RIADY\.gemini\antigravity\scratch\tatadana" }
$publicDir = Join-Path $baseDir "public"
$stateFile = Join-Path $baseDir "tatadana_state.json"

. (Join-Path $baseDir "telegram_logic.ps1")

# Ensure Telegram Worker background daemon is running
$workerPidFile = Join-Path $baseDir "telegram_worker.pid"
$offsetFile = Join-Path $baseDir "telegram_offset.txt"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Check-WorkerActive {
    if (Test-Path $workerPidFile) {
        $rawPid = [System.IO.File]::ReadAllText($workerPidFile).Trim()
        $wPid = 0
        if ([int]::TryParse($rawPid, [ref]$wPid)) {
            $existingProc = Get-Process -Id $wPid -ErrorAction SilentlyContinue
            if ($existingProc -and $existingProc.ProcessName -match 'powershell') { return $true }
        }
    }
    return $false
}

function Start-WorkerDaemon {
    try {
        $workerScript = Join-Path $baseDir "telegram_worker.ps1"
        Start-Process powershell.exe -ArgumentList "-ExecutionPolicy Bypass -NoProfile -File `"$workerScript`"" -WindowStyle Hidden
        Write-Host "Auto-launched TataDana Telegram Worker daemon in background."
    } catch {
        Write-Host "Warning: Could not start Telegram Worker: $_"
    }
}

if (-not (Check-WorkerActive)) {
    Start-WorkerDaemon
} else {
    Write-Host "Telegram Worker is active."
}

function Send-Http-Response($response, $bytes, $contentType, $statusCode = 200) {
    try {
        if ($null -eq $bytes) { $bytes = [byte[]]@() }
        elseif ($bytes -isnot [byte[]]) { $bytes = [byte[]]$bytes }
        $response.StatusCode = $statusCode
        $response.ContentType = $contentType
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Pragma, Cache-Control")
        $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0")
        $response.AddHeader("Pragma", "no-cache")
        $response.AddHeader("Expires", "0")
        $response.ContentLength64 = $bytes.Length
        if ($bytes.Length -gt 0) {
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $response.OutputStream.Flush()
        $response.Close()
    } catch {
        try { if ($response) { $response.Close() } } catch {}
    }
}

while ($listener.IsListening) {
    $context = $null
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $path = $request.Url.AbsolutePath
        $method = $request.HttpMethod

        # Handle CORS Preflight
        if ($method -eq "OPTIONS") {
            Send-Http-Response -response $response -bytes @() -contentType "text/plain" -statusCode 204
            continue
        }

        # Handle API Routes
        if ($path -eq "/api/state") {
            if ($method -eq "GET") {
                if (-not (Check-WorkerActive)) {
                    Start-WorkerDaemon
                }
                $json = '{"wallets":[],"budgets":[],"customCategories":[],"chatHistory":[],"transactions":[]}'
                if (Test-Path $stateFile) {
                    $json = [System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)
                }
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
                continue
            } elseif ($method -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $bodyText = $reader.ReadToEnd()
                $incoming = $null
                try { $incoming = ConvertFrom-Json $bodyText } catch {}
                
                $currState = $null
                if (Test-Path $stateFile) {
                    try { $currState = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
                }
                
                if ($currState -and $incoming) {
                    # Protect Telegram Bot credentials and chat id
                    if ($currState.telegramToken -and (-not $incoming.telegramToken)) {
                        $incoming | Add-Member -MemberType NoteProperty -Name "telegramToken" -Value $currState.telegramToken -Force
                    }
                    if ($currState.telegramBotUsername -and (-not $incoming.telegramBotUsername)) {
                        $incoming | Add-Member -MemberType NoteProperty -Name "telegramBotUsername" -Value $currState.telegramBotUsername -Force
                    }
                    if ($currState.telegramChatId -and (-not $incoming.telegramChatId)) {
                        $incoming | Add-Member -MemberType NoteProperty -Name "telegramChatId" -Value $currState.telegramChatId -Force
                    }

                    # Handle deletedTxIds and deletedWalletIds (merge bidirectionally so deletions are never lost)
                    $delTxIds = if ($incoming.deletedTxIds) { @($incoming.deletedTxIds) } else { @() }
                    if ($currState.deletedTxIds) {
                        $delTxIds = @($delTxIds) + @($currState.deletedTxIds) | Select-Object -Unique
                    }
                    $incoming | Add-Member -MemberType NoteProperty -Name "deletedTxIds" -Value $delTxIds -Force

                    $delWIds = if ($incoming.deletedWalletIds) { @($incoming.deletedWalletIds) } else { @() }
                    if ($currState.deletedWalletIds) {
                        $delWIds = @($delWIds) + @($currState.deletedWalletIds) | Select-Object -Unique
                    }
                    $incoming | Add-Member -MemberType NoteProperty -Name "deletedWalletIds" -Value $delWIds -Force

                    if ($delTxIds.Count -gt 0) {
                        if ($incoming.transactions) {
                            $incoming.transactions = @($incoming.transactions | Where-Object { $delTxIds -notcontains $_.id })
                        }
                        if ($currState.transactions) {
                            $currState.transactions = @($currState.transactions | Where-Object { $delTxIds -notcontains $_.id })
                        }
                    }

                    if ($delWIds.Count -gt 0) {
                        if ($incoming.wallets) {
                            $incoming.wallets = @($incoming.wallets | Where-Object { $delWIds -notcontains $_.id })
                        }
                        if ($currState.wallets) {
                            $currState.wallets = @($currState.wallets | Where-Object { $delWIds -notcontains $_.id })
                        }
                    }

                    # Merge concurrent Telegram transactions (skip deleted)
                    if ($currState.transactions -and $incoming.transactions) {
                        $inTxIds = @($incoming.transactions | ForEach-Object { $_.id })
                        $extraTxs = @($currState.transactions | Where-Object { $inTxIds -notcontains $_.id -and $delTxIds -notcontains $_.id })
                        if ($extraTxs.Count -gt 0) {
                            $incoming.transactions = @($extraTxs) + @($incoming.transactions)
                        }
                    }

                    # Merge concurrent Telegram chats
                    if ($currState.chatHistory -and $incoming.chatHistory) {
                        $inChatIds = @($incoming.chatHistory | ForEach-Object { $_.id })
                        $extraChats = @($currState.chatHistory | Where-Object { $inChatIds -notcontains $_.id })
                        if ($extraChats.Count -gt 0) {
                            $incoming.chatHistory = @($extraChats) + @($incoming.chatHistory)
                        }
                    }
                    # Preserve registered users list across state updates
                    if ($currState.users -and ((-not $incoming.users) -or ($incoming.users.Count -eq 0))) {
                        $incoming | Add-Member -MemberType NoteProperty -Name "users" -Value $currState.users -Force
                    }
                }
                
                $toWrite = if ($incoming) { ConvertTo-Json $incoming -Depth 10 } else { $bodyText }
                [System.IO.File]::WriteAllText($stateFile, $toWrite, $utf8NoBom)

                # Graceful Supabase Cloud Sync
                try {
                    $supaUrl = "https://wchpkvxjufjujaganaca.supabase.co"
                    $supaKey = "sb_publishable_qBhFiLibDHVoM22HjP0Vvw_Gtw_fpbd"
                    $kvBody = ConvertTo-Json @{ key = "global_state"; data = (if ($incoming) { $incoming } else { $currState }) } -Depth 10 -Compress
                    $sBytes = [System.Text.Encoding]::UTF8.GetBytes($kvBody)
                    $sReq = [System.Net.HttpWebRequest]::Create("$supaUrl/rest/v1/app_state")
                    $sReq.Method = "POST"
                    $sReq.ContentType = "application/json"
                    $sReq.Headers["apikey"] = $supaKey
                    $sReq.Headers["Authorization"] = "Bearer $supaKey"
                    $sReq.Headers["Prefer"] = "resolution=merge-duplicates"
                    $sReq.Timeout = 1500
                    $sReq.ContentLength = $sBytes.Length
                    $sStream = $sReq.GetRequestStream()
                    $sStream.Write($sBytes, 0, $sBytes.Length)
                    $sStream.Close()
                    $sResp = $sReq.GetResponse()
                    $sResp.Close()
                } catch {}

                $bytes = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
                Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
                continue
            }
        } elseif ($path -eq "/api/admin/login" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $bodyObj = $null
            try { $bodyObj = ConvertFrom-Json $bodyText } catch {}

            $email = if ($bodyObj -and $bodyObj.email) { $bodyObj.email.Trim().ToLower() } else { "" }
            $password = if ($bodyObj -and $bodyObj.password) { $bodyObj.password.Trim() } else { "" }

            if ($email -eq "rrizky205@gmail.com" -and $password -eq "sandibarnyu1913") {
                $json = ConvertTo-Json @{ 
                    ok = $true
                    admin = @{
                        email = "rrizky205@gmail.com"
                        name = "Rizky M. Riady"
                        role = "Superadmin"
                    }
                    message = "Login admin berhasil"
                } -Depth 10
            } else {
                $json = ConvertTo-Json @{ 
                    ok = $false
                    message = "Email atau kata sandi admin salah"
                } -Depth 10
            }
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/auth/send-otp" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $bodyObj = $null
            try { $bodyObj = ConvertFrom-Json $bodyText } catch {}

            $target = if ($bodyObj -and $bodyObj.target) { $bodyObj.target.Trim() } else { "" }
            $otpCode = "191320" # Standard verification code for TataDana
            $json = ConvertTo-Json @{ 
                ok = $true
                otp = $otpCode
                target = $target
                message = "Kode OTP berhasil dikirimkan ke $target"
            } -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/users" -and $method -eq "GET") {
            $state = $null
            if (Test-Path $stateFile) {
                try { $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
            }
            $userList = if ($state -and $state.users) { $state.users } else { @() }
            $json = ConvertTo-Json @{ ok = $true; users = $userList } -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/register" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $bodyObj = $null
            try { $bodyObj = ConvertFrom-Json $bodyText } catch {}

            $state = $null
            if (Test-Path $stateFile) {
                try { $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
            }
            if (-not $state) { $state = [pscustomobject]@{} }

            $rawName = if ($bodyObj -and $bodyObj.name) { $bodyObj.name.Trim() } else { "Pengguna Baru" }
            $rawEmail = if ($bodyObj -and $bodyObj.email) { $bodyObj.email.Trim() } else { "user@tatadana.id" }
            $rawPhone = if ($bodyObj -and $bodyObj.phone) { $bodyObj.phone.Trim() } else { "+62 812-0000-0000" }
            $rawPlan = if ($bodyObj -and $bodyObj.plan -and ($bodyObj.plan.ToLower() -like "*pro*")) { "Pro" } else { "Gratis" }
            $payMethod = if ($bodyObj -and $bodyObj.paymentMethod) { $bodyObj.paymentMethod } else { if ($rawPlan -eq "Pro") { "BCA Transfer" } else { "-" } }
            $payStatus = if ($rawPlan -eq "Pro") { "Pending Approval" } else { "Aktif" }

            $nowStr = (Get-Date).ToString("yyyy-MM-dd HH:mm")
            $newUId = "usr_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

            $newUser = [pscustomobject]@{
                id = $newUId
                name = $rawName
                email = $rawEmail
                phone = $rawPhone
                registeredAt = $nowStr
                plan = $rawPlan
                paymentStatus = $payStatus
                paymentMethod = $payMethod
                role = "User"
                telegramUsername = "-"
            }

            $currentUsers = if ($state.users) { @($state.users) } else { @() }
            # Update existing if email matches, or prepend new
            $exists = $false
            $updatedUsers = @()
            foreach ($u in $currentUsers) {
                if ($u.email -and $u.email.ToLower() -eq $rawEmail.ToLower()) {
                    $updatedUsers += $newUser
                    $exists = $true
                } else {
                    $updatedUsers += $u
                }
            }
            if (-not $exists) {
                $updatedUsers = @($newUser) + $updatedUsers
            }
            $state | Add-Member -MemberType NoteProperty -Name "users" -Value $updatedUsers -Force

            # ========================================================
            # RESET TRANSACTION & BUDGETING DATA FOR NEW USER (MULAI DARI 0)
            # ========================================================
            $state.transactions = @()
            $state.budgets = @()
            $state | Add-Member -MemberType NoteProperty -Name "deletedTxIds" -Value @() -Force
            $state.wallets = @(
                [pscustomobject]@{ id = "w1"; name = "BCA"; balance = 0; type = "bank"; color = "#0066AE"; isDefault = $true },
                [pscustomobject]@{ id = "w2"; name = "Mandiri"; balance = 0; type = "bank"; color = "#003D79"; isDefault = $false },
                [pscustomobject]@{ id = "w3"; name = "GoPay"; balance = 0; type = "ewallet"; color = "#00AED6"; isDefault = $false },
                [pscustomobject]@{ id = "w4"; name = "Cash"; balance = 0; type = "cash"; color = "#10B981"; isDefault = $false }
            )
            $welcomeChat = [pscustomobject]@{
                id = "ch_init_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                sender = "system"
                text = "Pendaftaran akun baru: $rawName ($rawEmail)"
                reply = "Selamat datang di TataDana! Seluruh saldo dan transaksi Anda telah di-reset mulai dari Rp0. Hubungkan bot @DANATATA_BOT untuk mencatat otomatis."
                time = $nowStr
                platform = "web"
            }
            $state.chatHistory = @($welcomeChat)

            [System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json $state -Depth 10), $utf8NoBom)

            # Send Telegram Bot Notification for new registration
            $token = if ($state.telegramToken) { $state.telegramToken } else { "8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ" }
            $cId = if ($state.telegramChatId) { $state.telegramChatId } else { $null }
            if ($token -and $cId) {
                $tgText = "👤 [REGISTRASI PENGGUNA BARU]`n`n" +
                          "• Nama: $rawName`n" +
                          "• Email: $rawEmail`n" +
                          "• No HP: $rawPhone`n" +
                          "• Paket: $rawPlan ($payStatus)`n" +
                          "• Metode Bayar: $payMethod`n" +
                          "• Status Data: Saldo & Transaksi DI-RESET ke Rp0`n`n" +
                          "Tinjau & kelola di Superadmin: http://localhost:3000/admin"
                try {
                    Send-Telegram-Post -sendUrl "https://api.telegram.org/bot$token/sendMessage" -postObj @{ chat_id = $cId; text = $tgText } -baseDir $baseDir
                } catch {}
            }

            $resJson = ConvertTo-Json @{ ok = $true; user = $newUser; state = $state } -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/admin/approve-pro" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $bodyObj = $null
            try { $bodyObj = ConvertFrom-Json $bodyText } catch {}

            $targetEmail = if ($bodyObj -and $bodyObj.email) { $bodyObj.email.Trim() } else { "" }
            $targetUserId = if ($bodyObj -and $bodyObj.userId) { $bodyObj.userId.Trim() } else { "" }

            $state = $null
            if (Test-Path $stateFile) {
                try { $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
            }

            $approvedUser = $null
            if ($state -and $state.users) {
                foreach ($u in $state.users) {
                    if (($targetEmail -and $u.email -eq $targetEmail) -or ($targetUserId -and $u.id -eq $targetUserId) -or ($bodyObj -and $bodyObj.userName -and $u.name -eq $bodyObj.userName)) {
                        $u.plan = "Pro"
                        $u.paymentStatus = "Approved"
                        $u.role = "Pro Quantum"
                        $approvedUser = $u
                        break
                    }
                }
                if ($approvedUser) {
                    [System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json $state -Depth 10), $utf8NoBom)

                    # Send Telegram Notification for Approval
                    $token = if ($state.telegramToken) { $state.telegramToken } else { "8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ" }
                    $cId = if ($state.telegramChatId) { $state.telegramChatId } else { $null }
                    if ($token -and $cId) {
                        $tgMsg = "🎉 [PEMBAYARAN PRO DISETUJUI ADMIN]`n`n" +
                                 "• Pengguna: $($approvedUser.name)`n" +
                                 "• Email: $($approvedUser.email)`n" +
                                 "• Paket: Pro Quantum (Aktif)`n" +
                                 "• Akses: Unlimited Multi-Dompet, OCR Struk & Multi-AI`n`n" +
                                 "Buka User Dashboard: http://localhost:3000/dashboard"
                        try {
                            Send-Telegram-Post -sendUrl "https://api.telegram.org/bot$token/sendMessage" -postObj @{ chat_id = $cId; text = $tgMsg } -baseDir $baseDir
                        } catch {}
                    }
                }
            }

            $resJson = ConvertTo-Json @{ ok = [bool]$approvedUser; user = $approvedUser; state = $state } -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/admin/reject-pro" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $bodyObj = $null
            try { $bodyObj = ConvertFrom-Json $bodyText } catch {}

            $targetEmail = if ($bodyObj -and $bodyObj.email) { $bodyObj.email.Trim() } else { "" }
            $targetUserId = if ($bodyObj -and $bodyObj.userId) { $bodyObj.userId.Trim() } else { "" }

            $state = $null
            if (Test-Path $stateFile) {
                try { $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
            }

            $rejectedUser = $null
            if ($state -and $state.users) {
                foreach ($u in $state.users) {
                    if (($targetEmail -and $u.email -eq $targetEmail) -or ($targetUserId -and $u.id -eq $targetUserId) -or ($bodyObj -and $bodyObj.userName -and $u.name -eq $bodyObj.userName)) {
                        $u.plan = "Gratis"
                        $u.paymentStatus = "Ditolak"
                        $u.role = "Starter"
                        $rejectedUser = $u
                        break
                    }
                }
                if ($rejectedUser) {
                    [System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json $state -Depth 10), $utf8NoBom)
                }
            }

            $resJson = ConvertTo-Json @{ ok = [bool]$rejectedUser; user = $rejectedUser; state = $state } -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/user/upgrade-pro" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $bodyObj = $null
            try { $bodyObj = ConvertFrom-Json $bodyText } catch {}

            $targetEmail = if ($bodyObj -and $bodyObj.email) { $bodyObj.email.Trim() } else { "" }
            $payMethod = if ($bodyObj -and $bodyObj.paymentMethod) { $bodyObj.paymentMethod } else { "BCA Transfer" }

            $state = $null
            if (Test-Path $stateFile) {
                try { $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
            }

            $upgradedUser = $null
            if ($state -and $state.users) {
                foreach ($u in $state.users) {
                    if (($targetEmail -and $u.email -eq $targetEmail) -or ($bodyObj -and $bodyObj.userId -and $u.id -eq $bodyObj.userId)) {
                        $u.plan = "Pro"
                        $u.paymentStatus = "Pending Approval"
                        $u.paymentMethod = $payMethod
                        if ($bodyObj.senderName) { $u | Add-Member -MemberType NoteProperty -Name "senderName" -Value $bodyObj.senderName -Force }
                        if ($bodyObj.senderAccount) { $u | Add-Member -MemberType NoteProperty -Name "senderAccount" -Value $bodyObj.senderAccount -Force }
                        if ($bodyObj.proofImage) { $u | Add-Member -MemberType NoteProperty -Name "proofImage" -Value $bodyObj.proofImage -Force }
                        if ($bodyObj.amount) { $u | Add-Member -MemberType NoteProperty -Name "paymentAmount" -Value $bodyObj.amount -Force }
                        $upgradedUser = $u
                        break
                    }
                }
                if (-not $upgradedUser -and $targetEmail) {
                    $nowStr = (Get-Date).ToString("yyyy-MM-dd HH:mm")
                    $upgradedUser = [pscustomobject]@{
                        id = "usr_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                        name = if ($bodyObj -and $bodyObj.name) { $bodyObj.name } else { $targetEmail.Split('@')[0] }
                        email = $targetEmail
                        phone = if ($bodyObj -and $bodyObj.phone) { $bodyObj.phone } else { "-" }
                        registeredAt = $nowStr
                        plan = "Pro"
                        paymentStatus = "Pending Approval"
                        paymentMethod = $payMethod
                        role = "Pro (Pending)"
                        telegramUsername = "-"
                    }
                    if ($bodyObj.senderName) { $upgradedUser | Add-Member -MemberType NoteProperty -Name "senderName" -Value $bodyObj.senderName -Force }
                    if ($bodyObj.senderAccount) { $upgradedUser | Add-Member -MemberType NoteProperty -Name "senderAccount" -Value $bodyObj.senderAccount -Force }
                    if ($bodyObj.proofImage) { $upgradedUser | Add-Member -MemberType NoteProperty -Name "proofImage" -Value $bodyObj.proofImage -Force }
                    if ($bodyObj.amount) { $upgradedUser | Add-Member -MemberType NoteProperty -Name "paymentAmount" -Value $bodyObj.amount -Force }

                    $currUsers = if ($state.users) { @($state.users) } else { @() }
                    $state | Add-Member -MemberType NoteProperty -Name "users" -Value (@($upgradedUser) + $currUsers) -Force
                }
                if ($upgradedUser) {
                    [System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json $state -Depth 10), $utf8NoBom)

                    # Send Telegram Notification for Upgrade Request
                    $token = if ($state.telegramToken) { $state.telegramToken } else { "8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ" }
                    $cId = if ($state.telegramChatId) { $state.telegramChatId } else { $null }
                    if ($token -and $cId) {
                        $sName = if ($upgradedUser.senderName) { $upgradedUser.senderName } else { "-" }
                        $tgMsg = "💎 [PERMINTAAN UPGRADE PRO MASUK]`n`n" +
                                 "• Pengguna: $($upgradedUser.name)`n" +
                                 "• Email: $($upgradedUser.email)`n" +
                                 "• Metode: $payMethod`n" +
                                 "• Pengirim: $sName`n" +
                                 "• Nominal: Rp99.205 (Termasuk Kode Unik)`n" +
                                 "• Status: Menunggu Persetujuan Admin`n`n" +
                                 "Buka Admin Console untuk Approve: http://localhost:3000/admin"
                        try {
                            Send-Telegram-Post -sendUrl "https://api.telegram.org/bot$token/sendMessage" -postObj @{ chat_id = $cId; text = $tgMsg } -baseDir $baseDir
                        } catch {}
                    }
                }
            }

            $resJson = ConvertTo-Json @{ ok = [bool]$upgradedUser; user = $upgradedUser } -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/transaction/delete" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $bodyObj = $null
            try { $bodyObj = ConvertFrom-Json $bodyText } catch {}
            $txIdToDelete = if ($bodyObj -and $bodyObj.id) { $bodyObj.id } else { "" }

            $state = $null
            if (Test-Path $stateFile) {
                try { $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
            }

            if ($state -and $txIdToDelete) {
                $delList = if ($state.deletedTxIds) { @($state.deletedTxIds) } else { @() }
                $alreadyDeleted = ($delList -contains $txIdToDelete)

                $foundTx = $null
                $remainingTxs = @()
                if ($state.transactions) {
                    foreach ($t in $state.transactions) {
                        if ($t.id -eq $txIdToDelete) {
                            $foundTx = $t
                        } else {
                            $remainingTxs += $t
                        }
                    }
                }

                if ($foundTx -and (-not $alreadyDeleted)) {
                    # Financial Reversal
                    if ($state.wallets) {
                        if ($foundTx.type -eq "expense") {
                            $w = $state.wallets | Where-Object { $_.id -eq $foundTx.walletId -or $_.name -eq $foundTx.walletName } | Select-Object -First 1
                            if (-not $w -and $state.wallets.Count -gt 0) { $w = $state.wallets[0] }
                            if ($w) { $w.balance += $foundTx.amount }
                        } elseif ($foundTx.type -eq "income") {
                            $w = $state.wallets | Where-Object { $_.id -eq $foundTx.walletId -or $_.name -eq $foundTx.walletName } | Select-Object -First 1
                            if (-not $w -and $state.wallets.Count -gt 0) { $w = $state.wallets[0] }
                            if ($w) { $w.balance -= $foundTx.amount }
                        } elseif ($foundTx.type -eq "transfer") {
                            $srcW = $state.wallets | Where-Object { $_.id -eq $foundTx.walletId -or $_.name -eq $foundTx.walletName } | Select-Object -First 1
                            $tgtW = $state.wallets | Where-Object { $_.id -eq $foundTx.targetWalletId -or $_.name -eq $foundTx.targetWalletName } | Select-Object -First 1
                            if ($srcW) { $srcW.balance += $foundTx.amount }
                            if ($tgtW) { $tgtW.balance -= $foundTx.amount }
                        }
                    }

                    $state.transactions = $remainingTxs
                    if ($delList -notcontains $txIdToDelete) {
                        $delList += $txIdToDelete
                    }
                    $state | Add-Member -MemberType NoteProperty -Name "deletedTxIds" -Value $delList -Force

                    [System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json $state -Depth 10), $utf8NoBom)
                } elseif ($alreadyDeleted -and $foundTx) {
                    # Ensure transaction is removed even if previously recorded in deletedTxIds
                    $state.transactions = $remainingTxs
                    [System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json $state -Depth 10), $utf8NoBom)
                }
            }

            $json = ConvertTo-Json @{ ok = $true; state = $state } -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/telegram/save-token" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $bodyObj = $null
            try { $bodyObj = ConvertFrom-Json $bodyText } catch {}
            $token = ""
            if ($bodyObj -and $bodyObj.token) { $token = $bodyObj.token.Trim() }

            $botUsername = "DANATATA_BOT"
            $botId = 8901649639
            $botFirstName = "tatadana_bot"
            $isValid = $false
            $errorMsg = ""

            if ($token) {
                try {
                    $tgRes = curl.exe -s --max-time 6 "https://api.telegram.org/bot$token/getMe"
                    $tgObj = ConvertFrom-Json $tgRes
                    if ($tgObj.ok) {
                        $isValid = $true
                        $botUsername = $tgObj.result.username
                        $botId = $tgObj.result.id
                        $botFirstName = $tgObj.result.first_name
                        # Delete webhook with drop_pending_updates=true so getUpdates polling works cleanly
                        curl.exe -s --max-time 4 "https://api.telegram.org/bot$token/deleteWebhook?drop_pending_updates=true" | Out-Null
                    } else {
                        $errorMsg = $tgObj.description
                    }
                } catch {
                    $errorMsg = "$_"
                }
            }

            $state = $null
            if (Test-Path $stateFile) {
                try { $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
            }
            if ($state -ne $null -and $token) {
                $state | Add-Member -MemberType NoteProperty -Name "telegramToken" -Value $token -Force
                $state | Add-Member -MemberType NoteProperty -Name "telegramBotUsername" -Value $botUsername -Force
                [System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json $state -Depth 10), [System.Text.Encoding]::UTF8)
                if (-not (Check-WorkerActive)) {
                    Start-WorkerDaemon
                }
            }

            $json = ConvertTo-Json @{ 
                ok = if ($isValid -or (-not $errorMsg)) { $true } else { $false }
                status = "connected"
                username = $botUsername
                id = $botId
                first_name = $botFirstName
                token = $token
                error = $errorMsg
            }
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/telegram/test-connection") {
            $state = $null
            $token = ""
            $botUsername = "DANATATA_BOT"
            $botId = 8901649639
            if (Test-Path $stateFile) {
                try {
                    $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8))
                    $token = $state.telegramToken
                } catch {}
            }
            if (-not $token) { $token = "8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ" }
            if ($token) {
                try {
                    $tgRes = curl.exe -s --max-time 5 "https://api.telegram.org/bot$token/getMe"
                    $tgObj = ConvertFrom-Json $tgRes
                    if ($tgObj.ok) {
                        $botUsername = $tgObj.result.username
                        $botId = $tgObj.result.id
                    }
                } catch {}
            }
            $json = ConvertTo-Json @{ ok = $true; result = @{ id = $botId; username = $botUsername }; status = "connected" }
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/telegram/poll") {
            $state = $null
            if (Test-Path $stateFile) {
                try { $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
            }
            $token = if ($state -and $state.telegramToken) { $state.telegramToken } else { "8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ" }
            $workerActive = Check-WorkerActive

            if (-not $workerActive -and $token) {
                Start-WorkerDaemon

                # Inline pull fallback only if worker is not yet running
                try {
                    $lastOffset = 0
                    if (Test-Path $offsetFile) {
                        try { $lastOffset = [long]([System.IO.File]::ReadAllText($offsetFile).Trim()) } catch {}
                    }
                    $tgRes = curl.exe -s --max-time 3 "https://api.telegram.org/bot$token/getUpdates?offset=$lastOffset&timeout=0"
                    if ($tgRes) {
                        $updData = ConvertFrom-Json $tgRes
                        if ($updData.error_code -eq 409 -or ($updData.description -and $updData.description -like "*webhook*")) {
                            curl.exe -s --max-time 4 "https://api.telegram.org/bot$token/deleteWebhook?drop_pending_updates=true" | Out-Null
                        } elseif ($updData.ok -and $updData.result -and $updData.result.Count -gt 0) {
                            $logicFile = Join-Path $baseDir "telegram_logic.ps1"
                            if (Test-Path $logicFile) { try { . $logicFile } catch {} }
                            $stateModified = $false
                            foreach ($upd in $updData.result) {
                                $uId = [long]$upd.update_id
                                if ($uId -ge $lastOffset) {
                                    $lastOffset = $uId + 1
                                    [System.IO.File]::WriteAllText($offsetFile, $lastOffset.ToString(), $utf8NoBom)
                                }
                                if ($upd.message -and $upd.message.text) {
                                    $mText = $upd.message.text
                                    $cId = $upd.message.chat.id
                                    $reply = Process-Incoming-Message -msgText $mText -chatId $cId -platform "telegram" -state ([ref]$state)
                                    $stateModified = $true

                                    Send-Telegram-Message-With-Keyboards -token $token -chatId $cId -replyText $reply -msgText $mText -baseDir $baseDir
                                }
                            }
                            if ($stateModified) {
                                [System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json $state -Depth 10), $utf8NoBom)
                            }
                        }
                    }
                } catch {}
            } else {
                # Worker is active; refresh state from file so response contains the latest data written by worker
                if (Test-Path $stateFile) {
                    try { $state = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)) } catch {}
                }
            }

            $json = ConvertTo-Json @{ ok = $true; workerActive = $workerActive; state = $state } -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/telegram/webhook" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $body = $null
            try { $body = ConvertFrom-Json $bodyText } catch {}
            
            $msgText = ""
            $chatId = $null
            if ($body -ne $null) {
                if ($body.message -and $body.message.text) {
                    $msgText = $body.message.text
                    if ($body.message.chat) { $chatId = $body.message.chat.id }
                } elseif ($body.text) {
                    $msgText = $body.text
                    if ($body.chat_id) { $chatId = $body.chat_id }
                }
            }
            if (-not $msgText) { $msgText = "beli kopi 25rb" }

            $state = $null
            if (Test-Path $stateFile) {
                try {
                    $stateJson = [System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)
                    $state = ConvertFrom-Json $stateJson
                } catch {}
            }

            $token = if ($state -and $state.telegramToken) { $state.telegramToken } else { "8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ" }
            $reply = Process-Incoming-Message -msgText $msgText -chatId $chatId -platform "telegram" -state ([ref]$state)

            if ($token -and $chatId) {
                Send-Telegram-Message-With-Keyboards -token $token -chatId $chatId -replyText $reply -msgText $msgText -baseDir $baseDir
            }

            if ($state -ne $null) {
                try {
                    $updatedJson = ConvertTo-Json $state -Depth 10
                    [System.IO.File]::WriteAllText($stateFile, $updatedJson, [System.Text.Encoding]::UTF8)
                } catch {}
            }

            $resObj = @{ ok = $true; reply = $reply; state = $state }
            $resJson = ConvertTo-Json $resObj -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            Send-Http-Response -response $response -bytes $bytes -contentType "application/json; charset=utf-8"
            continue
        } elseif ($path -eq "/api/export/pdf") {
            $pdfPath = Join-Path $baseDir "sample-report.pdf"
            if (Test-Path $pdfPath) {
                $pdfBytes = [System.IO.File]::ReadAllBytes($pdfPath)
                $response.AddHeader("Content-Disposition", "attachment; filename=Laporan_TataDana.pdf")
                Send-Http-Response -response $response -bytes $pdfBytes -contentType "application/pdf"
            } else {
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("PDF not found")
                Send-Http-Response -response $response -bytes $bytes -contentType "text/plain" -statusCode 404
            }
            continue
        } elseif ($path -eq "/api/export/excel") {
            $csv = "Tanggal,Kategori,Nominal,Catatan`n2026-10-13,Makanan,-45000,Bakso solo`n2026-10-13,Transport,-150000,Bensin pertamax`n2026-10-01,Gaji,18500000,Gaji bulanan"
            $csvBytes = [System.Text.Encoding]::UTF8.GetBytes($csv)
            $response.AddHeader("Content-Disposition", "attachment; filename=Laporan_TataDana.csv")
            Send-Http-Response -response $response -bytes $csvBytes -contentType "text/csv; charset=utf-8"
            continue
        }

        # Resolve Page or Static File
        $contentType = "text/html; charset=utf-8"
        $targetFile = "index.html"
        $normPath = if ($path.Length -gt 1) { $path.TrimEnd('/') } else { $path }

        if ($normPath.EndsWith(".html")) {
            $contentType = "text/html; charset=utf-8"
            $targetFile = $normPath.TrimStart('/')
        } elseif ($normPath -eq "" -or $normPath -eq "/" -or $normPath -eq "/index") {
            $targetFile = "index.html"
        } elseif ($normPath -eq "/login" -or $normPath -eq "/auth/login") {
            $targetFile = "login.html"
        } elseif ($normPath -eq "/register" -or $normPath -eq "/auth/register") {
            $targetFile = "register.html"
        } elseif ($normPath -eq "/dashboard" -or $normPath -eq "/dashboard/beranda") {
            $targetFile = "dashboard.html"
        } elseif ($normPath -eq "/transaksi" -or $normPath -eq "/dashboard/transaksi") {
            $response.Redirect("/dashboard")
            $response.Close()
            continue
        } elseif ($normPath -eq "/laporan" -or $normPath -eq "/dashboard/laporan") {
            $targetFile = "laporan.html"
        } elseif ($normPath -eq "/budget" -or $normPath -eq "/dashboard/budget") {
            $targetFile = "budget.html"
        } elseif ($normPath -eq "/wallet" -or $normPath -eq "/dashboard/wallet") {
            $targetFile = "wallet.html"
        } elseif ($normPath -eq "/settings" -or $normPath -eq "/dashboard/settings") {
            $targetFile = "settings.html"
        } elseif ($normPath -eq "/admin" -or $normPath -eq "/admin/overview") {
            $targetFile = "admin.html"
        } elseif ($path.EndsWith(".js")) {
            $contentType = "application/javascript; charset=utf-8"
            $targetFile = $path.TrimStart('/')
        } elseif ($path.EndsWith(".css")) {
            $contentType = "text/css; charset=utf-8"
            $targetFile = $path.TrimStart('/')
        } elseif ($path.EndsWith(".json")) {
            $contentType = "application/json; charset=utf-8"
            $targetFile = $path.TrimStart('/')
        } elseif ($path.EndsWith(".png")) {
            $contentType = "image/png"
            $targetFile = $path.TrimStart('/')
        } elseif ($path.EndsWith(".jpg") -or $path.EndsWith(".jpeg")) {
            $contentType = "image/jpeg"
            $targetFile = $path.TrimStart('/')
        } elseif ($path.EndsWith(".svg")) {
            $contentType = "image/svg+xml"
            $targetFile = $path.TrimStart('/')
        } elseif ($path.EndsWith(".ico")) {
            $contentType = "image/x-icon"
            $targetFile = $path.TrimStart('/')
        } elseif ($path.EndsWith(".pdf")) {
            $contentType = "application/pdf"
            $targetFile = $path.TrimStart('/')
        }

        $targetFile = $targetFile.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $fullPath = Join-Path $publicDir $targetFile
        if (Test-Path $fullPath) {
            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            Send-Http-Response -response $response -bytes $bytes -contentType $contentType -statusCode 200
        } else {
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1>")
            Send-Http-Response -response $response -bytes $bytes -contentType "text/html; charset=utf-8" -statusCode 404
        }
    } catch {
        Write-Host "Error handling request: $_"
        try { if ($context -and $context.Response) { $context.Response.Close() } } catch {}
    }
}
