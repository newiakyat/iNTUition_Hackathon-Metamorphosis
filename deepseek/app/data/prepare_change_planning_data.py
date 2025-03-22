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

def load_change_planning_documents(directory="./resources/change_planning"):
    """Load PDF documents for change planning from the specified directory."""
    documents = []
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory {directory}. Please add your change planning resources there.")
        return []
    
    for filename in os.listdir(directory):
        if filename.endswith(".pdf"):
            file_path = os.path.join(directory, filename)
            loader = PyPDFLoader(file_path)
            loaded_docs = loader.load()
            
            # Add metadata based on filename patterns
            for doc in loaded_docs:
                # Initialize with default metadata
                doc.metadata["plan_stage"] = "general"
                doc.metadata["change_type"] = "general"
                
                # Categorize based on filename patterns
                lower_filename = filename.lower()
                
                # Plan stage categorization
                if "assessment" in lower_filename or "analysis" in lower_filename:
                    doc.metadata["plan_stage"] = "assessment"
                elif "implement" in lower_filename or "execution" in lower_filename:
                    doc.metadata["plan_stage"] = "implementation"
                elif "risk" in lower_filename:
                    doc.metadata["plan_stage"] = "risk_analysis"
                elif "benefit" in lower_filename or "roi" in lower_filename:
                    doc.metadata["plan_stage"] = "benefit_analysis"
                elif "communication" in lower_filename or "stakeholder" in lower_filename:
                    doc.metadata["plan_stage"] = "communication"
                
                # Change type categorization
                if "process" in lower_filename or "workflow" in lower_filename:
                    doc.metadata["change_type"] = "process"
                elif "tech" in lower_filename or "digital" in lower_filename or "system" in lower_filename:
                    doc.metadata["change_type"] = "technological"
                elif "structure" in lower_filename or "org" in lower_filename or "reorgan" in lower_filename:
                    doc.metadata["change_type"] = "structural"
                elif "cultural" in lower_filename or "behavior" in lower_filename:
                    doc.metadata["change_type"] = "cultural"
                
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

def create_change_planning_documents():
    """Create baseline documents with change planning information."""
    planning_docs = [
        {
            "title": "Change Management Planning Overview",
            "content": """
            Change Management Planning in Pharmaceutical Manufacturing

            Effective change management planning is critical in pharmaceutical manufacturing environments where 
            changes must be carefully controlled to maintain product quality, regulatory compliance, and operational efficiency.
            
            Key components of a change management plan include:
            1. Clear description of the proposed change
            2. Rationale and business case for the change
            3. Impact assessment across departments and processes
            4. Risk analysis and mitigation strategies
            5. Resource requirements and cost estimations
            6. Implementation timeline and milestones
            7. Training and communication plans
            8. Success metrics and evaluation approach
            """,
            "metadata": {"plan_stage": "general", "change_type": "general"}
        },
        {
            "title": "Benefit Analysis for Change Initiatives",
            "content": """
            Benefit Analysis Framework for Pharmaceutical Change Initiatives

            When calculating benefits of a potential change, consider both quantitative and qualitative factors:

            Quantitative Benefits:
            1. Direct cost savings (labor, materials, maintenance)
            2. Time reduction in processes
            3. Increased production capacity
            4. Reduced error rates and investigations
            5. Reduced compliance deviations
            6. Energy savings
            7. Reduced waste

            Qualitative Benefits:
            1. Improved compliance posture
            2. Enhanced quality culture
            3. Increased employee satisfaction
            4. Better knowledge management
            5. Improved company reputation
            6. Enhanced customer trust

            ROI Calculation:
            ROI = (Net Benefits / Total Costs) × 100

            Benefit Timeframes:
            - Immediate benefits (0-3 months)
            - Short-term benefits (3-12 months)
            - Long-term benefits (1+ years)

            It's important to establish a baseline measurement before implementing change to accurately 
            assess benefits after implementation.
            """,
            "metadata": {"plan_stage": "benefit_analysis", "change_type": "general"}
        },
        {
            "title": "Risk Analysis for Change Management",
            "content": """
            Risk Analysis in Pharmaceutical Change Management

            A comprehensive risk analysis is essential for any change in pharmaceutical manufacturing.

            Risk Assessment Process:
            1. Identify potential risks across categories:
               - Product quality risks
               - Patient safety risks
               - Regulatory compliance risks
               - Operational risks
               - Personnel risks
               - Supply chain risks
               - Business continuity risks

            2. Evaluate each risk using:
               - Probability (likelihood of occurrence)
               - Severity (impact if the risk materializes)
               - Detectability (ability to detect the risk before impact)

            3. Calculate Risk Priority Number (RPN):
               RPN = Probability × Severity × Detectability

            4. Prioritize risks based on RPN scores

            5. Develop mitigation strategies:
               - Accept (for low RPN risks)
               - Transfer (insurance, outsourcing)
               - Mitigate (reduce probability or severity)
               - Avoid (redesign change to eliminate risk)

            6. Create contingency plans for high-priority risks

            7. Implement monitoring mechanisms to track risks during implementation

            Risk assessment should be updated throughout the change implementation process as 
            new information becomes available.
            """,
            "metadata": {"plan_stage": "risk_analysis", "change_type": "general"}
        },
        {
            "title": "Process Change Implementation Guide",
            "content": """
            Process Change Implementation Guide for Pharmaceutical Manufacturing

            Implementing process changes in GMP environments requires careful planning and validation.

            Implementation Steps:
            1. Document current process (SOP, batch records, workflows)
            2. Create detailed implementation plan with specific milestones
            3. Develop validation protocol (IQ/OQ/PQ if applicable)
            4. Establish change control documentation
            5. Update affected documentation (batch records, SOPs, etc.)
            6. Train all affected personnel
            7. Implement change in phases if possible
            8. Monitor early batches/runs closely
            9. Collect data to verify effectiveness
            10. Conduct post-implementation review

            Validation Requirements:
            - Process validation plan
            - Risk assessment
            - Installation qualification (if equipment is involved)
            - Operational qualification
            - Performance qualification
            - Process verification runs

            Regulatory Considerations:
            - Determine if regulatory notification/approval is required
            - Prepare regulatory documentation
            - Consider if a CBE-30, CBE-0, or PAS is needed for FDA-regulated products
            - Maintain compliance with 21 CFR Part 211 (or applicable regulations)

            Remember that process changes in pharmaceutical manufacturing must be approached with scientific 
            rigor and thorough documentation.
            """,
            "metadata": {"plan_stage": "implementation", "change_type": "process"}
        },
        {
            "title": "Technological Change Planning Guide",
            "content": """
            Technological Change Planning Guide for Pharmaceutical Manufacturing

            Implementing new technology in pharmaceutical manufacturing environments requires specialized planning.

            Key Planning Components:
            1. System requirements specification
            2. User requirements specification
            3. Functional requirements specification
            4. Design specifications
            5. Risk assessment (including data integrity considerations)
            6. Validation master plan
            7. Implementation strategy (phased vs. cutover approach)
            8. Testing strategy (including UAT)
            9. Training plan
            10. Data migration plan (if applicable)
            11. Backup and recovery procedures
            12. Go-live checklist
            13. Post-implementation support plan

            Computer System Validation:
            - GAMP 5 categorization
            - 21 CFR Part 11 compliance assessment
            - Data integrity controls
            - Audit trail implementation
            - System security planning
            - Disaster recovery planning

            Infrastructure Considerations:
            - Hardware requirements
            - Network requirements
            - Interfaces with other systems
            - Performance requirements
            - Backup and archive requirements

            Technology implementation should follow a V-model validation approach with appropriate documentation 
            at each stage.
            """,
            "metadata": {"plan_stage": "general", "change_type": "technological"}
        },
        {
            "title": "Organizational Structure Change Planning",
            "content": """
            Organizational Structure Change Planning in Pharmaceutical Manufacturing

            Restructuring in pharmaceutical organizations requires careful planning to maintain compliance and operations.

            Key Planning Elements:
            1. Current and future organizational charts
            2. Gap analysis of roles and responsibilities
            3. Impact assessment on:
               - Quality systems
               - Batch release processes
               - GMP responsibilities
               - Regulatory commitments
               - Ongoing projects
            4. Transition timing and phasing
            5. Training needs analysis
            6. Knowledge transfer plan
            7. Communication strategy

            Regulatory Considerations:
            - Updates to site master file
            - Changes to authorized personnel
            - Notification to regulatory authorities if required
            - Updates to organizational elements in regulatory submissions

            GMP Continuity Planning:
            - Ensuring continued GMP oversight during transition
            - Maintaining clear responsibility assignments
            - Interim arrangements documentation
            - QA/QC continuity plans

            It's critical to ensure that quality responsibilities are clearly defined throughout 
            the transition period.
            """,
            "metadata": {"plan_stage": "general", "change_type": "structural"}
        },
        {
            "title": "Communication Planning for Change Initiatives",
            "content": """
            Communication Planning for Pharmaceutical Manufacturing Changes

            Effective communication is critical to successful change implementation in pharmaceutical environments.

            Communication Plan Components:
            1. Stakeholder analysis
               - Identify all stakeholders affected by or influencing the change
               - Assess their importance and influence
               - Determine information needs for each group

            2. Key messages by stakeholder group
               - What they need to know
               - Why they need to know it
               - How it impacts them specifically

            3. Communication channels
               - Formal presentations
               - Training sessions
               - Department meetings
               - One-on-one discussions
               - Email updates
               - Intranet/SharePoint sites
               - Visual management boards

            4. Communication timeline
               - Initial announcement
               - Regular progress updates
               - Implementation milestones
               - Post-implementation review

            5. Feedback mechanisms
               - Q&A sessions
               - Feedback forms
               - Focus groups
               - Open forums

            6. Communication roles and responsibilities
               - Who delivers which messages
               - Who answers questions

            Communication should be two-way, allowing for questions and concerns to be addressed throughout 
            the change process.
            """,
            "metadata": {"plan_stage": "communication", "change_type": "general"}
        },
        {
            "title": "Change Description Template",
            "content": """
            Change Description Template for Pharmaceutical Manufacturing

            A comprehensive change description is essential for effective planning and communication.

            Change Title: [Brief, descriptive title]

            Change Category: [Process/Equipment/Technological/Organizational/Facility/Other]

            Change Owner: [Name, title, contact information]

            Background:
            [Concise description of the current situation and why change is needed]

            Proposed Change:
            [Detailed description of what is changing, being specific about the scope]

            Business Justification:
            [Clear explanation of why this change is necessary, including business drivers]

            Objectives and Expected Benefits:
            [Specific, measurable objectives and quantified benefits where possible]

            Scope:
            [What is included and excluded from the change]

            Impact Assessment:
            [Departments, processes, systems, documents, and people affected]

            Timeline:
            [Major milestones and target completion date]

            Resource Requirements:
            [Personnel, budget, equipment, and other resources needed]

            Risk Assessment Summary:
            [Overview of key risks and mitigation strategies]

            Success Criteria:
            [How will we know the change was successful?]

            Approvals Required:
            [List of required approvals and sign-offs]

            This template provides a structured framework for clearly articulating the proposed change
            and its implications.
            """,
            "metadata": {"plan_stage": "general", "change_type": "general"}
        },
        {
            "title": "Cultural Change Assessment Framework",
            "content": """
            Cultural Change Assessment Framework for Pharmaceutical Organizations

            Cultural changes in pharmaceutical manufacturing require special attention to behaviors and mindsets.

            Assessment Areas:
            1. Current Cultural State
               - Dominant values and beliefs
               - Decision-making approaches
               - Risk tolerance
               - Innovation attitudes
               - Collaboration patterns
               - Quality mindset
               - Compliance approach (letter vs. spirit)

            2. Desired Future State
               - Target values and behaviors
               - Decision-making models
               - Collaborative practices
               - Leadership behaviors
               - Quality and compliance mindset

            3. Gap Analysis
               - Behavior gaps
               - Systems reinforcing current culture
               - Policies and processes needing alignment
               - Leadership capability gaps

            4. Cultural Levers
               - Leadership actions and role modeling
               - Recognition and reward systems
               - Performance management alignment
               - Communication patterns
               - Symbolic actions
               - Physical environment changes

            Cultural change requires consistent messaging, role modeling from leaders at all levels, 
            and alignment of systems and processes to reinforce desired behaviors.
            """,
            "metadata": {"plan_stage": "assessment", "change_type": "cultural"}
        },
        {
            "title": "Cost-Benefit Analysis Template",
            "content": """
            Cost-Benefit Analysis Template for Pharmaceutical Manufacturing Changes

            A structured approach to calculating and presenting the costs and benefits of proposed changes.

            COSTS
            One-time Costs:
            - Equipment purchase: $
            - Installation: $
            - Validation: $
            - Training: $
            - Documentation updates: $
            - Consultant fees: $
            - Regulatory submissions: $
            - Other one-time costs: $
            Total One-time Costs: $

            Recurring Costs:
            - Maintenance: $/year
            - Calibration: $/year
            - Additional staffing: $/year
            - Consumables: $/year
            - Licensing/subscription: $/year
            - Other recurring costs: $/year
            Total Annual Recurring Costs: $/year

            BENEFITS
            Quantifiable Benefits:
            - Labor savings: $/year
            - Material savings: $/year
            - Reduced investigations: $/year
            - Reduced batch rejections: $/year
            - Increased throughput value: $/year
            - Energy savings: $/year
            - Reduced testing: $/year
            - Other savings: $/year
            Total Annual Benefits: $/year

            Non-quantifiable Benefits:
            [List with importance rating (High/Medium/Low)]
            - Improved compliance posture: [H/M/L]
            - Enhanced data integrity: [H/M/L]
            - Better employee satisfaction: [H/M/L]
            - Reduced compliance risk: [H/M/L]
            - Other benefits: [H/M/L]

            Financial Analysis:
            - Payback period: [months]
            - Net Present Value (NPV): $
            - Internal Rate of Return (IRR): %
            - Return on Investment (ROI): %

            This template provides a comprehensive framework for analyzing the financial 
            implications of a proposed change.
            """,
            "metadata": {"plan_stage": "benefit_analysis", "change_type": "general"}
        }
    ]
    
    # Convert to Document objects with metadata
    from langchain.schema.document import Document
    
    documents = []
    for doc in planning_docs:
        metadata = doc.get("metadata", {"plan_stage": "general", "change_type": "general"})
        document = Document(
            page_content=doc["content"],
            metadata=metadata
        )
        documents.append(document)
    
    return documents

def save_to_json(documents, output_file="app/data/change_planning_documents.json"):
    """Save processed documents to JSON for later use."""
    serialized_docs = []
    
    for doc in documents:
        serialized_doc = {
            "page_content": doc.page_content,
            "metadata": doc.metadata
        }
        serialized_docs.append(serialized_doc)
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(serialized_docs, f, indent=2)
    
    print(f"Saved {len(serialized_docs)} processed documents to {output_file}")
    return True

def prepare_change_planning_data():
    """Prepare data for the change planning knowledge base."""
    # Load documents from resources folder
    print("Loading documents from resources/change_planning directory...")
    loaded_docs = load_change_planning_documents()
    print(f"Loaded {len(loaded_docs)} documents from PDF files")
    
    # Create default change planning documents if no external docs found
    if not loaded_docs:
        print("No external documents found, creating baseline knowledge...")
        base_docs = create_change_planning_documents()
        loaded_docs.extend(base_docs)
        print(f"Created {len(base_docs)} baseline document chunks")
    
    # Split documents into chunks
    print("Splitting documents into chunks...")
    chunked_docs = split_documents(loaded_docs)
    print(f"Created {len(chunked_docs)} document chunks")
    
    # Save processed documents to JSON
    print("Saving processed documents...")
    save_to_json(chunked_docs)
    
    return True

if __name__ == "__main__":
    prepare_change_planning_data() 