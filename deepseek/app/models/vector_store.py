import os
import sys
import asyncio
import json

# Configure asyncio event loop before importing torch-related modules
if sys.platform == 'darwin':  # macOS
    if not isinstance(asyncio.get_event_loop_policy(), asyncio.DefaultEventLoopPolicy):
        asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())

from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema.document import Document

load_dotenv()

def load_processed_documents(file_path="app/data/processed_documents.json"):
    """Load previously processed documents from JSON."""
    if not os.path.exists(file_path):
        print(f"No processed documents found at {file_path}")
        return []
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    documents = []
    for item in data:
        doc = Document(
            page_content=item["page_content"],
            metadata=item["metadata"]
        )
        documents.append(doc)
    
    return documents

def create_vector_store(documents, save_path="app/data/vector_store"):
    """Create and save a FAISS vector store from documents."""
    if not documents:
        print("No documents to create vector store. Please process documents first.")
        return None
    
    # Using HuggingFace embeddings which are available offline
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",  # This is a small, efficient embedding model
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    
    # Create and save the vector store
    vector_store = FAISS.from_documents(documents, embeddings)
    vector_store.save_local(save_path)
    print(f"Vector store created and saved to {save_path}")
    
    return vector_store

def load_vector_store(load_path="app/data/vector_store"):
    """Load a previously saved FAISS vector store."""
    if not os.path.exists(load_path):
        print(f"No vector store found at {load_path}")
        return None
    
    # Use consistent embeddings when loading
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    
    # Allow deserialization since we created this vector store ourselves
    vector_store = FAISS.load_local(load_path, embeddings, allow_dangerous_deserialization=True)
    print(f"Vector store loaded from {load_path}")
    
    return vector_store

if __name__ == "__main__":
    documents = load_processed_documents()
    if documents:
        create_vector_store(documents) 