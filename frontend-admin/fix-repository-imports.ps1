# Script pour corriger les imports dans les repositories d'infrastructure

$repositoriesPath = "src/app/infrastructure/repositories"

# Trouver tous les fichiers TypeScript dans les repositories
$files = Get-ChildItem -Path $repositoriesPath -Filter "*.ts" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remplacer les imports incorrects
    $content = $content -replace "from '../../domain/entities/", "from '../../core/domain/entities/"
    $content = $content -replace "from '../../domain/repositories/", "from '../../core/domain/repositories/"
    
    # Sauvegarder le fichier
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "Fixed: $($file.FullName)"
}

Write-Host "`nAll repository imports have been fixed!"
