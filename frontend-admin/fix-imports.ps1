# Script pour corriger tous les imports dans les use cases

$useCasesPath = "src/app/core/application/use-cases"

# Trouver tous les fichiers TypeScript dans les use cases
$files = Get-ChildItem -Path $useCasesPath -Recurse -Filter "*.ts" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remplacer les imports incorrects
    $content = $content -replace "from '../../entities/", "from '../../../domain/entities/"
    $content = $content -replace "from '../../repositories/", "from '../../../domain/repositories/"
    
    # Sauvegarder le fichier
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "Fixed: $($file.FullName)"
}

Write-Host "`nAll use case imports have been fixed!"
