import os
import sys
import asyncio

# Configure asyncio event loop before importing torch-related modules
if sys.platform == 'darwin':  # macOS
    if not isinstance(asyncio.get_event_loop_policy(), asyncio.DefaultEventLoopPolicy):
        asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import json

def load_documents(directory="./resources"):
    """Load PDF documents from the specified directory."""
    documents = []
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory {directory}. Please add your change management and ADKAR resources there.")
        return []
    
    for filename in os.listdir(directory):
        if filename.endswith(".pdf"):
            file_path = os.path.join(directory, filename)
            loader = PyPDFLoader(file_path)
            loaded_docs = loader.load()
            
            # Add metadata based on filename patterns
            for doc in loaded_docs:
                # Initialize with default metadata
                doc.metadata["resource_type"] = "general"
                doc.metadata["audience"] = "all_employees"
                
                # Categorize based on filename patterns
                lower_filename = filename.lower()
                if "training" in lower_filename or "tutorial" in lower_filename:
                    doc.metadata["resource_type"] = "training"
                elif "guide" in lower_filename or "manual" in lower_filename:
                    doc.metadata["resource_type"] = "guide"
                elif "faq" in lower_filename or "question" in lower_filename:
                    doc.metadata["resource_type"] = "faq"
                
                # Identify target audience
                if "manager" in lower_filename or "leader" in lower_filename:
                    doc.metadata["audience"] = "managers"
                elif "employee" in lower_filename:
                    doc.metadata["audience"] = "employees"
                elif "technical" in lower_filename or "it" in lower_filename:
                    doc.metadata["audience"] = "technical_staff"
            
            documents.extend(loaded_docs)
    
    return documents

def split_documents(documents, chunk_size=1000, chunk_overlap=100):
    """Split documents into smaller chunks for processing."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    
    splits = text_splitter.split_documents(documents)
    return splits

def create_adkar_documents():
    """Create documents with ADKAR framework information."""
    adkar_docs = [
        {
            "title": "ADKAR Model Overview",
            "content": """
            The ADKAR model is a change management framework that describes the five outcomes an individual must achieve for a change to be successful:
            
            Awareness: Understanding why the change is necessary
            Desire: Having the motivation and willingness to participate in the change
            Knowledge: Knowing how to change and what the change looks like
            Ability: Having the skills and behaviors needed to implement the change
            Reinforcement: Ensuring the change sticks and becomes permanent
            
            The ADKAR model provides a sequential framework to guide individuals through change processes.
            """
        },
        {
            "title": "Awareness Stage",
            "content": """
            Awareness is the first step in the ADKAR model. It involves understanding why the change is necessary.
            
            Key aspects:
            - Communicate the business reasons for change
            - Share the risks of not changing
            - Address the "what's in it for me" question
            - Use multiple communication channels
            - Be transparent about the implications
            
            Common barriers:
            - Poor communication
            - Misinformation or rumors
            - Disconnect from organizational vision
            - Perception that there's no need for change
            """
        },
        {
            "title": "Desire Stage",
            "content": """
            Desire is the second step in the ADKAR model. It represents the willingness to support and participate in the change.
            
            Key aspects:
            - Personal motivators for change
            - Organizational context and pressure for change
            - Personal choice based on consequences of supporting or resisting
            - WIIFM (What's In It For Me)
            
            Common barriers:
            - Fear of the unknown
            - Personal impact of change
            - Organizational history and culture
            - Lack of alignment with personal values
            """
        },
        {
            "title": "Knowledge Stage",
            "content": """
            Knowledge is the third step in the ADKAR model. It involves understanding how to change and what the change looks like.
            
            Key aspects:
            - Training on new processes, tools, and systems
            - Understanding new roles and responsibilities
            - Access to information about how to change
            - Connection to subject matter experts
            
            Common barriers:
            - Insufficient training
            - Complexity of the change
            - Limited access to information
            - Unrealistic expectations about learning curve
            """
        },
        {
            "title": "Ability Stage", 
            "content": """
            Ability is the fourth step in the ADKAR model. It represents the actual implementation of the change and the development of new skills.
            
            Key aspects:
            - Putting knowledge into practice
            - Time to develop new skills
            - Coaching and support
            - Removing barriers to implementation
            
            Common barriers:
            - Physical or intellectual limitations
            - Time constraints
            - Limited resources
            - Psychological blocks
            """
        },
        {
            "title": "Reinforcement Stage",
            "content": """
            Reinforcement is the final step in the ADKAR model. It ensures the change sticks and becomes permanent.
            
            Key aspects:
            - Recognition and rewards for adopting change
            - Internal satisfaction and pride
            - Accountability systems
            - Ongoing feedback and corrective actions
            
            Common barriers:
            - Lack of reinforcement
            - Removal of consequences for reverting to old ways
            - Negative consequences for demonstrating new behaviors
            - Competing changes and priorities
            """
        },
        {
            "title": "ADKAR Assessment and Planning",
            "content": """
            ADKAR can be used as both an assessment tool and a planning framework:
            
            As an assessment tool:
            - Identify which ADKAR elements are strong or weak
            - Determine the primary barrier point to change
            - Target interventions at specific barrier points
            
            As a planning framework:
            - Develop specific activities for each ADKAR element
            - Sequence change management activities
            - Align leadership actions with individual change needs
            - Create targeted communications and training
            """
        },
        {
            "title": "Change Management Best Practices",
            "content": """
            Effective change management practices to complement the ADKAR model:
            
            1. Active and visible executive sponsorship
            2. Dedicated change management resources
            3. Applying a structured change management approach
            4. Engaging with employees and encouraging participation
            5. Frequent and transparent communication
            6. Integration with project management
            7. Engagement with middle managers
            8. Addressing resistance proactively
            9. Celebrating successes and quick wins
            10. Measuring change adoption and outcomes
            """
        },
        {
            "title": "Employee Training Resources for Change",
            "content": """
            Educational Resources for Employees During Change:
            
            1. Self-paced e-learning modules on new systems or processes
            2. Microlearning content that can be consumed in 5-10 minutes
            3. Hands-on workshops and interactive sessions
            4. On-demand video tutorials demonstrating new workflows
            5. Peer learning sessions facilitated by early adopters
            6. Mentoring and coaching programs
            7. Regular Q&A sessions for addressing concerns
            8. Documentation libraries with searchable content
            9. Role-specific training paths
            10. Assessment tools to identify knowledge gaps
            
            Effective learning during change requires multi-modal approaches that respect different learning styles and allow for practice in safe environments.
            """,
            "metadata": {"resource_type": "training", "audience": "all_employees"}
        },
        {
            "title": "Manager's Guide to Supporting Team Through Change",
            "content": """
            How Managers Can Support Their Teams Through Change:
            
            1. Listen actively to concerns and validate feelings
            2. Translate organizational change messages to team-specific implications
            3. Identify and address resistance early
            4. Create psychological safety for asking questions
            5. Recognize progress and celebrate small wins
            6. Remove obstacles to adoption
            7. Provide access to necessary resources and training
            8. Model the new behaviors expected
            9. Be transparent about what is known and unknown
            10. Hold regular check-ins focused specifically on the change
            
            Managers play a critical role in the success of change initiatives, serving as the bridge between executive vision and frontline implementation.
            """,
            "metadata": {"resource_type": "guide", "audience": "managers"}
        },
        {
            "title": "Frequently Asked Questions About Organizational Change",
            "content": """
            Common Questions Employees Ask During Change:
            
            Q: Why is this change happening now?
            A: Organizations change in response to external pressures, internal inefficiencies, or strategic opportunities. Specific timing is usually driven by market conditions, competitive factors, or organizational readiness.
            
            Q: How will this change affect my role?
            A: Each role may be affected differently. The best approach is to ask your manager specifically about your position and responsibilities.
            
            Q: What happens if I can't adapt to the new way of working?
            A: Additional training and support resources will be available. Your manager should work with you to develop a plan for building necessary skills.
            
            Q: How long will it take to get comfortable with the new processes?
            A: Research shows that significant changes typically take 3-6 months to become routine, but this varies based on complexity and individual circumstances.
            
            Q: Who can I talk to if I'm struggling with the change?
            A: Your direct manager, HR representative, designated change champions, and employee assistance programs are all resources available to support you.
            """,
            "metadata": {"resource_type": "faq", "audience": "all_employees"}
        },
        {
            "title": "Creating a Personal Change Adaptation Plan",
            "content": """
            Steps to Create Your Personal Change Adaptation Plan:
            
            1. Reflect on your current feelings about the change (awareness)
            2. Identify personal benefits and motivation factors (desire)
            3. List the specific skills and information you need (knowledge)
            4. Create a learning plan with timeline and resources (ability)
            5. Set up accountability and track your progress (reinforcement)
            
            Your plan should include:
            - Specific learning objectives
            - Resources needed (time, training, support)
            - Milestones and success indicators
            - Potential obstacles and strategies to overcome them
            - Support network (colleagues, mentors, managers)
            
            Remember that adapting to change is a personal journey that happens alongside the organizational change. Taking ownership of your adaptation process increases your chances of success.
            """,
            "metadata": {"resource_type": "guide", "audience": "all_employees"}
        }
    ]
    
    # Convert to LangChain document format
    from langchain.schema.document import Document
    documents = []
    
    for doc in adkar_docs:
        metadata = doc.get("metadata", {"title": doc["title"], "source": "ADKAR Framework"})
        if "title" not in metadata:
            metadata["title"] = doc["title"]
        if "source" not in metadata:
            metadata["source"] = "ADKAR Framework"
            
        documents.append(Document(
            page_content=doc["content"],
            metadata=metadata
        ))
    
    return documents

def save_to_json(documents, output_file="processed_documents.json"):
    """Save processed documents to a JSON file."""
    docs_dict = [{"page_content": doc.page_content, "metadata": doc.metadata} for doc in documents]
    with open(output_file, 'w') as f:
        json.dump(docs_dict, f)
    print(f"Saved {len(docs_dict)} documents to {output_file}")

if __name__ == "__main__":
    # Load external documents if available
    external_docs = load_documents()
    
    # Create ADKAR framework documents
    #adkar_docs = create_adkar_documents()
    
    # Combine all documents
    all_documents = external_docs 
    
    # Split documents into chunks
    if all_documents:
        splits = split_documents(all_documents)
        print(f"Created {len(splits)} document chunks")
        
        # Save processed documents
        save_to_json(splits, "app/data/processed_documents.json")
    else:
        print("No documents processed. Please add PDF resources to the 'resources' directory.") 