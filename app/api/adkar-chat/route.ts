import { NextResponse } from 'next/server';

// Ultra-simplified version of the API route
export async function POST(request: Request) {
  try {
    console.log("Starting ultra-simplified adkar-chat API request");
    // Clone the request to avoid "Body already read" errors
    const clonedRequest = request.clone();
    const requestBody = await clonedRequest.json();
    console.log("Request body:", requestBody);
    
    const { stage, question, model } = requestBody;
    
    if (!stage || !question) {
      console.log("Missing parameters", { stage, question });
      return NextResponse.json(
        { error: 'Missing stage or question parameter' },
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
    const modelToUse = model || 'adkar_fast';
    
    // Create a simple prompt
    const prompt = `As a change management assistant, help with the ${stageName} stage of ADKAR for the following: ${question}`;
    console.log(`Using model: ${modelToUse}, prompt: ${prompt.substring(0, 100)}...`);

    try {
      // Send request directly to Ollama API
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelToUse,
          prompt: prompt,
          stream: false
        })
      });
      
      if (!ollamaResponse.ok) {
        const errorText = await ollamaResponse.text();
        console.error("Ollama API error:", errorText);
        return NextResponse.json({ error: errorText }, { status: 500 });
      }

      const responseData = await ollamaResponse.json();
      if (!responseData.response) {
        console.error("No response in data:", responseData);
        return NextResponse.json({ error: "Empty response from model" }, { status: 500 });
      }
      
      console.log("Response received, length:", responseData.response.length);
      return NextResponse.json({ response: responseData.response });
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request parsing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
} 