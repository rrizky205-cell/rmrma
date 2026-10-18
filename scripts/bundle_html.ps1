$base = "C:\Users\RIZKY MUHAMMAD RIADY\.gemini\antigravity\scratch\tatadana"
$pub = Join-Path $base "public"
$srcLib = Join-Path $base "src\lib"
if (-not (Test-Path $srcLib)) { New-Item -ItemType Directory -Path $srcLib -Force }

$pages = @("index", "dashboard", "admin", "login", "register", "wallet", "budget", "laporan", "settings")

$sb = [System.Text.StringBuilder]::new()
$sb.AppendLine("// Auto-generated HTML bundle for Next.js App Router Route Handlers") | Out-Null

foreach ($p in $pages) {
    $filePath = Join-Path $pub "$p.html"
    if (Test-Path $filePath) {
        $raw = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        $jsonStr = ConvertTo-Json $raw -Compress
        $varName = $p + "Html"
        $sb.AppendLine("export const ${varName}: string = $jsonStr;") | Out-Null
        Write-Host "Bundled $p.html ($([math]::Round($raw.Length/1KB, 1)) KB)"
    }
}

$bundlePath = Join-Path $srcLib "html-pages.ts"
[System.IO.File]::WriteAllText($bundlePath, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Created $bundlePath"
