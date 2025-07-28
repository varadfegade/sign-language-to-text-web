#!/bin/bash

# Sign Language Converter Deployment Script
# This script helps deploy the application to various platforms

echo "🚀 Sign Language Converter Deployment Helper"
echo "============================================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "📋 Available deployment options:"
echo "1. Deploy to Render (recommended)"
echo "2. Deploy to Netlify"  
echo "3. Deploy to GitHub Pages"
echo "4. Create deployment ZIP"
echo "5. Exit"

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo "🌐 Deploying to Render..."
        echo "1. Make sure your code is committed to Git"
        echo "2. Push to GitHub: git push origin main"
        echo "3. Go to https://render.com"
        echo "4. Click 'New' → 'Static Site'"
        echo "5. Connect your GitHub repository"
        echo "6. Use these settings:"
        echo "   - Build Command: echo 'No build required'"
        echo "   - Publish Directory: ."
        echo "7. Click 'Create Static Site'"
        ;;
    2)
        echo "🟢 Deploying to Netlify..."
        echo "1. Go to https://netlify.com"
        echo "2. Drag and drop this folder to deploy"
        echo "3. Or connect your GitHub repository"
        ;;
    3)
        echo "📚 Deploying to GitHub Pages..."
        echo "1. Make sure your repository is public"
        echo "2. Go to Settings → Pages"
        echo "3. Select source: Deploy from a branch"
        echo "4. Choose branch: main"
        echo "5. Folder: / (root)"
        ;;
    4)
        echo "📦 Creating deployment ZIP..."
        zip -r sign-language-converter-deployment.zip . -x "*.git*" "deploy.sh" "*.DS_Store"
        echo "✅ Created: sign-language-converter-deployment.zip"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-5."
        ;;
esac

echo ""
echo "📝 For more deployment options, check README.md"
echo "🔗 Documentation: https://github.com/your-username/sign-language-converter"
