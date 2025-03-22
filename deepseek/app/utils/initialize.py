import os
import sys
import asyncio
import subprocess
import time
import threading

# Configure asyncio event loop before importing torch-related modules
if sys.platform == 'darwin':  # macOS
    if not isinstance(asyncio.get_event_loop_policy(), asyncio.DefaultEventLoopPolicy):
        asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())

# Global variables to track warm-up status
warmup_status = {
    "is_warming_up": False,
    "is_warm": False,
    "timestamp": None,
    "error": None
}

def check_environment():
    """Check if the environment is properly configured."""
    # Check for DeepSeek API key
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        print("⚠️ DeepSeek API key not found or not set properly in .env file")
        print("Please update the .env file with your API key")
        return False
    
    return True

def create_resources_directory():
    """Create resources directory if it doesn't exist."""
    # Create main resources directory
    if not os.path.exists("resources"):
        os.makedirs("resources")
        print("✅ Created 'resources' directory")
        print("Please add your change management and ADKAR PDF documents there")
    
    # Create change planning resources directory
    if not os.path.exists("resources/change_planning"):
        os.makedirs("resources/change_planning")
        print("✅ Created 'resources/change_planning' directory")
        print("Please add your change planning PDF documents there")
    
    return True

def initialize_adkar_data():
    """Initialize ADKAR data processing and vector store creation."""
    # Process documents
    print("📊 Processing ADKAR documents...")
    try:
        # Use sys.executable to ensure we use the same Python interpreter
        subprocess.run([sys.executable, "-m", "app.data.prepare_data"], check=True)
        
        # Create vector store
        print("🔍 Creating ADKAR vector store...")
        if os.path.exists("app/data/processed_documents.json"):
            subprocess.run([sys.executable, "-m", "app.models.vector_store"], check=True)
            return True
        else:
            print("⚠️ No processed ADKAR documents found. Unable to create vector store.")
            return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during ADKAR data initialization: {e}")
        return False

def initialize_change_planning_data():
    """Initialize change planning data processing and vector store creation."""
    # Process change planning documents
    print("📊 Processing change planning documents...")
    try:
        # Use sys.executable to ensure we use the same Python interpreter
        subprocess.run([sys.executable, "-m", "app.data.prepare_change_planning_data"], check=True)
        
        # Create change planning vector store
        print("🔍 Creating change planning vector store...")
        if os.path.exists("app/data/change_planning_documents.json"):
            from app.models.vector_store import load_processed_documents, create_vector_store
            
            # Load the documents
            docs = []
            with open("app/data/change_planning_documents.json", 'r') as f:
                import json
                from langchain.schema.document import Document
                
                data = json.load(f)
                for item in data:
                    doc = Document(
                        page_content=item["page_content"],
                        metadata=item["metadata"]
                    )
                    docs.append(doc)
            
            # Create the vector store with a different path
            create_vector_store(docs, save_path="app/data/change_planning_store")
            return True
        else:
            print("⚠️ No processed change planning documents found. Unable to create vector store.")
            return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during change planning data initialization: {e}")
        return False
    except Exception as e:
        print(f"❌ Error creating change planning vector store: {e}")
        return False

def warmup_models():
    """Pre-warm the models by loading them into memory and making a test query."""
    global warmup_status
    
    print("🔥 Pre-warming models...")
    warmup_status["is_warming_up"] = True
    
    try:
        # Import here to avoid circular imports
        from app.models.rag_chain import create_rag_chain
        from app.models.change_planning_chain import create_change_planning_chain
        
        # Warm up regular chat model
        print("🤖 Warming up RAG chat model...")
        rag_chain = create_rag_chain(streaming=False)
        test_result = rag_chain.invoke("This is a test query to warm up the model.")
        print(f"✅ RAG chat model warmed up successfully! (Response length: {len(test_result)})")
        
        # Warm up planning model
        print("📋 Warming up planning model...")
        planning_chain = create_change_planning_chain(streaming=False)
        test_result = planning_chain.invoke("This is a test query to warm up the planning model.")
        print(f"✅ Planning model warmed up successfully! (Response length: {len(test_result)})")
        
        # Update status
        warmup_status["is_warm"] = True
        warmup_status["timestamp"] = time.time()
        warmup_status["error"] = None
        
        print("🚀 Models are ready for use!")
        return True
        
    except Exception as e:
        error_msg = f"Error warming up models: {str(e)}"
        print(f"❌ {error_msg}")
        warmup_status["error"] = error_msg
        return False
    finally:
        warmup_status["is_warming_up"] = False

def initialize_system(warmup_only=False):
    """Initialize the complete RAG system."""
    global warmup_status
    
    print("🚀 Initializing Change Management RAG Systems...")
    
    # Check environment
    if not check_environment():
        return False
    
    # If only warming up models
    if warmup_only:
        # If already warming up, don't start again
        if warmup_status["is_warming_up"]:
            print("⏳ Models are already being warmed up. Please wait...")
            return True
        
        # If already warm, just return success
        if warmup_status["is_warm"]:
            print("✓ Models are already warm and ready!")
            return True
        
        # Start warming up models in a separate thread
        warmup_thread = threading.Thread(target=warmup_models)
        warmup_thread.daemon = True
        warmup_thread.start()
        return True
    
    # Full initialization
    # Create resources directory
    create_resources_directory()
    
    # Initialize ADKAR data
    adkar_success = initialize_adkar_data()
    if not adkar_success:
        print("⚠️ ADKAR system initialization incomplete.")
    else:
        print("✅ ADKAR RAG system initialized successfully!")
    
    # Initialize change planning data
    planning_success = initialize_change_planning_data()
    if not planning_success:
        print("⚠️ Change Planning system initialization incomplete.")
    else:
        print("✅ Change Planning RAG system initialized successfully!")
    
    # Warm up models if at least one system was initialized successfully
    if adkar_success or planning_success:
        warmup_models()
    
    # Overall status
    if adkar_success or planning_success:
        print("✅ At least one RAG system initialized successfully!")
        return True
    else:
        print("❌ Both RAG systems initialization failed. Please address the issues above.")
        return False

def get_warmup_status():
    """Return the current warmup status."""
    global warmup_status
    
    if warmup_status["error"]:
        return {"status": "error", "message": warmup_status["error"]}
    elif warmup_status["is_warming_up"]:
        return {"status": "warming_up", "message": "Models are being warmed up"}
    elif warmup_status["is_warm"]:
        timestamp = warmup_status["timestamp"]
        time_str = time.strftime("%H:%M:%S", time.localtime(timestamp)) if timestamp else "unknown"
        return {"status": "ready", "message": f"Models are warm and ready (since {time_str})"}
    else:
        return {"status": "not_started", "message": "Model warmup has not been initiated"}

if __name__ == "__main__":
    initialize_system() 