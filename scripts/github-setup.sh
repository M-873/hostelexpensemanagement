#!/bin/bash

# GitHub Repository Setup Script
# This script helps you create and push your Hostel Expense Management project to GitHub

echo -e "\033[32m🚀 GitHub Repository Setup for Hostel Expense Management\033[0m"
echo -e "\033[32m=======================================================\033[0m"
echo ""

# Check if git is available
echo -e "\033[33mChecking Git installation...\033[0m"
if ! command -v git &> /dev/null; then
    echo -e "\033[31m❌ Git is not installed. Please install Git first.\033[0m"
    exit 1
fi
GIT_VERSION=$(git --version)
echo -e "\033[32m✅ Git is installed: $GIT_VERSION\033[0m"

# Get current repository status
echo ""
echo -e "\033[33mCurrent Git Status:\033[0m"
git status

# Check if remote already exists
echo ""
echo -e "\033[33mChecking existing remotes...\033[0m"
if git remote -v | grep -q origin; then
    echo -e "\033[36mExisting remotes:\033[0m"
    git remote -v
    echo ""
    read -p "Remote already exists. Do you want to remove it and set up a new one? (y/n) " response
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        git remote remove origin
        echo -e "\033[32m✅ Removed existing remote\033[0m"
    else
        echo -e "\033[33mUsing existing remote. Skipping remote setup.\033[0m"
    fi
else
    echo -e "\033[32mNo existing remotes found.\033[0m"
fi

# Repository setup
echo ""
echo -e "\033[32mGitHub Repository Setup\033[0m"
echo -e "\033[32m======================\033[0m"
echo ""

read -p "Enter your GitHub username (or press Enter to use M-873): " username
if [[ -z "$username" ]]; then
    username="M-873"
fi

read -p "Enter repository name (or press Enter to use 'hostel-expense-management'): " repoName
if [[ -z "$repoName" ]]; then
    repoName="hostel-expense-management"
fi

read -p "Enter repository description (optional): " repoDescription

# Create repository URL
repoUrl="https://github.com/$username/$repoName.git"

echo ""
echo -e "\033[36mRepository Details:\033[0m"
echo -e "\033[36mUsername: $username\033[0m"
echo -e "\033[36mRepository: $repoName\033[0m"
echo -e "\033[36mURL: $repoUrl\033[0m"
if [[ -n "$repoDescription" ]]; then
    echo -e "\033[36mDescription: $repoDescription\033[0m"
fi

echo ""
read -p "Do you want to add this remote and push? (y/n) " response

if [[ "$response" == "y" || "$response" == "Y" ]]; then
    # Add remote
    echo ""
    echo -e "\033[33mAdding remote repository...\033[0m"
    git remote add origin "$repoUrl"
    
    if [[ $? -eq 0 ]]; then
        echo -e "\033[32m✅ Remote added successfully!\033[0m"
        
        # Push to GitHub
        echo ""
        echo -e "\033[33mPushing to GitHub...\033[0m"
        
        # Try to push, if it fails, it might be because the repo doesn't exist
        git push -u origin master
        
        if [[ $? -eq 0 ]]; then
            echo -e "\033[32m✅ Successfully pushed to GitHub!\033[0m"
            echo -e "\033[32mRepository URL: https://github.com/$username/$repoName\033[0m"
        else
            echo -e "\033[31m❌ Push failed.\033[0m"
            echo -e "\033[31mThis might be because:\033[0m"
            echo -e "\033[31m1. The repository doesn't exist on GitHub\033[0m"
            echo -e "\033[31m2. You don't have permission to push\033[0m"
            echo -e "\033[31m3. Authentication issues\033[0m"
            echo ""
            echo -e "\033[33mTo fix this:\033[0m"
            echo -e "\033[33m1. Create the repository on GitHub first at: https://github.com/new\033[0m"
            echo -e "\033[33m2. Make sure you're logged in to GitHub\033[0m"
            echo -e "\033[33m3. Check your GitHub authentication (use GitHub CLI or personal access token)\033[0m"
        fi
    else
        echo -e "\033[31m❌ Failed to add remote\033[0m"
    fi
else
    echo -e "\033[33mSetup cancelled.\033[0m"
fi

echo ""
echo -e "\033[32mSetup complete!\033[0m"