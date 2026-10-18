$redirects = @{
    "src\app\onboarding\page.tsx" = "/dashboard.html"
    "src\app\dashboard\budget\page.tsx" = "/budget.html"
    "src\app\dashboard\laporan\page.tsx" = "/laporan.html"
    "src\app\dashboard\settings\page.tsx" = "/settings.html"
    "src\app\dashboard\transaksi\page.tsx" = "/dashboard.html"
    "src\app\dashboard\wallet\page.tsx" = "/wallet.html"
    "src\app\admin\ai-providers\page.tsx" = "/admin.html"
    "src\app\admin\logs\page.tsx" = "/admin.html"
    "src\app\admin\payments\page.tsx" = "/admin.html"
    "src\app\admin\transactions\page.tsx" = "/admin.html"
    "src\app\admin\users\page.tsx" = "/admin.html"
}

$base = "C:\Users\RIZKY MUHAMMAD RIADY\.gemini\antigravity\scratch\tatadana"
foreach ($k in $redirects.Keys) {
    $dest = $redirects[$k]
    $full = Join-Path $base $k
    $code = @"
import { redirect } from 'next/navigation';

export default function RedirectPage() {
  redirect('$dest');
}
"@
    [System.IO.File]::WriteAllText($full, $code, [System.Text.Encoding]::UTF8)
    Write-Host "Updated $k -> $dest"
}
