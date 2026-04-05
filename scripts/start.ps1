$root = Split-Path -Parent $PSScriptRoot
$backendModules = Join-Path $root "backend\node_modules"
$frontendModules = Join-Path $root "frontend\node_modules"

if (-not (Test-Path $backendModules) -or -not (Test-Path $frontendModules)) {
  Write-Host "Dependencies are missing. Run 'npm run install:all' first." -ForegroundColor Red
  exit 1
}

$backendJob = Start-Job -Name "student-course-backend" -ScriptBlock {
  param($projectRoot)
  Set-Location -LiteralPath $projectRoot
  npm --prefix backend run dev
} -ArgumentList $root

Write-Host "Starting backend in the background..." -ForegroundColor Cyan

$backendReady = $false

for ($attempt = 1; $attempt -le 20; $attempt++) {
  Start-Sleep -Milliseconds 500

  try {
    $response = Invoke-WebRequest -UseBasicParsing "http://localhost:5000/api/health" -TimeoutSec 2

    if ($response.StatusCode -eq 200) {
      $backendReady = $true
      break
    }
  }
  catch {
  }
}

if ($backendReady) {
  Write-Host "Backend is ready on http://localhost:5000." -ForegroundColor Green
} else {
  Write-Host "Backend is still starting. The app may show errors until it finishes connecting." -ForegroundColor Yellow
}

Write-Host "Starting frontend in this window..." -ForegroundColor Cyan

try {
  Set-Location -LiteralPath $root
  npm --prefix frontend start
}
finally {
  if ($backendJob) {
    Stop-Job $backendJob -ErrorAction SilentlyContinue | Out-Null
    Remove-Job $backendJob -Force -ErrorAction SilentlyContinue
  }
}
