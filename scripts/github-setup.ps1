# GitHub Repository Setup Script
# This script helps you create and push your Hostel Expense Management project to GitHub

Write-Host "🚀 GitHub Repository Setup for Hostel Expense Management" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""

# Check if git is available
Write-Host "Checking Git installation..." -ForegroundColor Yellow
$gitCheck = git --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git is installed: $gitCheck" -ForegroundColor Green

# Get current repository status
Write-Host ""
Write-Host "Current Git Status:" -ForegroundColor Yellow
git status

# Check if remote already exists
Write-Host ""
Write-Host "Checking existing remotes..." -ForegroundColor Yellow
$remotes = git remote -v
if ($remotes) {
    Write-Host "Existing remotes:" -ForegroundColor Cyan
    Write-Host $remotes
    Write-Host ""
    $response = Read-Host "Remote already exists. Do you want to remove it and set up a new one? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        git remote remove origin
        Write-Host "✅ Removed existing remote" -ForegroundColor Green
    } else {
        Write-Host "Using existing remote. Skipping remote setup." -ForegroundColor Yellow
    }
} else {
    Write-Host "No existing remotes found." -ForegroundColor Green
}

# Repository setup
Write-Host ""
Write-Host "GitHub Repository Setup" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""

$username = Read-Host "Enter your GitHub username (or press Enter to use M-873)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "M-873"
}

$repoName = Read-Host "Enter repository name (or press Enter to use 'hostel-expense-management')"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "hostel-expense-management"
}

$repoDescription = Read-Host "Enter repository description (optional)"

# Create repository URL
$repoUrl = "https://github.com/$username/$repoName.git"

Write-Host ""
Write-Host "Repository Details:" -ForegroundColor Cyan
Write-Host "Username: $username" -ForegroundColor Cyan
Write-Host "Repository: $repoName" -ForegroundColor Cyan
Write-Host "URL: $repoUrl" -ForegroundColor Cyan
if ($repoDescription) {
    Write-Host "Description: $repoDescription" -ForegroundColor Cyan
}

Write-Host ""
$response = Read-Host "Do you want to add this remote and push? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    # Add remote
    Write-Host ""
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Remote added successfully!" -ForegroundColor Green
        
        # Push to GitHub
        Write-Host ""
        Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
        
        # Try to push, if it fails, it might be because the repo doesn't exist
        git push -u origin master
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
            Write-Host "Repository URL: https://github.com/$username/$repoName" -ForegroundColor Green
        } else {
            Write-Host "❌ Push failed." -ForegroundColor Red
            Write-Host "This might be because:" -ForegroundColor Red
            Write-Host "1. The repository doesn't exist on GitHub" -ForegroundColor Red
            Write-Host "2. You don't have permission to push" -ForegroundColor Red
            Write-Host "3. Authentication issues" -ForegroundColor Red
            Write-Host ""
            Write-Host "To fix this:" -ForegroundColor Yellow
            Write-Host "1. Create the repository on GitHub first at: https://github.com/new" -ForegroundColor Yellow
            Write-Host "2. Make sure you're logged in to GitHub" -ForegroundColor Yellow
            Write-Host "3. Check your GitHub authentication (use GitHub CLI or personal access token)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Failed to add remote" -ForegroundColor Red
    }
} else {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green