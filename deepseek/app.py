import os
import sys
import asyncio
import nest_asyncio

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

# Import streamlit and environment variables
import streamlit as st
from dotenv import load_dotenv

# Import models only after setting event loop policy
from app.models.rag_chain import create_rag_chain
from app.utils.initialize import initialize_system

# Load environment variables
load_dotenv()

# Set page config
st.set_page_config(
    page_title="Change Management Assistant",
    page_icon="🔄",
    layout="wide"
)

# App title and description
st.title("Change Management Assistant")
st.markdown("""
This AI assistant helps employees navigate organizational changes using the ADKAR model:
- **A**wareness of the need for change
- **D**esire to support the change
- **K**nowledge of how to change
- **A**bility to demonstrate skills and behaviors
- **R**einforcement to make the change stick
""")

# Navigation options
st.sidebar.title("Navigation")
app_mode = st.sidebar.radio(
    "Choose an Assistant:",
    ["ADKAR Change Assistant", "Change Planning Assistant"]
)

if app_mode == "Change Planning Assistant":
    st.switch_page("pages/change_planning.py")

# Initialize session state for chat history and filters
if "messages" not in st.session_state:
    st.session_state.messages = []
if "resource_type" not in st.session_state:
    st.session_state.resource_type = None
if "audience" not in st.session_state:
    st.session_state.audience = None

# Sidebar with system initialization and filters
with st.sidebar:
    st.header("System Configuration")
    
    # Check if API key is set
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        st.error("⚠️ DeepSeek API key not configured")
        st.info("Please set your API key in the .env file")
        api_key_input = st.text_input("Or enter your DeepSeek API key:", type="password")
        if api_key_input:
            os.environ["DEEPSEEK_API_KEY"] = api_key_input
            st.success("API key set for this session!")
    else:
        st.success("✅ DeepSeek API key configured")
    
    # System initialization button
    if st.button("Initialize/Reinitialize System"):
        with st.spinner("Initializing system..."):
            success = initialize_system()
            if success:
                st.success("System initialized successfully!")
            else:
                st.error("System initialization failed. Check the console for details.")
    
    # Add filters for content type and audience
    st.header("Response Filters")
    st.markdown("Customize the type of support you're looking for:")
    
    resource_type = st.selectbox(
        "Content Type:",
        options=[None, "training", "guide", "faq", "general"],
        format_func=lambda x: "All Content Types" if x is None else x.capitalize(),
    )
    st.session_state.resource_type = resource_type
    
    audience = st.selectbox(
        "Target Role:",
        options=[None, "all_employees", "managers", "employees", "technical_staff"],
        format_func=lambda x: "All Roles" if x is None else x.replace("_", " ").capitalize(),
    )
    st.session_state.audience = audience
    
    # Explain the filters
    with st.expander("About these filters"):
        st.markdown("""
        - **Content Type**: Choose the type of information you need
          - Training: Educational materials and learning resources
          - Guide: Step-by-step instructions and best practices
          - FAQ: Common questions and answers
          - General: All other information
        
        - **Target Role**: Select content tailored to specific roles
          - All Roles: General content for everyone
          - Managers: Resources for supporting teams through change
          - Employees: Information for individual contributors
          - Technical Staff: Specialized content for technical roles
        """)
    
    # About ADKAR
    st.header("About the Assistant")
    st.markdown("""
    This assistant helps employees and managers navigate organizational changes by providing:
    
    - Guidance on adapting to new processes, systems, or structures
    - Educational resources and training materials
    - Best practices for managing personal and team transitions
    - Support for each stage of the ADKAR change model
    
    The assistant uses the ADKAR framework as its foundation - a proven model for successful individual and organizational change.
    
    For managers planning changes, try the [Change Planning Assistant](./pages/change_planning) which helps with creating change plans, calculating benefits, and assessing risks.
    """)

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Get user input
if prompt := st.chat_input("Ask about adapting to changes or finding educational resources..."):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Display user message
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Generate and display response with streaming
    with st.chat_message("assistant"):
        try:
            # Create empty container for streaming output
            message_placeholder = st.empty()
            full_response = ""
            
            # Create RAG chain with filters
            rag_chain = create_rag_chain(
                streaming=True,
                resource_type=st.session_state.resource_type,
                audience=st.session_state.audience
            )
            
            # Process the stream of response tokens
            for chunk in rag_chain.stream(prompt):
                full_response += chunk
                # Add a blinking cursor to simulate typing
                message_placeholder.markdown(full_response + "▌")
            
            # Show the complete response without cursor when done
            message_placeholder.markdown(full_response)
                
            # Add assistant response to chat history
            st.session_state.messages.append({"role": "assistant", "content": full_response})
                
        except Exception as e:
            error_message = f"Error: {str(e)}"
            st.error(error_message)
            
            # Check if it's likely due to missing initialization
            if "Vector store not found" in str(e):
                st.info("Please initialize the system using the button in the sidebar.")
            
            # Add error message to chat history
            st.session_state.messages.append({"role": "assistant", "content": error_message}) 