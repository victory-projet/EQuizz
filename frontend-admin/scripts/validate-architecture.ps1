# Script de validation de l'architecture Clean Architecture
# Vérifie que les règles de dépendances sont respectées

Write-Host "🔍 Validation de l'architecture Clean Architecture..." -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Fonction pour vérifier les imports interdits
function Test-ForbiddenImports {
    param(
        [string]$Path,
        [string[]]$ForbiddenPatterns,
        [string]$LayerName
    )
    
    $files = Get-ChildItem -Path $Path -Filter "*.ts" -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        
        foreach ($pattern in $ForbiddenPatterns) {
            if ($content -match $pattern) {
                Write-Host "❌ ERREUR: $LayerName ne doit pas importer $pattern" -ForegroundColor Red
                Write-Host "   Fichier: $($file.FullName)" -ForegroundColor Yellow
                $script:errors++
            }
        }
    }
}

# Fonction pour vérifier les imports recommandés
function Test-RecommendedImports {
    param(
        [string]$Path,
        [string]$LayerName
    )
    
    $files = Get-ChildItem -Path $Path -Filter "*.ts" -Recurse -ErrorAction SilentlyContinue
    $relativeImports = 0
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        
        # Vérifier les imports relatifs profonds
        if ($content -match "from ['\`"]\.\.\/\.\.\/\.\.") {
            $relativeImports++
        }
    }
    
    if ($relativeImports -gt 0) {
        Write-Host "⚠️  AVERTISSEMENT: $relativeImports fichiers dans $LayerName utilisent des imports relatifs profonds" -ForegroundColor Yellow
        Write-Host "   Recommandation: Utiliser les alias @domain, @application, @infrastructure, @presentation" -ForegroundColor Gray
        $script:warnings++
    }
}

Write-Host "📋 Vérification des règles de dépendances..." -ForegroundColor White
Write-Host ""

# 1. DOMAIN ne doit dépendre de RIEN
Write-Host "🔵 Domain Layer..." -ForegroundColor Blue
Test-ForbiddenImports `
    -Path "src/app/core/domain" `
    -ForbiddenPatterns @(
        "from ['\`"]@angular",
        "from ['\`"].*application",
        "from ['\`"].*infrastructure",
        "from ['\`"].*presentation"
    ) `
    -LayerName "Domain"

# 2. APPLICATION ne doit dépendre que du DOMAIN
Write-Host "🟢 Application Layer..." -ForegroundColor Green
Test-ForbiddenImports `
    -Path "src/app/core/application" `
    -ForbiddenPatterns @(
        "from ['\`"].*infrastructure",
        "from ['\`"].*presentation"
    ) `
    -LayerName "Application"

# 3. INFRASTRUCTURE ne doit pas dépendre de PRESENTATION
Write-Host "🟡 Infrastructure Layer..." -ForegroundColor Yellow
Test-ForbiddenImports `
    -Path "src/app/infrastructure" `
    -ForbiddenPatterns @(
        "from ['\`"].*presentation"
    ) `
    -LayerName "Infrastructure"

# 4. PRESENTATION peut dépendre de tout sauf INFRASTRUCTURE directement
Write-Host "🔴 Presentation Layer..." -ForegroundColor Red
Test-ForbiddenImports `
    -Path "src/app/presentation" `
    -ForbiddenPatterns @(
        "from ['\`"].*infrastructure/repositories",
        "from ['\`"].*infrastructure/http/.*\.interceptor"
    ) `
    -LayerName "Presentation"

Write-Host ""
Write-Host "📊 Vérification des bonnes pratiques..." -ForegroundColor White
Write-Host ""

# Vérifier l'utilisation des alias
Test-RecommendedImports -Path "src/app/core/domain" -LayerName "Domain"
Test-RecommendedImports -Path "src/app/core/application" -LayerName "Application"
Test-RecommendedImports -Path "src/app/infrastructure" -LayerName "Infrastructure"
Test-RecommendedImports -Path "src/app/presentation" -LayerName "Presentation"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📈 RÉSULTATS" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ Aucune violation détectée ! Architecture Clean respectée." -ForegroundColor Green
    exit 0
} else {
    if ($errors -gt 0) {
        Write-Host "❌ $errors erreur(s) détectée(s)" -ForegroundColor Red
    }
    if ($warnings -gt 0) {
        Write-Host "⚠️  $warnings avertissement(s)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📚 Consultez CLEAN_ARCHITECTURE.md pour plus d'informations" -ForegroundColor Gray
    
    if ($errors -gt 0) {
        exit 1
    } else {
        exit 0
    }
}
