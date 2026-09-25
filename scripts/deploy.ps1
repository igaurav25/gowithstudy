# ==============================================================================
# CampusFlow — Windows PowerShell Production Deployment Script
# ==============================================================================
# Run as: .\scripts\deploy.ps1 -Env "prod"
# ==============================================================================
param (
    [string]$Env = "prod"
)

$ErrorActionPreference = "Stop"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "    🚀 CampusFlow Deployment Manager ($Env)           " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Determine Compose & Env files
if ($Env -eq "prod") {
    $ComposeFile = "docker-compose.prod.yml"
    $EnvFile = ".env.production"
} else {
    $ComposeFile = "docker-compose.yml"
    $EnvFile = ".env"
}

# 2. Pre-flight Checks
Write-Host "[INFO] Checking Docker prerequisites..." -ForegroundColor Blue
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not available in PATH. Please install Docker Desktop."
}

if (-not (Test-Path $ComposeFile)) {
    Write-Error "Compose configuration file '$ComposeFile' not found."
}

# 3. Build Web Image
Write-Host "[INFO] Building CampusFlow container images..." -ForegroundColor Blue
if (Test-Path $EnvFile) {
    docker compose --env-file $EnvFile -f $ComposeFile build web
} else {
    Write-Host "[WARN] No $EnvFile found; using default compose environment variables." -ForegroundColor Yellow
    docker compose -f $ComposeFile build web
}

# 4. Start Database & Cache
Write-Host "[INFO] Starting database and cache infrastructure..." -ForegroundColor Blue
if (Test-Path $EnvFile) {
    docker compose --env-file $EnvFile -f $ComposeFile up -d db redis
} else {
    docker compose -f $ComposeFile up -d db redis
}

# Wait for DB to stabilize
Write-Host "[INFO] Waiting 8 seconds for database initialization..." -ForegroundColor Blue
Start-Sleep -Seconds 8

# 5. Run Prisma Migrations
Write-Host "[INFO] Deploying Prisma database schema migrations..." -ForegroundColor Blue
if (Test-Path $EnvFile) {
    docker compose --env-file $EnvFile -f $ComposeFile run --rm web npx prisma migrate deploy
} else {
    docker compose -f $ComposeFile run --rm web npx prisma migrate deploy
}

# 6. Start Application & Proxy
Write-Host "[INFO] Launching CampusFlow web service and reverse proxy..." -ForegroundColor Blue
if (Test-Path $EnvFile) {
    docker compose --env-file $EnvFile -f $ComposeFile up -d --remove-orphans
} else {
    docker compose -f $ComposeFile up -d --remove-orphans
}

# 7. Check status
Write-Host "======================================================" -ForegroundColor Green
Write-Host "[SUCCESS] CampusFlow service stack is active!         " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
docker compose -f $ComposeFile ps
