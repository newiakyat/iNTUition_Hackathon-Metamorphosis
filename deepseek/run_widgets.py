#!/usr/bin/env python3
"""
Change Management Widgets Launcher
---------------------------------
This script launches the FastAPI server that serves both the API
and the widget HTML files for embedding in websites.
"""
import os
import sys
import subprocess
import webbrowser
from dotenv import load_dotenv
from time import sleep

# Load environment variables from .env file
load_dotenv()

def check_env_vars():
    """Check if necessary environment variables are set."""
    missing_vars = []
    
    if not os.getenv("DEEPSEEK_API_KEY") or os.getenv("DEEPSEEK_API_KEY") == "your_deepseek_api_key_here":
        missing_vars.append("DEEPSEEK_API_KEY")
    
    if missing_vars:
        print("⚠️  Missing or invalid environment variables in .env file:")
        for var in missing_vars:
            print(f"   - {var}")
        
        if "DEEPSEEK_API_KEY" in missing_vars:
            print("\n💡 To fix: Edit the .env file and add your DeepSeek API key.")
        
        return False
    return True

def print_header():
    """Print a nice header for the application."""
    print("\033[1;36m")  # Cyan, bold
    print("="*70)
    print("               CHANGE MANAGEMENT ASSISTANT WIDGETS")
    print("                   Powered by DeepSeek & FastAPI")
    print("="*70)
    print("\033[0m")  # Reset color

def print_instructions():
    """Print usage instructions."""
    print("\033[1;33m")  # Yellow, bold
    print("📌 AVAILABLE RESOURCES:\033[0m")
    print("   🔹 API Endpoints: \033[1;34mhttp://localhost:8000/docs\033[0m")
    print("   🔹 User Widget:   \033[1;34mhttp://localhost:8000/widgets/user-widget.html\033[0m")
    print("   🔹 Admin Widget:  \033[1;34mhttp://localhost:8000/widgets/admin-widget.html\033[0m")
    print("   🔹 Demo Page:     \033[1;34mhttp://localhost:8000/widgets/index.html\033[0m")
    
    print("\n\033[1;33m📝 ADMIN CREDENTIALS:\033[0m")
    print(f"   🔹 Username: \033[1;34m{os.getenv('ADMIN_USERNAME', 'admin')}\033[0m")
    print(f"   🔹 Password: \033[1;34m{os.getenv('ADMIN_PASSWORD', 'changeme')}\033[0m")
    
    print("\n\033[1;33m🔧 EMBEDDING INSTRUCTIONS:\033[0m")
    print("   See README_FASTAPI.md for instructions on embedding widgets in your website")
    
    print("\n\033[1;33m❗ IMPORTANT:\033[0m")
    print("   🔹 Press Ctrl+C to stop the server when done")
    print("   🔹 Initialize the system with Admin widget before first use")
    print("   🔹 For production use, change the default admin credentials")
    print("")

def main():
    """Main function to run the widget demo."""
    print_header()
    
    # Check environment variables
    if not check_env_vars():
        print("\n❌ Please fix the issues above and try again.")
        return 1
    
    # Print instructions
    print("🚀 Starting Change Management Assistant Widgets...")
    print("\n⏳ This may take a moment to start...")
    
    # Open browser tabs after a delay to give server time to start
    def open_browser_tabs():
        sleep(3)  # Wait for server to start
        webbrowser.open("http://localhost:8000/widgets/index.html")
        sleep(1)  # Small delay between tabs
        webbrowser.open("http://localhost:8000/docs")
    
    # Start browser tabs in a non-blocking way
    import threading
    browser_thread = threading.Thread(target=open_browser_tabs)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Print instructions after a small delay
    def show_instructions():
        sleep(2)
        print_instructions()
    
    instructions_thread = threading.Thread(target=show_instructions)
    instructions_thread.daemon = True
    instructions_thread.start()
    
    # Start the FastAPI server
    try:
        subprocess.run([sys.executable, "serve.py"], check=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped. Thank you for using Change Management Assistant Widgets!")
    except subprocess.CalledProcessError:
        print("\n❌ Error: Failed to start the server.")
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main()) 