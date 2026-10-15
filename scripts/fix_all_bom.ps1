$baseDir = Join-Path $PSScriptRoot ".."
$files = Get-ChildItem -Path $baseDir -Filter "*.ps1" -Recurse
$utf8BOM = New-Object System.Text.UTF8Encoding($true)

foreach ($f in $files) {
    $text = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText($f.FullName, $text, $utf8BOM)
    Write-Host "Ensured UTF-8 BOM for:" $f.FullName
}
