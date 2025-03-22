import os
import sys
import asyncio

# Configure asyncio event loop before importing torch-related modules
if sys.platform == 'darwin':  # macOS
    if not isinstance(asyncio.get_event_loop_policy(), asyncio.DefaultEventLoopPolicy):
        asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())

from dotenv import load_dotenv
from langchain.schema.runnable import RunnablePassthrough
from langchain_deepseek.chat_models import ChatDeepSeek
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from app.models.vector_store import load_vector_store

load_dotenv()

# Load DeepSeek API key from environment
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    raise ValueError("DeepSeek API key not found. Please set it in the .env file.")

def get_change_planning_retriever(vector_store_path="app/data/change_planning_store"):
    """Get a retriever from the change planning vector store."""
    try:
        vector_store = load_vector_store(vector_store_path)
        if vector_store is None:
            raise ValueError("Change planning vector store not found. Please create one first.")
        
        # Create a retriever with filter capabilities
        return vector_store.as_retriever(
            search_kwargs={
                "k": 8,  # Return 8 most relevant documents
                "score_threshold": 0.5,  # Only return relevant enough results
                "filter": None  # Will be set dynamically if needed
            }
        )
    except Exception as e:
        print(f"Error loading change planning vector store: {e}")
        raise ValueError(f"Failed to load change planning vector store: {e}")

def format_docs(docs):
    """Format retrieved documents into a single string."""
    return "\n\n".join([doc.page_content for doc in docs])

def create_change_planning_chain(streaming=False, plan_stage=None, change_type=None):
    """Create a RAG chain for change planning with DeepSeek model.
    
    Args:
        streaming (bool): Whether to enable streaming for responses
        plan_stage (str, optional): Stage of planning to filter for (e.g., "assessment", "implementation", "risk_analysis")
        change_type (str, optional): Type of change to filter for (e.g., "process", "technological", "structural")
    """
    try:
        # Configure LLM with streaming parameter
        llm = ChatDeepSeek(
            api_key=DEEPSEEK_API_KEY, 
            model_name="deepseek-chat",
            streaming=streaming
        )
        
        # Get change planning retriever
        retriever = get_change_planning_retriever()
        
        # Apply metadata filters if specified
        if plan_stage or change_type:
            # Create a metadata filter
            filter_dict = {}
            if plan_stage:
                filter_dict["plan_stage"] = plan_stage
            if change_type:
                filter_dict["change_type"] = change_type
            
            # Set the filter on the retriever
            retriever.search_kwargs["filter"] = filter_dict
        
        # Define the prompt template for change planning
        template = """You are an expert change management consultant for managers in a pharmaceutical manufacturing company.
You help managers create and evaluate change management plans, focusing on calculating benefits and risks of 
implementing specific changes. Your expertise includes cost-benefit analysis, risk assessment, and creating 
clear change descriptions.

Use the following information to answer the manager's question:

{context}

When assisting managers with change planning:
1. Help quantify potential benefits (time savings, cost reduction, efficiency gains, quality improvements)
2. Analyze possible risks and challenges with implementation
3. Suggest mitigation strategies for identified risks
4. Provide frameworks for creating clear change descriptions
5. Recommend communication strategies for the planned change
6. Offer templates or examples of well-structured change plans when appropriate
7. Maintain a practical, business-focused tone while being encouraging

Manager's Question: {question}

Your Response:"""
        
        prompt = PromptTemplate.from_template(template)
        
        # Create the RAG chain
        rag_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        return rag_chain
    except Exception as e:
        print(f"Error creating change planning RAG chain: {e}")
        raise ValueError(f"Failed to create change planning RAG chain: {e}")

def ask_change_planning_question(question, plan_stage=None, change_type=None):
    """Ask a question to the change planning RAG system.
    
    Args:
        question (str): The manager's question
        plan_stage (str, optional): Stage of planning to focus on
        change_type (str, optional): Type of change to prioritize
    """
    try:
        # Ensure we have a valid event loop
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            # Create new event loop if needed
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        rag_chain = create_change_planning_chain(streaming=False, plan_stage=plan_stage, change_type=change_type)
        response = rag_chain.invoke(question)
        return response
    except Exception as e:
        error_message = f"Error processing question: {str(e)}"
        print(error_message)
        return error_message 