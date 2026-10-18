$base = "C:\Users\RIZKY MUHAMMAD RIADY\.gemini\antigravity\scratch\tatadana"
$srcApp = Join-Path $base "src\app"

$routes = @{
    "" = "indexHtml"
    "dashboard" = "dashboardHtml"
    "admin" = "adminHtml"
    "login" = "loginHtml"
    "register" = "registerHtml"
    "wallet" = "walletHtml"
    "budget" = "budgetHtml"
    "laporan" = "laporanHtml"
    "settings" = "settingsHtml"
    "transaksi" = "dashboardHtml"
}

foreach ($r in $routes.Keys) {
    $dir = if ($r -eq "") { $srcApp } else { Join-Path $srcApp $r }
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force }

    # Remove conflicting page.tsx if present
    $oldPage = Join-Path $dir "page.tsx"
    if (Test-Path $oldPage) { Remove-Item $oldPage -Force }

    $varName = $routes[$r]
    $routeFile = Join-Path $dir "route.ts"
    $code = @"
import { ${varName} } from '@/lib/html-pages';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(${varName}, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
"@
    [System.IO.File]::WriteAllText($routeFile, $code, [System.Text.Encoding]::UTF8)
    Write-Host "Created route handler: $r -> $varName"
}

# Remove unused sub-pages in dashboard and admin that might conflict
$extraPages = @(
    "dashboard\budget\page.tsx",
    "dashboard\laporan\page.tsx",
    "dashboard\settings\page.tsx",
    "dashboard\transaksi\page.tsx",
    "dashboard\wallet\page.tsx",
    "admin\ai-providers\page.tsx",
    "admin\logs\page.tsx",
    "admin\payments\page.tsx",
    "admin\transactions\page.tsx",
    "admin\users\page.tsx",
    "onboarding\page.tsx"
)
foreach ($ep in $extraPages) {
    $epPath = Join-Path $srcApp $ep
    if (Test-Path $epPath) { Remove-Item $epPath -Force }
}

Write-Host "Route setup complete!"
