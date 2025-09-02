# Script to connect local repository to GitHub remote
# SP3FCK Ham Tools API - GitHub Setup Script

Write-Host "Connecting local repository to GitHub..." -ForegroundColor Green
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Not in a git repository. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "Git repository initialized" -ForegroundColor Green
}

# Check current remotes
Write-Host "Current remotes:" -ForegroundColor Cyan
git remote -v

# Add the GitHub remote (if it doesn't exist)
$remoteUrl = "https://github.com/WildRunner2/ham.tools.api.git"

Write-Host ""
Write-Host "Adding GitHub remote..." -ForegroundColor Cyan

# Remove existing origin if it exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Existing remote 'origin' found. Removing..." -ForegroundColor Yellow
    git remote remove origin
}

# Add new remote
git remote add origin $remoteUrl
Write-Host "Added remote: $remoteUrl" -ForegroundColor Green

# Verify the remote was added
Write-Host ""
Write-Host "Updated remotes:" -ForegroundColor Cyan
git remote -v

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore..." -ForegroundColor Cyan
    $gitignoreContent = @"
# Environment variables
.env
.env.local
.env.production

# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
build/
.output/

# IDEs
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Wrangler
.wrangler/
"@
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host ".gitignore created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Repository connection setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. git add ." -ForegroundColor Cyan
Write-Host "2. git commit -m 'Initial commit'" -ForegroundColor Cyan
Write-Host "3. git push -u origin main" -ForegroundColor Cyan
