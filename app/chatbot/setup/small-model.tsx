import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, FileDown, Terminal } from "lucide-react";

export default function SmallModelSetupPage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chatbot/setup" className="flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Setup
          </Link>
        </Button>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Fast Model Setup</h1>
        <p className="text-muted-foreground mb-6">
          Configure a lightweight, fast-responding model for the ADKAR chatbot
        </p>

        <section className="mb-8">
          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Terminal className="mr-2 h-5 w-5 text-blue-600" />
              Automated Setup Scripts
            </h2>
            <p className="mb-4">
              For the quickest setup, we've created ready-to-use shell scripts that will automatically install the models for you.
            </p>
            <div className="flex gap-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/chatbot/setup/fast-model-script" className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Get Setup Scripts
                </Link>
              </Button>
            </div>
          </Card>
        </section>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">Option 1: Phi-2 (Recommended for Speed)</h2>
            <Card className="p-6">
              <p className="mb-4">
                Phi-2 is a small but capable 2.7B parameter model that offers the best balance of speed and quality.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Step 1: Pull Phi-2 model</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">ollama pull phi</code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This downloads the Phi-2 model (~1.7GB) which is much smaller than Llama3.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Step 2: Create a specialized ADKAR Modelfile</h3>
                  <p className="mb-2">Create a file named <code>Modelfile.adkar_phi</code> with the following content:</p>
                  <div className="bg-muted p-3 rounded-md overflow-auto max-h-64">
                    <pre className="text-sm">{`FROM phi

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_predict 256
PARAMETER repeat_penalty 1.1

SYSTEM """
You are an expert in the ADKAR change management model, designed to help organizations implement successful change.
Provide concise, brief, and actionable advice on these ADKAR stages:

- Awareness: Help understand why change is needed
- Desire: Build motivation for change
- Knowledge: Information needed for change
- Ability: Develop skills and behaviors
- Reinforcement: Methods to sustain change

Keep responses short, practical and focused on the specific stage.
"""
`}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Step 3: Create the fast ADKAR model</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">ollama create adkar_fast -f Modelfile.adkar_phi</code>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                  <h4 className="font-medium flex items-center mb-2">
                    <Zap className="text-amber-500 mr-2 h-4 w-4" />
                    Performance Note
                  </h4>
                  <p className="text-sm">
                    This model will be significantly faster than Llama3 or other larger models, 
                    with response times typically under 5 seconds on most hardware.
                  </p>
                </div>
              </div>
            </Card>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Option 2: Gemma 2B</h2>
            <Card className="p-6">
              <p className="mb-4">
                Gemma 2B is an ultra-lightweight model from Google that's extremely fast.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Step 1: Pull Gemma 2B model</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">ollama pull gemma:2b</code>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Step 2: Create a Modelfile</h3>
                  <p className="mb-2">Create a file named <code>Modelfile.adkar_gemma</code> with the following content:</p>
                  <div className="bg-muted p-3 rounded-md overflow-auto max-h-64">
                    <pre className="text-sm">{`FROM gemma:2b

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_predict 256
PARAMETER repeat_penalty 1.1

SYSTEM """
You are an expert in the ADKAR change management model, designed to help organizations implement successful change.
Provide concise, brief, and actionable advice on these ADKAR stages:

- Awareness: Help understand why change is needed
- Desire: Build motivation for change
- Knowledge: Information needed for change
- Ability: Develop skills and behaviors
- Reinforcement: Methods to sustain change

Keep responses short, practical and focused on the specific stage.
"""
`}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Step 3: Create the ultra-fast ADKAR model</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">ollama create adkar_ultrafast -f Modelfile.adkar_gemma</code>
                  </div>
                </div>
              </div>
            </Card>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Using Your Fast Model</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Option 1: Update API Endpoint</h3>
                  <p>Edit the file <code>app/api/adkar-chat/route.ts</code> and change the model name:</p>
                  <div className="bg-muted p-3 rounded-md overflow-auto mt-2">
                    <pre className="text-sm">{`// Look for this line
const ollamaProcess = spawn('ollama', [
  'run', 
  'adkar', // Change this to 'adkar_fast' or 'adkar_ultrafast'
  '--nowordwrap',
  prompt
]);`}</pre>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    Also update <code>app/api/adkar-chat/stream/route.ts</code> and <code>app/api/adkar-chat/verify/route.ts</code> with the same change.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Option 2: Test via CLI first</h3>
                  <p>Try the model directly in the terminal to check speed:</p>
                  <div className="bg-muted p-3 rounded-md overflow-auto mt-2">
                    <code className="text-sm">ollama run adkar_fast "What is the Awareness stage of ADKAR?"</code>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button asChild>
                    <Link href="/chatbot">
                      Go to Chatbot
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
} 