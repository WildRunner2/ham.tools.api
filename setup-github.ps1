# Script to connect local repository to GitHub remote
# SP3FCK Ham Tools API - GitHub Setup Script

Write-Host "🔗 Connecting local repository to GitHub..." -ForegroundColor Green
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a git repository. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Check current remotes
Write-Host "📋 Current remotes:" -ForegroundColor Cyan
git remote -v

# Add the GitHub remote (if it doesn't exist)
$remoteUrl = "https://github.com/WildRunner2/ham.tools.api.git"
$remoteName = "origin"

Write-Host ""
Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Cyan

# Remove existing origin if it exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠️  Existing remote 'origin' found: $existingRemote" -ForegroundColor Yellow
    Write-Host "🔄 Removing existing remote..." -ForegroundColor Yellow
    git remote remove origin
}

# Add new remote
git remote add origin $remoteUrl
Write-Host "✅ Added remote: $remoteUrl" -ForegroundColor Green

# Verify the remote was added
Write-Host ""
Write-Host "📋 Updated remotes:" -ForegroundColor Cyan
git remote -v

# Check if there are any commits
$hasCommits = git rev-parse HEAD 2>$null
if (-not $hasCommits) {
    Write-Host ""
    Write-Host "📝 No commits found. Creating initial commit..." -ForegroundColor Yellow
    
    # Create .gitignore if it doesn't exist
    if (-not (Test-Path ".gitignore")) {
        Write-Host "📄 Creating .gitignore..." -ForegroundColor Cyan
        @"
# Environment variables
.env
.env.local
.env.production

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.output/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Wrangler
.wrangler/

# Cloudflare
wrangler.toml.bak
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-Host "✅ .gitignore created" -ForegroundColor Green
    }
    
    # Stage all files
    git add .
    
    # Create initial commit
    git commit -m "Initial commit: SP3FCK Ham Tools API with Cloudflare D1

- Node.js TypeScript API for ham radio photo management
- Cloudflare Workers + D1 SQLite database architecture
- JWT authentication with callsign validation
- Photo management with tagging system
- QRZ.com iframe gallery integration
- Complete API endpoints for auth, photos, and iframe generation
- Database schema with sample data
- Ready for Cloudflare Workers deployment

Features:
✅ User registration/login with amateur radio callsign validation
✅ Photo upload and management system
✅ Public/private photo visibility controls
✅ Tag-based photo organization
✅ Embeddable iframe galleries for QRZ.com profiles
✅ Responsive gallery with autoplay and controls
✅ CORS support for frontend integration
✅ Comprehensive input validation
✅ Type-safe database operations

Tech Stack: TypeScript, Cloudflare Workers, D1 SQLite, JWT, bcrypt, Joi, Cloudinary

73! SP3FCK"
    
    Write-Host "✅ Initial commit created" -ForegroundColor Green
}

# Check if GitHub repo exists and has content
Write-Host ""
Write-Host "🔍 Checking GitHub repository..." -ForegroundColor Cyan

try {
    $remoteRefs = git ls-remote origin 2>$null
    if ($remoteRefs) {
        Write-Host "📦 GitHub repository exists and has content" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔄 Fetching from remote..." -ForegroundColor Cyan
        git fetch origin
        
        # Check if main branch exists on remote
        $hasMainBranch = git ls-remote --heads origin main 2>$null
        $hasMasterBranch = git ls-remote --heads origin master 2>$null
        
        if ($hasMainBranch) {
            Write-Host "📋 Remote has 'main' branch" -ForegroundColor Green
            $remoteBranch = "main"
        } elseif ($hasMasterBranch) {
            Write-Host "📋 Remote has 'master' branch" -ForegroundColor Green
            $remoteBranch = "master"
        } else {
            Write-Host "⚠️  No main/master branch found on remote" -ForegroundColor Yellow
            $remoteBranch = "main"
        }
        
        # Set up tracking
        $currentBranch = git branch --show-current
        if (-not $currentBranch) {
            git checkout -b main
            $currentBranch = "main"
        }
        
        Write-Host "🔗 Setting up branch tracking..." -ForegroundColor Cyan
        git branch --set-upstream-to=origin/$remoteBranch $currentBranch
        
        Write-Host ""
        Write-Host "🚀 Ready to push/pull!" -ForegroundColor Green
        Write-Host "   To push: git push origin $currentBranch" -ForegroundColor Cyan
        Write-Host "   To pull: git pull origin $remoteBranch" -ForegroundColor Cyan
        
    } else {
        Write-Host "📦 GitHub repository is empty" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🚀 Ready for initial push!" -ForegroundColor Green
        Write-Host "   Run: git push -u origin main" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Could not access GitHub repository" -ForegroundColor Yellow
    Write-Host "   Make sure the repository exists and you have access" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Git Status:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "✅ Repository connection setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review your changes: git status" -ForegroundColor Cyan
Write-Host "2. Add any remaining files: git add ." -ForegroundColor Cyan
Write-Host "3. Commit changes: git commit -m 'Your message'" -ForegroundColor Cyan
Write-Host "4. Push to GitHub: git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Happy coding! 73! - SP3FCK" -ForegroundColor Green
