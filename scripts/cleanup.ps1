$baseDir = Join-Path $PSScriptRoot ".."
$pidFile = Join-Path $baseDir "telegram_worker.pid"
if (Test-Path $pidFile) {
    try {
        $pidNum = [int]([System.IO.File]::ReadAllText($pidFile).Trim())
        $proc = Get-Process -Id $pidNum -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $pidNum -Force
            Write-Host "Stopped old worker PID $pidNum"
        }
    } catch {}
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}
Write-Host "Cleanup completed successfully."
