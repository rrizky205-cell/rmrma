$baseDir = Join-Path $PSScriptRoot ".."
$workerScript = Join-Path $baseDir "telegram_worker.ps1"
$job = Start-Job -FilePath $workerScript
Start-Sleep -Seconds 4
$jobOutput = Receive-Job $job
$jobState = $job.State
Stop-Job $job
Remove-Job $job

Write-Host "Worker Job State:" $jobState
Write-Host "Worker Output:"
$jobOutput | ForEach-Object { Write-Host "  " $_ }
