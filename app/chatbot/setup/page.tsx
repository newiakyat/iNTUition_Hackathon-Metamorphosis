import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Terminal, Zap, FileDown } from "lucide-react";

export default function ChatbotSetupPage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chatbot" className="flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Chatbot
          </Link>
        </Button>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">ADKAR Chatbot Setup</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-medium mb-2 flex items-center">
            <Zap className="h-5 w-5 text-amber-500 mr-2" />
            Speed Up Your Chatbot
          </h2>
          <p className="mb-3">
            If you're experiencing slow response times, you can set up a much smaller and faster model with our automated scripts:
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/chatbot/setup/small-model">Fast Model Guide</Link>
            </Button>
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/chatbot/setup/fast-model-script">
                <FileDown className="h-4 w-4" />
                Get Setup Scripts
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">Prerequisites</h2>
            <Card className="p-6">
              <ol className="list-decimal ml-6 space-y-3">
                <li>
                  <strong>Install Ollama:</strong> The chatbot requires Ollama to be installed on your server.
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <Download size={16} />
                        Download Ollama
                      </a>
                    </Button>
                  </div>
                </li>
                <li>
                  <strong>Start Ollama:</strong> Make sure the Ollama service is running on your server.
                  <div className="mt-2 bg-muted p-2 rounded-md">
                    <code className="text-sm">ollama serve</code>
                  </div>
                </li>
              </ol>
            </Card>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Model Setup</h2>
            <Card className="p-6">
              <p className="mb-4">
                To create the ADKAR model in Ollama, follow these steps:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Step 1: Download a base model</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">ollama pull llama3</code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    You can use other models like gemma, mistral, or phi as the base.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Step 2: Create the Modelfile</h3>
                  <p className="mb-2">Create a file named <code>Modelfile.adkar</code> with the following content:</p>
                  <div className="bg-muted p-3 rounded-md overflow-auto max-h-64">
                    <pre className="text-sm">{`FROM llama3

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 2048
PARAMETER repeat_penalty 1.1

SYSTEM """
You are an expert in the ADKAR change management model, designed to help organizations implement successful change. 
You provide thoughtful, practical advice on each stage of ADKAR:

- Awareness: Help users understand the need for change
- Desire: Strategies to build motivation for change
- Knowledge: Information and training needed for change
- Ability: How to develop skills and behaviors
- Reinforcement: Methods to sustain change

Provide concise, actionable advice tailored to the specific ADKAR stage the user is asking about.
Be brief but comprehensive, focusing on practical steps rather than theory.
"""
`}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Step 3: Create the ADKAR model</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">ollama create adkar -f Modelfile.adkar</code>
                  </div>
                </div>
              </div>
            </Card>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Verify Installation</h2>
            <Card className="p-6">
              <p className="mb-4">
                To verify that the ADKAR model is installed and working correctly:
              </p>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-1">Check if the model is listed:</p>
                  <div className="bg-muted p-2 rounded-md">
                    <code className="text-sm">ollama list</code>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-1">Test the model with a simple prompt:</p>
                  <div className="bg-muted p-2 rounded-md">
                    <code className="text-sm">ollama run adkar "What is the first stage of ADKAR?"</code>
                  </div>
                </div>

                <div className="pt-3 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    You can also use our automated verification tool:
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/chatbot/verify">Verify Installation</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Using the Chatbot</h2>
            <Card className="p-6">
              <p className="mb-4">
                Once the model is set up, return to the chatbot page. The web interface will automatically connect to your local Ollama instance and use the ADKAR model.
              </p>
              
              <div className="mt-4">
                <Button asChild>
                  <Link href="/chatbot">
                    Go to Chatbot
                  </Link>
                </Button>
              </div>
            </Card>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Performance Optimization</h2>
            <Card className="p-6">
              <p className="mb-4">
                If the chatbot is generating responses too slowly, try these optimization techniques:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">1. Use a smaller/faster base model</h3>
                  <p>Instead of llama3, consider using a smaller and faster model like:</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><code>phi:latest</code> - Smaller and faster than Llama3</li>
                    <li><code>gemma:2b</code> - Very small and quick model</li>
                    <li><code>llama3:8b</code> - Smaller variant of Llama3</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">2. Adjust the model parameters</h3>
                  <p>Add the following parameters to your Modelfile for faster generation:</p>
                  <div className="bg-muted p-2 rounded-md mt-2">
                    <pre className="text-sm">{`PARAMETER num_predict 256    # Limit token generation
PARAMETER num_ctx 2048      # Reasonable context window
PARAMETER top_k 40          # Reduce sampling space`}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">3. Run Ollama with GPU acceleration</h3>
                  <p>If you have a compatible NVIDIA GPU, Ollama will automatically use it for faster inference.</p>
                  <p className="text-sm text-muted-foreground mt-1">Make sure you have the appropriate NVIDIA drivers and CUDA installed.</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">4. Quantize your model</h3>
                  <p>When pulling the base model, use a quantized version:</p>
                  <div className="bg-muted p-2 rounded-md mt-2">
                    <code className="text-sm">ollama pull llama3:8b-q4_0</code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">The q4_0 suffix indicates 4-bit quantization, which is much faster but slightly less accurate.</p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
} 