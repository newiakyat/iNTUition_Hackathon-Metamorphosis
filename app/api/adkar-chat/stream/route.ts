// Remove the problematic import
// import { StreamingTextResponse } from 'next/streaming';

export async function POST(request: Request) {
  try {
    console.log("Starting simplified streaming API request");
    // Clone the request to avoid "Body already read" errors
    const clonedRequest = request.clone();
    const requestBody = await clonedRequest.json();
    console.log("Request body:", JSON.stringify(requestBody));
    
    const { stage, question, model } = requestBody;
    
    if (!stage || !question) {
      console.log("Missing parameters", { stage, question });
      return new Response(
        "Error: Missing stage or question parameter",
        { status: 400 }
      );
    }

    // Map stage number to stage name
    const stages: Record<string, string> = {
      "1": "Awareness",
      "2": "Desire",
      "3": "Knowledge",
      "4": "Ability",
      "5": "Reinforcement"
    };

    const stageName = stages[stage] || "General";
    console.log("Stage name:", stageName);
    
    // Model to use (default to the fast model)
    const modelToUse = model || 'adkar_fast';
    console.log("Using model:", modelToUse);

    // Create a simpler prompt
    const prompt = `As a change management assistant, help with the ${stageName} stage of ADKAR for the following: ${question}`;
    console.log("Using prompt:", prompt);

    // Use the Ollama API directly with streaming
    console.log("Creating stream from Ollama API");
    
    // Create a TransformStream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();
    
    // Start the request to Ollama in the background
    const ollamaPromise = fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelToUse,
        prompt: prompt,
        stream: true
      })
    }).then(async (ollamaResponse) => {
      console.log("Ollama stream response received:", ollamaResponse.status);
      
      if (!ollamaResponse.ok) {
        const errorText = await ollamaResponse.text();
        console.error("Ollama API error:", errorText);
        writer.write(encoder.encode("Error: " + errorText));
        writer.close();
        return;
      }
      
      if (!ollamaResponse.body) {
        console.error("Ollama response body is null");
        writer.write(encoder.encode("Error: Response body is null"));
        writer.close();
        return;
      }
      
      const reader = ollamaResponse.body.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log("Stream completed");
            break;
          }
          
          // Parse the chunk and extract just the response part
          const chunk = decoder.decode(value, { stream: true });
          console.log("Received chunk from Ollama:", chunk.substring(0, 50));
          
          try {
            // Ollama streaming returns JSON objects per line
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              const data = JSON.parse(line);
              if (data.response) {
                // Write just the token to the stream
                writer.write(encoder.encode(data.response));
              }
            }
          } catch (error) {
            console.error("Error processing chunk:", error);
            // If we can't parse it, just send the raw chunk
            writer.write(value);
          }
        }
      } catch (error) {
        console.error("Error reading stream:", error);
        writer.write(encoder.encode("Error reading from model: " + error.message));
      } finally {
        writer.close();
      }
    }).catch((error) => {
      console.error("Fetch error:", error);
      writer.write(encoder.encode("Error connecting to model: " + error.message));
      writer.close();
    });
    
    // Return the stream using standard Response API
    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return new Response(
      "Error: " + (error instanceof Error ? error.message : String(error)),
      { status: 500 }
    );
  }
} 