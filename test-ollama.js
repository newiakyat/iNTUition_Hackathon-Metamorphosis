// Simple script to test Ollama API directly
// Using dynamic import for fetch
async function testOllama() {
  try {
    // Import node-fetch dynamically
    const fetch = (await import('node-fetch')).default;
    
    console.log('Testing Ollama API...');
    
    // First check if Ollama server is running
    console.log('1. Checking if Ollama server is running...');
    try {
      const tagsResponse = await fetch('http://localhost:11434/api/tags');
      
      if (!tagsResponse.ok) {
        throw new Error(`Failed to connect to Ollama: ${tagsResponse.status} ${tagsResponse.statusText}`);
      }
      
      const tagsData = await tagsResponse.json();
      console.log('Ollama is running! Available models:');
      console.log(tagsData.models.map(m => m.name).join('\n'));
      
      // Test if adkar_fast model exists
      const adkarFastExists = tagsData.models.some(m => m.name.toLowerCase().includes('adkar_fast'));
      if (!adkarFastExists) {
        console.log('WARNING: adkar_fast model not found!');
      } else {
        console.log('adkar_fast model found!');
      }
    } catch (error) {
      console.error('Error checking Ollama server:', error.message);
      process.exit(1);
    }
    
    // Now test generation
    console.log('\n2. Testing generation with adkar_fast model...');
    try {
      const generateResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'adkar_fast',
          prompt: 'What is the ADKAR model? Answer in one sentence.',
          stream: false
        })
      });
      
      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        throw new Error(`Failed to generate: ${generateResponse.status} ${generateResponse.statusText} - ${errorText}`);
      }
      
      const generateData = await generateResponse.json();
      console.log('Generated response:');
      console.log(generateData.response);
      
      console.log('\nTest completed successfully!');
    } catch (error) {
      console.error('Error testing generation:', error.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testOllama(); 