# Script PowerShell pour démarrer l'environnement de développement

Write-Host "🚀 Starting Faceless Pipeline Microservices..." -ForegroundColor Cyan

# Vérifier que Docker est lancé
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green

# Vérifier que le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Please edit it with your API keys." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Démarrer les services
Write-Host "`n📦 Starting all services..." -ForegroundColor Cyan
docker-compose -f docker-compose.microservices.yml up -d

# Attendre que les services soient prêts
Write-Host "`n⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier la santé des services
Write-Host "`n🏥 Checking service health..." -ForegroundColor Cyan

$services = @(
    @{Name="API Gateway"; Port=3000},
    @{Name="Orchestrator"; Port=3001},
    @{Name="Keyword Fetcher"; Port=3002},
    @{Name="Script Generator"; Port=3003},
    @{Name="TTS Renderer"; Port=3004},
    @{Name="Video Assembler"; Port=3005},
    @{Name="Thumbnail Maker"; Port=3006},
    @{Name="Metadata Builder"; Port=3007},
    @{Name="Uploader"; Port=3008},
    @{Name="AB Tester"; Port=3009}
)

$allHealthy = $true

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ $($service.Name) is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ $($service.Name) is not responding" -ForegroundColor Red
        $allHealthy = $false
    }
}

# Résumé
Write-Host "`n" -NoNewline
if ($allHealthy) {
    Write-Host "🎉 All services are running!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some services are not healthy. Check logs with:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.microservices.yml logs -f" -ForegroundColor White
}

Write-Host "`n📍 Access points:" -ForegroundColor Cyan
Write-Host "  • API Gateway:       http://localhost:3000" -ForegroundColor White
Write-Host "  • RabbitMQ UI:       http://localhost:15672 (admin/admin123)" -ForegroundColor White
Write-Host "  • MinIO Console:     http://localhost:9001 (minioadmin/minioadmin123)" -ForegroundColor White

Write-Host "`n📚 Quick commands:" -ForegroundColor Cyan
Write-Host "  • View logs:         docker-compose -f docker-compose.microservices.yml logs -f" -ForegroundColor White
Write-Host "  • Stop services:     docker-compose -f docker-compose.microservices.yml down" -ForegroundColor White
Write-Host "  • Restart service:   docker-compose -f docker-compose.microservices.yml restart <service-name>" -ForegroundColor White

Write-Host "`n✨ Ready to go!" -ForegroundColor Green

