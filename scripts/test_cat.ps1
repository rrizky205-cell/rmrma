$c = "🎮 Top Up Skin ML"
$clean = ($c -replace '^[\p{P}\p{S}\s]+', '').Trim().ToLower()
Write-Host "P/S Clean: '$clean'"
$cleanW = ($c -replace '^[^\w\s]+', '').Trim().ToLower()
Write-Host "W Clean: '$cleanW'"
$msg = "top up skin ml 50rb pake gopay"
Write-Host "Contains P/S: $($msg.Contains($clean))"
Write-Host "Contains W: $($msg.Contains($cleanW))"
