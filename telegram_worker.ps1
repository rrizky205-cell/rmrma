[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# TataDana Telegram Poller Daemon
$baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\RIZKY MUHAMMAD RIADY\.gemini\antigravity\scratch\tatadana" }
. (Join-Path $baseDir "telegram_logic.ps1")

$stateFile = Join-Path $baseDir "tatadana_state.json"
$offsetFile = Join-Path $baseDir "telegram_offset.txt"
$pidFile = Join-Path $baseDir "telegram_worker.pid"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# Save worker PID
try {
    [System.IO.File]::WriteAllText($pidFile, $PID.ToString(), $utf8NoBom)
} catch {}

Write-Host "TataDana Telegram Poller Worker started (PID: $PID)..."

# Initial webhook cleanup with drop_pending_updates=true so getUpdates succeeds without 409 conflict
try {
    $t = "8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ"
    if (Test-Path $stateFile) {
        $initState = ConvertFrom-Json ([System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8))
        if ($initState -and $initState.telegramToken) {
            $t = $initState.telegramToken
        }
    }
    curl.exe -s --max-time 4 "https://api.telegram.org/bot$t/deleteWebhook" | Out-Null
} catch {}

$lastOffset = 0
if (Test-Path $offsetFile) {
    try {
        $lastOffset = [long]([System.IO.File]::ReadAllText($offsetFile).Trim())
    } catch {}
}

while ($true) {
    try {
        if (-not (Test-Path $stateFile)) {
            Start-Sleep -Seconds 2
            continue
        }

        $stateJson = [System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)
        $state = ConvertFrom-Json $stateJson
        $token = if ($state -and $state.telegramToken) { $state.telegramToken } else { "8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ" }

        # Long poll Telegram updates (timeout 2s for high responsiveness)
        $url = "https://api.telegram.org/bot$token/getUpdates?offset=$lastOffset&timeout=2"
        $raw = curl.exe -s --max-time 8 $url
        if (-not $raw) {
            Start-Sleep -Milliseconds 600
            continue
        }

        $data = $null
        try {
            $data = ConvertFrom-Json $raw
        } catch {
            Start-Sleep -Milliseconds 600
            continue
        }

        if ($data.error_code -eq 409 -or ($data.description -and $data.description -like "*webhook*")) {
            Write-Host "[Telegram Worker] Webhook conflict detected. Deleting webhook..."
            curl.exe -s --max-time 4 "https://api.telegram.org/bot$token/deleteWebhook" | Out-Null
            Start-Sleep -Milliseconds 600
            continue
        }

        if ($data.ok -and $data.result -and $data.result.Count -gt 0) {
            # Reload latest logic definitions
            $logicFile = Join-Path $baseDir "telegram_logic.ps1"
            if (Test-Path $logicFile) {
                try { . $logicFile } catch {}
            }

            # Re-read state to get the freshest data before modifying
            $stateJson = [System.IO.File]::ReadAllText($stateFile, [System.Text.Encoding]::UTF8)
            $state = ConvertFrom-Json $stateJson
            $stateModified = $false

            foreach ($upd in $data.result) {
                $updId = [long]$upd.update_id
                if ($updId -ge $lastOffset) {
                    $lastOffset = $updId + 1
                    try {
                        [System.IO.File]::WriteAllText($offsetFile, $lastOffset.ToString(), $utf8NoBom)
                    } catch {}
                }

                $msgText = $null
                $chatId = $null

                if ($upd.callback_query) {
                    $cb = $upd.callback_query
                    $cbId = $cb.id
                    $chatId = $cb.message.chat.id
                    $cbData = if ($cb.data) { $cb.data.Trim() } else { "" }

                    # Acknowledge callback immediately to dismiss spinning indicator
                    try {
                        $ackUrl = "https://api.telegram.org/bot$token/answerCallbackQuery"
                        $ackObj = @{ callback_query_id = $cbId }
                        Send-Telegram-Post -sendUrl $ackUrl -postObj $ackObj -baseDir $baseDir
                    } catch {}

                    # Map callback data to user command
                    switch -Wildcard ($cbData) {
                        "*expense*"  { $msgText = "💸 Pengeluaran" }
                        "*income*"   { $msgText = "💰 Pemasukan" }
                        "*transfer*" { $msgText = "🔄 Transfer" }
                        "*saldo*"    { $msgText = "/saldo" }
                        "*budget*"   { $msgText = "/budget" }
                        "*laporan*"  { $msgText = "/laporan" }
                        "*riwayat*"  { $msgText = "/riwayat" }
                        "*hapus*"    { $msgText = "/hapus" }
                        "*menu*"     { $msgText = "/menu" }
                        default      { $msgText = $cbData }
                    }
                } elseif ($upd.message -and $upd.message.text) {
                    $msgText = $upd.message.text.Trim()
                    $chatId = $upd.message.chat.id
                } elseif ($upd.edited_message -and $upd.edited_message.text) {
                    $msgText = $upd.edited_message.text.Trim()
                    $chatId = $upd.edited_message.chat.id
                }

                if ($msgText -and $chatId) {
                    Write-Host "[Telegram] Received from Chat ${chatId}: $msgText"

                    # Process financial message with unified logic
                    $reply = Process-Incoming-Message -msgText $msgText -chatId $chatId -platform "telegram" -state ([ref]$state)
                    $stateModified = $true

                    # Send reply back to Telegram user with interactive keyboard matching web app & direct web app links
                    Send-Telegram-Message-With-Keyboards -token $token -chatId $chatId -replyText $reply -msgText $msgText -baseDir $baseDir
                    Write-Host "[Telegram] Replied to Chat $chatId"
                }
            }

            if ($stateModified) {
                $newJson = ConvertTo-Json $state -Depth 10
                [System.IO.File]::WriteAllText($stateFile, $newJson, $utf8NoBom)
                Write-Host "[Telegram] Synchronized transaction and chat into tatadana_state.json"

                # Cloud sync to Supabase app_state table
                try {
                    $supaUrl = "https://wchpkvxjufjujaganaca.supabase.co"
                    $supaKey = "sb_publishable_qBhFiLibDHVoM22HjP0Vvw_Gtw_fpbd"
                    $kvBody = ConvertTo-Json @{ key = "global_state"; data = $state } -Depth 10 -Compress
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($kvBody)
                    $req = [System.Net.HttpWebRequest]::Create("$supaUrl/rest/v1/app_state")
                    $req.Method = "POST"
                    $req.ContentType = "application/json"
                    $req.Headers["apikey"] = $supaKey
                    $req.Headers["Authorization"] = "Bearer $supaKey"
                    $req.Headers["Prefer"] = "resolution=merge-duplicates"
                    $req.Timeout = 2000
                    $req.ContentLength = $bytes.Length
                    $s = $req.GetRequestStream()
                    $s.Write($bytes, 0, $bytes.Length)
                    $s.Close()
                    $resp = $req.GetResponse()
                    $resp.Close()
                } catch {}
            }
        }
    } catch {
        Write-Host "Telegram Worker loop exception: $_"
    }

    Start-Sleep -Milliseconds 600
}
