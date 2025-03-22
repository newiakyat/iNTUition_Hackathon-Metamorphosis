/**
 * Assistant API Server
 * Main entry point for the Assistant API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const assistantRoutes = require('./routes/assistantRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (widgets)
app.use('/widgets', express.static(path.join(__dirname, 'widgets')));

// Use assistant routes
app.use(assistantRoutes);

// Modify existing widget HTML files to support assistantType
app.use((req, res, next) => {
  if (req.path.includes('widget.html')) {
    const assistantController = require('./controllers/assistantController');
    const assistantType = assistantController.getAssistantTypeFromRequest(req);
    
    // Add assistantType to any iframe-based widgets
    res.header('X-Assistant-Type', assistantType);
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Assistant API server running on port ${PORT}`);
}); 