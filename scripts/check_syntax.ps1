$target = Join-Path $PSScriptRoot "..\telegram_logic.ps1"
$content = [System.IO.File]::ReadAllText($target)
$tokens = $null
$errors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$errors)

$curlyTokens = $tokens | Where-Object { $_.Kind -eq "LCurly" -or $_.Kind -eq "AtCurly" -or $_.Kind -eq "RCurly" }
$stack = New-Object System.Collections.ArrayList

foreach ($t in $curlyTokens) {
    if ($t.Kind -eq "LCurly" -or $t.Kind -eq "AtCurly") {
        $null = $stack.Add($t)
    } elseif ($t.Kind -eq "RCurly") {
        if ($stack.Count -gt 0) {
            $stack.RemoveAt($stack.Count - 1)
        } else {
            Write-Host "Unexpected RCurly at line $($t.Extent.StartLineNumber)"
        }
    }
}

Write-Host "Remaining unclosed curly count: $($stack.Count)"
$lines = [System.IO.File]::ReadAllLines($target)
foreach ($unclosed in $stack) {
    Write-Host "Unclosed $($unclosed.Kind) at line $($unclosed.Extent.StartLineNumber):"
    Write-Host "  Line $($unclosed.Extent.StartLineNumber): $($lines[$unclosed.Extent.StartLineNumber - 1])"
}
