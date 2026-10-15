$target = Join-Path $PSScriptRoot "..\telegram_logic.ps1"
$content = [System.IO.File]::ReadAllText($target)
$errors = $null
$tokens = [System.Management.Automation.PSParser]::Tokenize($content, [ref]$errors)

$stack = New-Object System.Collections.Generic.Stack[System.Management.Automation.PSToken]
foreach ($t in $tokens) {
    if ($t.Type -eq [System.Management.Automation.PSTokenType]::GroupStart -and $t.Content -eq '{') {
        $stack.Push($t)
    } elseif ($t.Type -eq [System.Management.Automation.PSTokenType]::GroupEnd -and $t.Content -eq '}') {
        if ($stack.Count -gt 0) {
            $stack.Pop() | Out-Null
        } else {
            Write-Host "Extra closing brace at line $($t.StartLine), col $($t.StartColumn)"
        }
    }
}

Write-Host "Unclosed braces count:" $stack.Count
while ($stack.Count -gt 0) {
    $unclosed = $stack.Pop()
    Write-Host "Unclosed '{' opened at line $($unclosed.StartLine), col $($unclosed.StartColumn)"
}
