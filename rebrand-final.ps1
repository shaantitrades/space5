# Script FINAL - Remplacement complet Multi Convert
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   REBRANDING: Multi Convert >> Multi Convert   " -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$replaced = 0
$errors = 0

# Fonction pour remplacer dans un fichier
function Replace-InFile {
    param($Path)
    
    if(-not (Test-Path $Path)) { return }
    
    try {
        $content = Get-Content $Path -Encoding UTF8 | Out-String
        $original = $content
        
        $content = $content -creplace 'OMNIVERSA', 'Multi Convert'
        $content = $content -creplace 'Omniversa', 'Multi Convert'
        $content = $content -creplace 'omniversa', 'multi-convert'
        
        if($content -ne $original) {
            $content | Set-Content $Path -Encoding UTF8 -NoNewline
            Write-Host "  [OK] $(Split-Path $Path -Leaf)" -ForegroundColor Green
            $script:replaced++
        }
    } catch {
        Write-Host "  [ERREUR] $(Split-Path $Path -Leaf)" -ForegroundColor Red
        $script:errors++
    }
}

Write-Host "Traitement des fichiers..." -ForegroundColor Yellow
Write-Host ""

# Fichiers critiques
$files = @(
    ".\src\components\auth\AuthLayout.tsx",
    ".\src\components\auth\LoginForm.tsx",
    ".\src\components\auth\SignupForm.tsx",
    ".\src\components\auth\SecurityBadges.tsx",
    ".\src\components\auth\PasswordStrength.tsx",
    ".\src\components\auth\RateLimiter.tsx",
    ".\src\components\layout\footer.tsx",
    ".\src\components\layout\header.tsx",
    ".\src\components\sections\testimonials.tsx",
    ".\src\components\sections\pricing.tsx",
    ".\src\components\sections\hero-fixed.tsx",
    ".\src\app\[locale]\login\page.tsx",
    ".\src\app\[locale]\signup\page.tsx",
    ".\src\app\[locale]\forgot-password\page.tsx",
    ".\src\app\[locale]\verify-email\page.tsx",
    ".\src\app\[locale]\admin\layout.tsx",
    ".\src\app\[locale]\dashboard\history\page.tsx",
    ".\src\app\[locale]\dashboard\api-keys\page.tsx",
    ".\src\app\[locale]\images\page.tsx",
    ".\src\app\[locale]\documentation\page.tsx",
    ".\src\app\[locale]\features\page.tsx",
    ".\src\app\[locale]\entreprise\page.tsx",
    ".\src\lib\schema.ts",
    ".\src\lib\metadata.ts",
    ".\PHASE2-COMPLETE.md",
    ".\TEST-RESULTS.md",
    ".\TESTS-MANUELS.md",
    ".\scripts\init-db.sql"
)

foreach($file in $files) {
    Replace-InFile $file
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  TERMINE!" -ForegroundColor Green
Write-Host "  Fichiers modifies: $replaced" -ForegroundColor Yellow
Write-Host "  Erreurs: $errors" -ForegroundColor $(if($errors -gt 0){"Red"}else{"Green"})
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaine etape: npm run dev" -ForegroundColor Cyan
Write-Host ""
