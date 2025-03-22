import os
import sys
import asyncio
import nest_asyncio
import threading
import time
from collections import deque
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

from fastapi import FastAPI, HTTPException, Depends, Body, status, Form, Query, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import JSONResponse, StreamingResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, AsyncIterator, Dict, List, Any
import secrets
import json
from dotenv import load_dotenv

# Import models only after setting event loop policy
from app.models.rag_chain import create_rag_chain
from app.models.change_planning_chain import create_change_planning_chain
from app.utils.initialize import initialize_system, get_warmup_status

# Load environment variables
load_dotenv()

# Admin credentials - in a real app, these should be stored securely
# and probably hashed, not in plaintext
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "changeme")

# Initialize FastAPI app
app = FastAPI(
    title="Change Management Assistant API",
    description="API endpoints for change management RAG chatbots",
    version="1.0.0"
)

# Set up CORS to allow requests from your website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security utilities
security = HTTPBasic()

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# Data models
class ChatRequest(BaseModel):
    message: str
    resource_type: Optional[str] = None
    audience: Optional[str] = None

class PlanningRequest(BaseModel):
    message: str
    plan_stage: Optional[str] = None
    change_type: Optional[str] = None

class ChatResponse(BaseModel):
    response: str

class WarmupRequest(BaseModel):
    force: bool = False

# Message store for active streaming requests
# This stores messages that are being streamed, keyed by request ID
active_streams: Dict[str, deque] = {}

# Mount static files
static_dir = Path(__file__).parent / "app" / "static"
app.mount("/widgets", StaticFiles(directory=static_dir), name="static")

# Function to generate a streaming response for the client
async def generate_stream_response(request_id: str) -> AsyncIterator[str]:
    """Generate a streaming response for a given request ID"""
    print(f"Starting stream generation for request ID: {request_id}")
    
    if request_id not in active_streams:
        # Initialize an empty queue for this request
        print(f"Creating new message queue for request ID: {request_id}")
        active_streams[request_id] = deque()
    
    # Get the message queue for this request
    message_queue = active_streams[request_id]
    
    # Send initial keep-alive message to establish connection
    initial_message = f"data: {json.dumps({'text': '', 'keep_alive': True})}\n\n"
    print(f"Sending initial keep-alive message for {request_id}")
    yield initial_message
    
    # Wait for chunks to be added to the queue and yield them
    timeout_seconds = 60  # Set a reasonable timeout
    start_time = time.time()
    
    try:
        while True:
            # Check if we've timed out
            if time.time() - start_time > timeout_seconds:
                # Cleanup and yield end message
                print(f"Stream {request_id} timed out after {timeout_seconds} seconds")
                if request_id in active_streams:
                    del active_streams[request_id]
                yield f"data: {json.dumps({'text': '', 'end': True, 'error': 'Stream timeout'})}\n\n"
                break
            
            # If there are messages in the queue, yield them
            if message_queue:
                message = message_queue.popleft()
                yield message
                
                # If it's an end message, break the loop
                if '"end":true' in message:
                    print(f"End of stream message found for {request_id}, closing connection")
                    if request_id in active_streams:
                        del active_streams[request_id]
                    break
            
            # If queue is empty, send a heartbeat every 10 seconds
            elif time.time() - start_time > 0 and (time.time() - start_time) % 10 < 0.2:
                # Send a heartbeat to keep connection alive
                heartbeat = f"data: {json.dumps({'text': '', 'heartbeat': True})}\n\n"
                print(f"Sending heartbeat for {request_id}")
                yield heartbeat
                await asyncio.sleep(0.1)
            
            # Otherwise wait a bit
            else:
                await asyncio.sleep(0.1)
    except Exception as e:
        # Handle any unexpected exceptions
        print(f"Error in stream generation for {request_id}: {e}")
        if request_id in active_streams:
            del active_streams[request_id]
        yield f"data: {json.dumps({'text': '', 'end': True, 'error': str(e)})}\n\n"

# Function to add a message to a stream
def add_to_stream(request_id: str, message: str):
    """Add a message to a stream queue"""
    if request_id not in active_streams:
        active_streams[request_id] = deque()
    
    active_streams[request_id].append(message)

# Process LLM streaming in a separate thread to avoid blocking
def process_llm_streaming(chain, user_message: str, request_id: str):
    """Process LLM streaming in a background thread"""
    try:
        # Initialize response
        full_response = ""
        
        # Process the streaming response
        for chunk in chain.stream(user_message):
            if chunk:
                # Print the chunk to logs for debugging
                print(f"Streaming chunk: {chunk[:20]}..." if len(chunk) > 20 else f"Streaming chunk: {chunk}")
                
                # Add to accumulated response
                full_response += chunk
                
                # Add to stream
                add_to_stream(
                    request_id, 
                    f"data: {json.dumps({'text': chunk})}\n\n"
                )
                
                # Add a small delay to simulate typing effect if needed
                time.sleep(0.01)
        
        # Add end of stream message
        add_to_stream(
            request_id,
            f"data: {json.dumps({'text': '', 'end': True})}\n\n"
        )
        
    except Exception as e:
        error_msg = f"Error during streaming: {str(e)}"
        print(error_msg)
        
        # Add error message to stream
        add_to_stream(
            request_id,
            f"data: {json.dumps({'error': error_msg})}\n\n"
        )
        
        # Add end message
        add_to_stream(
            request_id,
            f"data: {json.dumps({'text': '', 'end': True})}\n\n"
        )

# Initialization endpoint
@app.post("/api/initialize")
async def initialize_api_system():
    """Initialize or reinitialize the system"""
    try:
        # Check if already initialized or initializing
        status = get_warmup_status()
        if status["status"] == "warming_up":
            return {"status": "in_progress", "message": "System initialization already in progress"}
        elif status["status"] == "ready":
            return {"status": "success", "message": "System is already initialized"}
            
        # If not already initialized or initializing, start initialization
        success = initialize_system()
        if success:
            return {"status": "success", "message": "System initialization started"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="System initialization failed"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing system: {str(e)}"
        )

# User chatbot endpoint (rag_chain)
@app.post("/api/chat")
async def chat_endpoint(
    request: ChatRequest = Body(...),
    stream: bool = Query(False, description="Enable streaming response"),
    request_id: str = Query(None, description="Unique ID for streaming request")
):
    """Public endpoint for regular users to interact with the main RAG chatbot"""
    try:
        # Create RAG chain with filters
        rag_chain = create_rag_chain(
            streaming=stream,
            resource_type=request.resource_type,
            audience=request.audience
        )
        
        # Return streaming response if requested
        if stream:
            # Generate a request ID if not provided
            if not request_id:
                request_id = f"chat_{int(time.time() * 1000)}"
            
            # Start processing in a background thread
            threading.Thread(
                target=process_llm_streaming,
                args=(rag_chain, request.message, request_id),
                daemon=True
            ).start()
            
            # Return success immediately - client will fetch the stream separately
            return {"status": "streaming", "request_id": request_id}
        
        # Otherwise return normal JSON response
        response = rag_chain.invoke(request.message)
        return ChatResponse(response=response)
    except Exception as e:
        # Check if it's likely due to missing initialization
        if "Vector store not found" in str(e):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="System needs initialization. Please contact an administrator."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing request: {str(e)}"
            )

# Streaming endpoint for user chat
@app.get("/api/chat/stream")
async def chat_stream_endpoint(
    request_id: str = Query(..., description="ID of the streaming request to fetch"),
    stream: bool = Query(True, description="Must be true for streaming")
):
    """Endpoint to stream chat responses for a request that was initiated via the POST endpoint"""
    if not stream:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stream parameter must be true for this endpoint"
        )
    
    print(f"Streaming request received for ID: {request_id}")
    
    # Ensure the request_id exists in active_streams
    if request_id not in active_streams:
        print(f"Warning: Request ID {request_id} not found in active streams")
        # Initialize an empty queue for this request anyway
        active_streams[request_id] = deque()
        
    return StreamingResponse(
        generate_stream_response(request_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable proxy buffering
        }
    )

# Admin planning chatbot endpoint (change_planning_chain)
@app.post("/api/planning")
async def planning_endpoint(
    request: PlanningRequest = Body(...),
    stream: bool = Query(False, description="Enable streaming response"),
    request_id: str = Query(None, description="Unique ID for streaming request")
):
    """Endpoint to interact with the change planning RAG chatbot"""
    try:
        print(f"Planning request received: stream={stream}, request_id={request_id}, message={request.message[:30]}...")
        
        # Create Change Planning RAG chain with filters
        planning_chain = create_change_planning_chain(
            streaming=stream,
            plan_stage=request.plan_stage,
            change_type=request.change_type
        )
        
        # Return streaming response if requested
        if stream:
            # Generate a request ID if not provided
            if not request_id:
                request_id = f"planning_{int(time.time() * 1000)}"
                print(f"Generated new request_id: {request_id}")
            else:
                print(f"Using provided request_id: {request_id}")
            
            # Start processing in a background thread
            print(f"Starting background thread for request_id: {request_id}")
            threading.Thread(
                target=process_llm_streaming,
                args=(planning_chain, request.message, request_id),
                daemon=True
            ).start()
            
            # Return success immediately - client will fetch the stream separately
            print(f"Returning streaming response with request_id: {request_id}")
            return {"status": "streaming", "request_id": request_id}
        
        # Otherwise return normal JSON response
        print("Processing non-streaming request")
        response = planning_chain.invoke(request.message)
        return ChatResponse(response=response)
    except Exception as e:
        # Check if it's likely due to missing initialization
        if "vector store not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="System needs initialization. Please use the /api/initialize endpoint."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing request: {str(e)}"
            )

# Streaming endpoint for admin planning
@app.get("/api/planning/stream")
async def planning_stream_endpoint(
    request_id: str = Query(..., description="ID of the streaming request to fetch"),
    stream: bool = Query(True, description="Must be true for streaming")
):
    """Endpoint to stream planning responses for a request that was initiated via the POST endpoint"""
    print(f"Stream request received for planning with ID: {request_id}")
    
    if not stream:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stream parameter must be true for this endpoint"
        )
    
    print(f"Checking if request_id {request_id} exists in active_streams: {request_id in active_streams}")
    
    # Ensure the request_id exists in active_streams
    if request_id not in active_streams:
        print(f"Request ID {request_id} not found, initializing empty queue")
        # Initialize an empty queue for this request
        active_streams[request_id] = deque()
    
    return StreamingResponse(
        generate_stream_response(request_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable proxy buffering
        }
    )

# Status endpoint
@app.get("/api/status")
async def status_endpoint(request: Request):
    """Check if the API is running"""
    # Log headers for debugging
    print(f"Status endpoint called from: {request.client.host}")
    print(f"Request headers: {request.headers}")
    
    # Return CORS headers explicitly
    return {
        "status": "online", 
        "message": "Change Management Assistant API is running",
        "request_origin": request.headers.get("origin", "unknown")
    }

# Warmup endpoint for widgets
@app.post("/api/warmup")
async def warmup_endpoint(request: WarmupRequest = Body(...)):
    """Warm up the models to reduce first-query latency"""
    # Start initialization in a background thread if not already warmed up
    warmup_status = get_warmup_status()
    
    if request.force or warmup_status["status"] != "ready":
        # Start initialization in a background thread
        threading.Thread(
            target=initialize_system,
            daemon=True
        ).start()
    
    return {"status": "warming_up", "message": "Models are being warmed up"}

# Warmup status endpoint for widgets
@app.get("/api/warmup/status")
async def warmup_status_endpoint():
    """Check the status of model warmup"""
    return get_warmup_status()

# Add a stream test endpoint for debugging
@app.get("/api/test-stream")
async def test_stream_endpoint(
    request_id: str = Query("test", description="Test request ID"),
):
    """Test endpoint to simulate a streaming response - for debugging only"""
    # Create a test stream
    if request_id not in active_streams:
        active_streams[request_id] = deque()
        
        # Add some test messages in a background thread
        def add_test_messages():
            time.sleep(0.5)
            add_to_stream(request_id, f"data: {json.dumps({'text': 'This '})}\n\n")
            time.sleep(0.5)
            add_to_stream(request_id, f"data: {json.dumps({'text': 'is '})}\n\n")
            time.sleep(0.5)
            add_to_stream(request_id, f"data: {json.dumps({'text': 'a '})}\n\n")
            time.sleep(0.5)
            add_to_stream(request_id, f"data: {json.dumps({'text': 'test '})}\n\n")
            time.sleep(0.5)
            add_to_stream(request_id, f"data: {json.dumps({'text': 'stream.'})}\n\n")
            time.sleep(0.5)
            add_to_stream(request_id, f"data: {json.dumps({'text': '', 'end': True})}\n\n")
        
        threading.Thread(target=add_test_messages, daemon=True).start()
    
    return StreamingResponse(
        generate_stream_response(request_id),
        media_type="text/event-stream"
    )

# Run with: uvicorn api:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True) 