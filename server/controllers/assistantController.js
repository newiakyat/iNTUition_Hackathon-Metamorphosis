/**
 * Assistant Controller
 * Handles different types of assistants based on the assistantType parameter
 */

// Constants for assistant types
const ASSISTANT_TYPES = {
  CHANGE_MANAGEMENT: 'changeManagement',
  CHANGE_PLANNING: 'changePlanning'
};

// Check if a given assistant type is valid
const isValidAssistantType = (type) => {
  return Object.values(ASSISTANT_TYPES).includes(type);
};

// Get default assistant type
const getDefaultAssistantType = () => {
  return ASSISTANT_TYPES.CHANGE_MANAGEMENT;
};

/**
 * Process the assistant type from the request
 * @param {Object} req - The request object
 * @returns {String} The assistant type
 */
const getAssistantTypeFromRequest = (req) => {
  // Check different locations for the assistant type parameter
  const assistantType = 
    (req.query && req.query.assistantType) || 
    (req.query && req.query.type) || 
    (req.query && req.query.assistant) ||
    (req.body && req.body.assistantType) ||
    (req.body && req.body.type) ||
    (req.body && req.body.data && req.body.data.assistantType);
  
  // Validate the assistant type
  if (assistantType && isValidAssistantType(assistantType)) {
    return assistantType;
  }
  
  // Return default if no valid type found
  return getDefaultAssistantType();
};

/**
 * Get assistant information
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAssistantInfo = (req, res) => {
  const assistantType = getAssistantTypeFromRequest(req);
  
  // Return different information based on assistant type
  switch (assistantType) {
    case ASSISTANT_TYPES.CHANGE_PLANNING:
      return res.json({
        type: ASSISTANT_TYPES.CHANGE_PLANNING,
        name: 'Change Planning Assistant',
        description: 'Advanced planning tools for organizational change management',
        version: '1.0.0'
      });
    
    case ASSISTANT_TYPES.CHANGE_MANAGEMENT:
    default:
      return res.json({
        type: ASSISTANT_TYPES.CHANGE_MANAGEMENT,
        name: 'Change Management Assistant',
        description: 'Get help with managing change processes and implementation',
        version: '1.0.0'
      });
  }
};

/**
 * API status endpoint
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getApiStatus = (req, res) => {
  const assistantType = getAssistantTypeFromRequest(req);
  const assistantName = assistantType === ASSISTANT_TYPES.CHANGE_PLANNING ? 
    'Change Planning Assistant' : 'Change Management Assistant';
  
  res.json({
    status: 'online',
    message: `${assistantName} API is running`,
    assistantType: assistantType,
    request_origin: req.headers.origin || 'unknown'
  });
};

/**
 * Process assistant chat message
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const processMessage = (req, res) => {
  const assistantType = getAssistantTypeFromRequest(req);
  const message = req.body.message || '';
  
  // Check if this is an identity question
  const isIdentityQuestion = message.toLowerCase().includes('who are you') || 
                            message.toLowerCase().includes('what assistant') ||
                            message.toLowerCase().includes('what are you');
  
  // If asking about identity, return clear information about which assistant is responding
  if (isIdentityQuestion) {
    if (assistantType === ASSISTANT_TYPES.CHANGE_PLANNING) {
      return res.json({
        response: "I am the Change Planning Assistant. I can help with planning organizational changes, identifying stakeholders, creating change roadmaps, and developing strategic change initiatives.",
        assistantType: ASSISTANT_TYPES.CHANGE_PLANNING
      });
    } else {
      return res.json({
        response: "I am the Change Management Assistant. I can help with implementing changes, managing stakeholder communication, addressing resistance to change, and supporting employees through transitions.",
        assistantType: ASSISTANT_TYPES.CHANGE_MANAGEMENT
      });
    }
  }
  
  // Otherwise process the message according to assistant type
  // In a real implementation, this would call the appropriate LLM or service
  if (assistantType === ASSISTANT_TYPES.CHANGE_PLANNING) {
    return res.json({
      response: `[Change Planning Assistant] Processing your message: "${message}"`,
      assistantType: ASSISTANT_TYPES.CHANGE_PLANNING
    });
  } else {
    return res.json({
      response: `[Change Management Assistant] Processing your message: "${message}"`,
      assistantType: ASSISTANT_TYPES.CHANGE_MANAGEMENT
    });
  }
};

/**
 * Verify which assistant is active
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const verifyAssistantType = (req, res) => {
  const assistantType = getAssistantTypeFromRequest(req);
  const assistantName = assistantType === ASSISTANT_TYPES.CHANGE_PLANNING ? 
    'Change Planning Assistant' : 'Change Management Assistant';
  
  res.json({
    active: true,
    assistantType: assistantType,
    name: assistantName,
    message: `You are currently using the ${assistantName}`
  });
};

module.exports = {
  ASSISTANT_TYPES,
  getAssistantInfo,
  getApiStatus,
  processMessage,
  verifyAssistantType,
  getAssistantTypeFromRequest
}; 