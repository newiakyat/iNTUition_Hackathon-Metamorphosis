/**
 * Assistant Routes
 * Handle API endpoints for the assistant
 */

const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');

// API Status endpoint
router.get('/api/status', assistantController.getApiStatus);

// Assistant info endpoint
router.get('/api/assistant/info', assistantController.getAssistantInfo);

// Chat endpoints
router.post('/api/chat', assistantController.processMessage);

// Verify assistant type endpoints (both GET and POST for flexibility)
router.post('/api/verify-assistant', assistantController.verifyAssistantType);
router.get('/api/verify-assistant', assistantController.verifyAssistantType);

// Warm up endpoint (optional: used to preload specific assistant types)
router.post('/api/warmup', (req, res) => {
  const typeToWarmUp = req.body.assistantType;
  const warmUpAll = req.body.all === true;
  
  // Log the warmup request
  console.log(`Warming up assistant service: ${warmUpAll ? 'ALL TYPES' : typeToWarmUp || 'default'}`);
  
  // In a real implementation, this would initialize backend services 
  // for the specified assistant type
  
  res.json({
    status: 'success',
    message: `Assistant service initialized successfully`,
    types: warmUpAll ? Object.values(assistantController.ASSISTANT_TYPES) : 
          (typeToWarmUp ? [typeToWarmUp] : ['default'])
  });
});

module.exports = router; 