$target = Join-Path $PSScriptRoot "..\telegram_logic.ps1"
$bytes = [System.IO.File]::ReadAllBytes($target)
Write-Host "File byte length:" $bytes.Length
Write-Host "First 3 bytes:" $bytes[0], $bytes[1], $bytes[2]

# Read as UTF8
$text = [System.IO.File]::ReadAllText($target, [System.Text.Encoding]::UTF8)

# Write back with UTF8 with BOM
$utf8BOM = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllText($target, $text, $utf8BOM)
Write-Host "Saved successfully with UTF-8 BOM"
