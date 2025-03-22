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

def get_retriever(vector_store_path="app/data/vector_store"):
    """Get a retriever from the vector store."""
    try:
        vector_store = load_vector_store(vector_store_path)
        if vector_store is None:
            raise ValueError("Vector store not found. Please create one first.")
        
        # Create a more advanced retriever with filter capabilities
        return vector_store.as_retriever(
            search_kwargs={
                "k": 8,  # Increase from 5 to 8 to get more diverse sources
                "score_threshold": 0.5,  # Only return relevant enough results
                "filter": None  # Will be set dynamically in the chain if needed
            }
        )
    except Exception as e:
        print(f"Error loading vector store: {e}")
        raise ValueError(f"Failed to load vector store: {e}")

def format_docs(docs):
    """Format retrieved documents into a single string."""
    return "\n\n".join([doc.page_content for doc in docs])

def create_rag_chain(streaming=False, resource_type=None, audience=None):
    """Create a RAG chain with DeepSeek model.
    
    Args:
        streaming (bool): Whether to enable streaming for responses
        resource_type (str, optional): Type of resource to filter for (e.g., "training", "guide", "faq")
        audience (str, optional): Target audience to filter for (e.g., "managers", "employees", "technical_staff")
    """
    # Initialize DeepSeek LLM with proper error handling and streaming support
    try:
        # Configure streaming parameter
        llm = ChatDeepSeek(
            api_key=DEEPSEEK_API_KEY, 
            model_name="deepseek-chat",
            streaming=streaming
        )
        
        # Get retriever
        retriever = get_retriever()
        
        # Apply metadata filters if specified
        if resource_type or audience:
            # Create a metadata filter
            filter_dict = {}
            if resource_type:
                filter_dict["resource_type"] = resource_type
            if audience:
                filter_dict["audience"] = audience
            
            # Set the filter on the retriever
            retriever.search_kwargs["filter"] = filter_dict
        
        # Define the prompt template
        template = """You are an expert change management consultant in a pharmaceutical manufacturing company specializing in the ADKAR model. 
You provide guidance and evaluate change management plans based on the ADKAR framework 
(Awareness, Desire, Knowledge, Ability, Reinforcement). Answer the questions in the context of a pharmaceutical manufacturing company, and guide employees through organizational changes.

Use the following information to answer the user's question:

{context}

When supporting employees through organizational changes:
1. Identify which ADKAR elements are addressed and which ones need improvement
2. Recommend specific educational resources and training materials when applicable
3. Provide practical, actionable advice tailored to the employee's role and situation
4. Suggest concrete steps employees can take to adapt to the change
5. Offer guidance on where to find additional resources or support
6. Maintain an empathetic, supportive, and encouraging tone

User Question: {question}

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
        print(f"Error creating RAG chain: {e}")
        raise ValueError(f"Failed to create RAG chain: {e}")

def ask_question(question, resource_type=None, audience=None):
    """Ask a question to the RAG system.
    
    Args:
        question (str): The user's question
        resource_type (str, optional): Type of resource to prioritize
        audience (str, optional): Target audience to focus on
    """
    try:
        # Ensure we have a valid event loop
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            # Create new event loop if needed
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        rag_chain = create_rag_chain(streaming=False, resource_type=resource_type, audience=audience)
        response = rag_chain.invoke(question)
        return response
    except Exception as e:
        error_message = f"Error processing question: {str(e)}"
        print(error_message)
        return error_message 