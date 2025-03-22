import os
import sys
import asyncio
import nest_asyncio
import time
import threading
import logging
from pathlib import Path

# Configure asyncio event loop before any other imports
if sys.platform == 'darwin':  # macOS
    asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())
    # Create a new event loop
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    # Apply nest_asyncio to allow nested event loops
    try:
        nest_asyncio.apply()
    except RuntimeError:
        # If already applied or another error, just continue
        pass

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the API app
from api import app as api_app

# Create a directory for static files if it doesn't exist
os.makedirs("app/static", exist_ok=True)

# Mount static files to serve widgets
api_app.mount("/widgets", StaticFiles(directory="app/static"), name="widgets")

# Add CORS middleware to allow your website to use these endpoints
api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Content-Length"],  # Explicitly expose these headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Startup event handler
@api_app.on_event("startup")
async def startup_event():
    print("Initializing server and pre-warming models...")
    
    # Start a background thread for initialization to avoid blocking startup
    def initialize_in_background():
        # Give the server time to start up completely
        time.sleep(3)
        print("Starting background model warmup...")
        
        try:
            # Import and use the warmup status check
            from app.utils.initialize import initialize_system, get_warmup_status
            
            # Check if already warming up
            status = get_warmup_status()
            if status["status"] == "warming_up":
                print("Models are already being warmed up. Skipping duplicate warmup.")
                return
            elif status["status"] == "ready":
                print("Models are already warm. Skipping warmup.")
                return
                
            # Initialize the system with warmup_only=True
            initialize_system(warmup_only=True)
        except Exception as e:
            print(f"Error during background initialization: {e}")
    
    # Start initialization in a separate thread
    threading.Thread(target=initialize_in_background, daemon=True).start()

if __name__ == "__main__":
    # Check if the required .env variables are set
    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")
    deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
    
    if not admin_username or admin_username == "admin":
        print("WARNING: Using default admin username. Set ADMIN_USERNAME in .env for production.")
    
    if not admin_password or admin_password == "changeme":
        print("WARNING: Using default admin password. Set ADMIN_PASSWORD in .env for production.")
    
    if not deepseek_api_key:
        print("ERROR: DeepSeek API key not set. Please set DEEPSEEK_API_KEY in .env file.")
        sys.exit(1)
    
    print("\n=== Change Management Assistant Server ===")
    print("API will be available at: http://localhost:8000")
    print("Widgets will be available at: http://localhost:8000/widgets")
    print("Demo page: http://localhost:8000/widgets/index.html")
    print("=======================================\n")
    
    # Run the server
    uvicorn.run(api_app, host="0.0.0.0", port=8000) 