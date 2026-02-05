# Script de remplacement OMNIVERSA → Multi Convert
Write-Host ""
Write-Host "Remplacement de OMNIVERSA par Multi Convert..." -ForegroundColor Cyan
Write-Host "============================================================"
Write-Host ""

$count = 0

# Liste des fichiers à traiter
$files = @(
    "package.json",
    "start-dev.js",
    "Dockerfile",
    ".npmrc",
    "src\config\site.ts",
    "src\app\robots.ts",
    "src\app\sitemap.ts",
    "src\types\index.ts",
    "src\components\auth\AuthLayout.tsx",
    "src\components\auth\LoginForm.tsx",
    "src\components\auth\SignupForm.tsx",
    "src\components\auth\SecurityBadges.tsx",
    "src\components\auth\PasswordStrength.tsx",
    "src\components\auth\RateLimiter.tsx",
    "src\components\layout\footer.tsx",
    "src\components\sections\testimonials.tsx",
    "src\components\sections\pricing.tsx",
    "src\app\[locale]\login\page.tsx",
    "src\app\[locale]\signup\page.tsx",
    "src\app\[locale]\forgot-password\page.tsx",
    "src\app\[locale]\verify-email\page.tsx",
    "src\app\[locale]\admin\layout.tsx",
    "src\app\[locale]\dashboard\history\page.tsx",
    "src\app\[locale]\dashboard\api-keys\page.tsx",
    "src\app\[locale]\images\page.tsx",
    "src\app\[locale]\documentation\page.tsx",
    "src\app\[locale]\features\page.tsx"
)

foreach($filePath in $files) {
    $fullPath = Join-Path $PSScriptRoot $filePath
    
    if(Test-Path $fullPath) {
        try {
            $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
            $original = $content
            
            $content = $content -replace 'OMNIVERSA', 'Multi Convert'
            $content = $content -replace 'Omniversa', 'Multi Convert'
            $content = $content -replace 'omniversa', 'multi-convert'
            
            if($content -ne $original) {
                [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
                Write-Host "  OK $filePath" -ForegroundColor Green
                $count++
            }
        } catch {
            Write-Host "  ERREUR $filePath" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "============================================================"
Write-Host "Termine! $count fichiers modifies" -ForegroundColor Green
Write-Host ""
