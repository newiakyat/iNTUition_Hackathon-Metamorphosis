from fastapi import APIRouter, BackgroundTasks, Request
from pydantic import BaseModel
import logging
import time

# Create a router instance
router = APIRouter()

# Logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory states
warmup_state = {
    "is_warmed_up": False,
    "last_warmup": None,
    "warming_up": False
}

class WarmupRequest(BaseModel):
    action: str = "warmup"
    force: bool = False

# Global variable to access LLM (will be set later)
llm = None

def set_llm_instance(llm_instance):
    """Set the LLM instance to use for warmup"""
    global llm
    llm = llm_instance
    logger.info("LLM instance registered for warmup")

def background_warmup():
    """Background task to warm up the LLM"""
    if warmup_state["warming_up"]:
        logger.info("Warmup already in progress, skipping")
        return
    
    warmup_state["warming_up"] = True
    try:
        logger.info("Starting LLM warmup")
        start_time = time.time()
        
        # If we have access to the LLM, generate a simple response to warm it up
        if llm:
            # Run a simple query through the model to load it into memory
            test_prompt = "Hello, this is a warmup prompt to initialize the model."
            response = llm(test_prompt)
            logger.info(f"Warmup response generated: {response[:50]}...")
        else:
            # Simulate warmup if we don't have direct access to the LLM
            logger.info("No LLM instance available, simulating warmup")
            time.sleep(2)  # Simulate loading time
        
        warmup_state["is_warmed_up"] = True
        warmup_state["last_warmup"] = time.time()
        
        elapsed = time.time() - start_time
        logger.info(f"LLM warmup completed in {elapsed:.2f} seconds")
    except Exception as e:
        logger.error(f"Error during warmup: {str(e)}")
    finally:
        warmup_state["warming_up"] = False

@router.post("/api/warmup")
async def warmup(request: WarmupRequest, background_tasks: BackgroundTasks):
    """
    Warmup endpoint to initialize the LLM model
    """
    if request.force or not warmup_state["is_warmed_up"]:
        background_tasks.add_task(background_warmup)
        return {
            "status": "warmup_initiated",
            "message": "Model warmup has been initiated in the background"
        }
    else:
        return {
            "status": "already_warmed",
            "message": "Model is already warmed up",
            "last_warmup": warmup_state["last_warmup"]
        }

@router.get("/api/warmup/status")
async def warmup_status():
    """
    Get the current warmup status
    """
    return {
        "is_warmed_up": warmup_state["is_warmed_up"],
        "last_warmup": warmup_state["last_warmup"],
        "warming_up": warmup_state["warming_up"]
    } 