import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }
    
    // Check if Ollama is installed
    if (action === 'check-installation') {
      try {
        const result = await executeCommand('ollama', ['--version']);
        return NextResponse.json({ installed: result.success });
      } catch (error) {
        return NextResponse.json({ installed: false });
      }
    }
    
    // Check if Ollama is running
    if (action === 'check-running') {
      try {
        const result = await executeCommand('ollama', ['list']);
        return NextResponse.json({ running: result.success });
      } catch (error) {
        return NextResponse.json({ running: false });
      }
    }
    
    // Check if the ADKAR model exists
    if (action === 'check-model') {
      try {
        const result = await executeCommand('ollama', ['list']);
        
        if (!result.success) {
          return NextResponse.json({ exists: false });
        }
        
        const output = result.output;
        const models = output.split('\n').slice(1); // Skip header row
        
        // Check if any model name contains "adkar"
        const adkarExists = models.some(model => 
          model.toLowerCase().includes('adkar')
        );
        
        // Check specifically for the fast model
        const fastModelExists = models.some(model => 
          model.toLowerCase().includes('adkar_fast')
        );

        // Check specifically for the ultrafast model
        const ultrafastModelExists = models.some(model => 
          model.toLowerCase().includes('adkar_ultrafast')
        );
        
        return NextResponse.json({ 
          exists: adkarExists,
          fastModelExists: fastModelExists,
          ultrafastModelExists: ultrafastModelExists
        });
      } catch (error) {
        return NextResponse.json({ exists: false });
      }
    }
    
    // Test the ADKAR model with a simple prompt
    if (action === 'test-model') {
      try {
        console.log("Starting test-model action...");
        const requestData = await request.json();
        console.log("Request data:", requestData);
        
        const modelToUse = requestData.model || 'adkar_fast'; // Default to the fast model
        console.log("Using model:", modelToUse);
        
        const testPrompt = "What is the ADKAR change management model?";
        console.log("About to run command with:", modelToUse, testPrompt);
        
        // First check if the model exists
        const modelCheckResult = await executeCommand('ollama', ['list']);
        console.log("Model check result:", modelCheckResult);
        
        if (!modelCheckResult.success) {
          return NextResponse.json({ 
            success: false, 
            output: `Failed to check if model exists: ${modelCheckResult.error}`
          });
        }
        
        // Convert to lowercase for case-insensitive matching
        const modelList = modelCheckResult.output.toLowerCase();
        if (!modelList.includes(modelToUse.toLowerCase())) {
          return NextResponse.json({ 
            success: false, 
            output: `Model "${modelToUse}" not found in Ollama. Available models: ${modelCheckResult.output}`
          });
        }
        
        // Try with direct API call instead
        try {
          console.log("Attempting direct API call to Ollama");
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: modelToUse,
              prompt: testPrompt,
              stream: false
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ 
              success: false, 
              directApi: true,
              output: `API error: ${errorText}`
            });
          }
          
          const data = await response.json();
          console.log("API response:", data);
          
          return NextResponse.json({ 
            success: true,
            directApi: true,
            output: data.response || "No response from API"
          });
        } catch (apiError) {
          console.error("API error:", apiError);
          // Fall back to command line approach
        }
        
        // If API call failed, try command line
        console.log("Falling back to command line execution");
        const result = await executeCommand('ollama', [
          'run', 
          modelToUse, 
          '--nowordwrap',
          testPrompt
        ], 15000); // Increased timeout to 15 seconds
        
        console.log("Command execution result:", result);
        
        if (!result.success) {
          return NextResponse.json({ 
            success: false, 
            output: `Failed to execute test: ${result.error}`,
            debug: { modelToUse, result }
          });
        }
        
        return NextResponse.json({ 
          success: true, 
          output: result.output,
          debug: { modelToUse, commandResult: result }
        });
      } catch (error) {
        console.error("Test-model error:", error);
        return NextResponse.json({ 
          success: false, 
          output: `Error testing model: ${error instanceof Error ? error.message : String(error)}`,
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error}` },
      { status: 500 }
    );
  }
}

// Helper function to execute commands with timeout
async function executeCommand(command: string, args: string[], timeoutMs = 5000): Promise<{ success: boolean; output: string; error?: string }> {
  return new Promise((resolve) => {
    const process = spawn(command, args);
    
    let output = '';
    let errorOutput = '';
    let timeoutId: NodeJS.Timeout;
    
    // Set timeout
    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        process.kill();
        resolve({ 
          success: false, 
          output: '',
          error: 'Command execution timed out' 
        });
      }, timeoutMs);
    }
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    process.on('close', (code) => {
      if (timeoutMs > 0) {
        clearTimeout(timeoutId);
      }
      
      resolve({
        success: code === 0,
        output: output.trim(),
        error: errorOutput.trim()
      });
    });
  });
} 