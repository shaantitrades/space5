# Script de remplacement OMNIVERSA → Multi Convert
Write-Host "`n🔄 Remplacement de OMNIVERSA par Multi Convert..." -ForegroundColor Cyan
Write-Host ("=" * 60)

$count = 0
$totalFiles = 0

$patterns = @('*.tsx', '*.ts', '*.jsx', '*.js', '*.json', '*.md', '*.txt', '*.yml', '*.yaml', '*.ps1', '*.sh', '*.bat')
$excludeDirs = @('node_modules', '.next', 'dist', 'build', '.git')

Get-ChildItem -Path . -Recurse -Include $patterns | Where-Object {
    $path = $_.FullName
    $exclude = $false
    foreach($dir in $excludeDirs) {
        if($path -like "*\$dir\*" -or $path -like "*/$dir/*") {
            $exclude = $true
            break
        }
    }
    -not $exclude
} | ForEach-Object {
    $file = $_
    $totalFiles++
    
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $originalContent = $content
        
        # Remplacements (ordre important)
        $content = $content -replace 'OMNIVERSA', 'Multi Convert'
        $content = $content -replace 'Omniversa', 'Multi Convert'
        $content = $content -replace 'omniversa', 'multi-convert'
        
        if($content -ne $originalContent) {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            $count++
            Write-Host "  ✓ $($file.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✗ Erreur: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "✅ Remplacement terminé!" -ForegroundColor Green
Write-Host "📊 $count fichiers modifiés sur $totalFiles fichiers analysés" -ForegroundColor Cyan
Write-Host "`n"
