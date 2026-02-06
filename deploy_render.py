import requests
import json
import os

def deploy_to_render():
    """Deploy backend to Render using their API"""
    
    # Render API configuration
    api_key = "rnd_9YIP45FPmGSo0aObD9Sug8lohnP6"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Service configuration
    service_config = {
        "type": "web_service",
        "name": "hostel-expense-management-backend",
        "env": "node",
        "buildCommand": "npm install && npm run build",
        "startCommand": "npm start",
        "serviceDetails": {
            "envSpecificDetails": {
                "buildCommand": "npm install && npm run build",
                "startCommand": "npm start"
            }
        },
        "envVars": [
            {"key": "NODE_ENV", "value": "production"},
            {"key": "PORT", "value": "3001"},
            {"key": "FRONTEND_URL", "value": "https://hostelexpensemanagement1.vercel.app"},
            {"key": "JWT_SECRET", "value": "hostel-expense-management-super-secret-key-2024"},
            {"key": "JWT_EXPIRES_IN", "value": "7d"},
            {"key": "DATA_RETENTION_DAYS", "value": "90"},
            {"key": "CLEANUP_INTERVAL_HOURS", "value": "24"},
            {"key": "EMAIL_HOST", "value": "smtp.gmail.com"},
            {"key": "EMAIL_PORT", "value": "587"},
            {"key": "GOOGLE_CLIENT_ID", "value": "123456789-placeholder.apps.googleusercontent.com"}
        ]
    }
    
    print("🚀 Starting deployment to Render...")
    print(f"Service: {service_config['name']}")
    print(f"Environment: {service_config['env']}")
    
    # Note: This is a simplified example. 
    # For actual deployment, you would need to:
    # 1. Create a new service via Render dashboard
    # 2. Connect your GitHub repository
    # 3. Configure environment variables
    # 4. Deploy
    
    print("\n📋 Deployment Configuration:")
    print(json.dumps(service_config, indent=2))
    
    print("\n📝 Manual Deployment Steps:")
    print("1. Go to https://dashboard.render.com")
    print("2. Click 'New' → 'Web Service'")
    print("3. Connect GitHub repository: M-873/hostelexpensemanagement")
    print("4. Configure with the settings above")
    print("5. Add environment variables")
    print("6. Click 'Create Web Service'")
    
    print("\n✅ Backend deployment configuration ready!")
    print("🎯 Expected URL: https://hostel-expense-management-backend.onrender.com")
    
    return service_config

if __name__ == "__main__":
    deploy_to_render()