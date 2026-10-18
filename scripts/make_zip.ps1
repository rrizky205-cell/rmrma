$ErrorActionPreference = 'Stop'
$projPath = "C:\Users\RIZKY MUHAMMAD RIADY\.gemini\antigravity\scratch\tatadana"
$zipPath = Join-Path $projPath "tatadana-project.zip"
$pubZip = Join-Path $projPath "public\tatadana-project.zip"
$downloadsPath = "C:\Users\RIZKY MUHAMMAD RIADY\Downloads"
$downloadsZip = Join-Path $downloadsPath "tatadana-project.zip"
$desktopPath = "C:\Users\RIZKY MUHAMMAD RIADY\Desktop"
$desktopZip = Join-Path $desktopPath "tatadana-project.zip"

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
if (Test-Path $pubZip) { Remove-Item $pubZip -Force }

$items = Get-ChildItem -Path $projPath | Where-Object { $_.Name -notmatch '\.zip$' -and $_.Name -notmatch '\.pid$' }
Write-Host "Compressing $($items.Count) items to $zipPath..."
Compress-Archive -Path $items.FullName -DestinationPath $zipPath -Force

Write-Host "Copying to public web directory..."
Copy-Item -Path $zipPath -Destination $pubZip -Force

if (Test-Path $downloadsPath) {
    Copy-Item -Path $zipPath -Destination $downloadsZip -Force
    Write-Host "Copied to Downloads folder: $downloadsZip"
}

if (Test-Path $desktopPath) {
    Copy-Item -Path $zipPath -Destination $desktopZip -Force
    Write-Host "Copied to Desktop folder: $desktopZip"
}

$z = Get-Item $zipPath
Write-Host "ZIP Creation SUCCESS! Size: $([math]::Round($z.Length / 1KB, 2)) KB"
