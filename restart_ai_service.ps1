# PowerShell script to restart AI service
Write-Host "Restarting AI Service for CV Analysis improvements..." -ForegroundColor Green

# Change to AI directory
Set-Location "d:\2024-2025_HKI\TLCN\JobPortal_Project\AI"

# Kill any existing Python processes running the service
Write-Host "Stopping existing AI service processes..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*Re.py*" } | Stop-Process -Force

# Wait a moment for cleanup
Start-Sleep -Seconds 2

# Start the AI service
Write-Host "Starting AI service with updated CV analysis..." -ForegroundColor Yellow
Start-Process -FilePath "python" -ArgumentList "Re.py" -WindowStyle Normal

Write-Host "AI Service restarted successfully!" -ForegroundColor Green
Write-Host "The service now includes improved Nice-to-Have vs Required skills analysis" -ForegroundColor Cyan
