# Change Management Assistant

A comprehensive AI-powered application to support change management in pharmaceutical manufacturing environments, featuring two specialized assistants:

## ADKAR Change Assistant
Helps employees navigate organizational changes using the ADKAR model:
- **A**wareness of the need for change
- **D**esire to support the change
- **K**nowledge of how to change
- **A**bility to demonstrate skills and behaviors
- **R**einforcement to make the change stick

## Change Planning Assistant for Managers
Helps managers create and evaluate change management plans:
- Calculate benefits of implementing specific changes
- Assess risks and challenges of implementation
- Generate clear change descriptions
- Develop communication strategies
- Create structured implementation plans

## Features

- Dual specialized AI assistants tailored to different change management needs
- RAG (Retrieval Augmented Generation) approach using DeepSeek LLM
- Customizable filters for more targeted responses
- Streaming interface for responsive user experience
- Built-in knowledge base with pharmaceutical industry-specific content
- Expandable with your own PDF resources

## Setup

### Prerequisites
- Python 3.8+
- DeepSeek API key

### Installation

1. Clone this repository:
```
git clone <repository-url>
cd change-management-assistant
```

2. Create a virtual environment and activate it:
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required dependencies:
```
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory and add your DeepSeek API key:
```
DEEPSEEK_API_KEY=your_api_key_here
```

### Running the Application

1. Start the Streamlit app:
```
streamlit run app.py
```

2. Initialize the system by clicking the "Initialize/Reinitialize System" button in the sidebar of the app.

3. Navigate between the two assistants using the radio buttons in the sidebar.

## Adding Your Own Resources

The system comes with built-in knowledge about change management, but you can enhance it with your own documents:

### For ADKAR Change Assistant
Place PDF files related to employee change management in the `resources` directory.

### For Change Planning Assistant
Place PDF files related to change planning, ROI calculations, risk assessments, etc., in the `resources/change_planning` directory.

Naming conventions for files help categorize content:
- Include terms like "training", "guide", "faq" for resource type
- Include terms like "manager", "employee", "technical" for audience targeting
- For change planning documents, include terms like "assessment", "implementation", "risk", "benefit" for plan stage and "process", "tech", "structure", "cultural" for change type

After adding new resources, click "Initialize/Reinitialize System" in the app to process them.

## System Architecture

- **app/models**: Contains the RAG chains and vector store functionality
- **app/data**: Includes data processing and preparation scripts
- **app/utils**: Utility functions including system initialization
- **resources**: Directories for storing PDF resources
- **app.py**: Main application entry point for the ADKAR assistant
- **change_planning.py**: Entry point for the Change Planning assistant

## Technologies Used

- **LangChain**: Framework for developing LLM-powered applications
- **DeepSeek**: LLM provider for generating responses
- **FAISS**: Vector database for efficient similarity searches
- **HuggingFace**: Embeddings for document vectorization
- **Streamlit**: Web application framework
- **PyPDF**: PDF document processing 