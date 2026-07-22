#!/usr/bin/env pwsh
# Rebuild rapido do Mendez Tech Hub no Docker.
# Cache de layers: `deps` so reinstala quando frontend/package*.json muda,
# entao mudancas em content/ ou codigo reconstroem em segundos.
#
# Uso:
#   ./docker-rebuild.ps1            # rebuild (com cache) + sobe em background
#   ./docker-rebuild.ps1 -NoCache   # rebuild limpo, ignora cache
#   ./docker-rebuild.ps1 -Logs      # rebuild + sobe + segue os logs
param(
  [switch]$NoCache,
  [switch]$Logs
)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$build = @("compose", "build")
if ($NoCache) { $build += "--no-cache" }

Write-Host "==> docker $($build -join ' ')" -ForegroundColor Cyan
& docker @build
if ($LASTEXITCODE -ne 0) { throw "docker build falhou (exit $LASTEXITCODE)" }

Write-Host "==> docker compose up -d" -ForegroundColor Cyan
& docker compose up -d
if ($LASTEXITCODE -ne 0) { throw "docker compose up falhou (exit $LASTEXITCODE)" }

Write-Host "==> pronto -> http://localhost:3000" -ForegroundColor Green
if ($Logs) { & docker compose logs -f }
