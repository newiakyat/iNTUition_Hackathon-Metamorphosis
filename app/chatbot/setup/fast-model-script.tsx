'use client';

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Terminal, Check } from "lucide-react";

export default function FastModelScriptPage() {
  const [phiScriptCopied, setPhiScriptCopied] = useState(false);
  const [gemmaScriptCopied, setGemmaScriptCopied] = useState(false);

  const phiModelfileContent = `FROM phi

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
"""`;

  const gemmaModelfileContent = `FROM gemma:2b

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
"""`;

  const phiScript = `#!/bin/bash
# Script to set up the fast ADKAR model with Phi-2

# Create a temporary directory
mkdir -p adkar_setup
cd adkar_setup

# Create the Modelfile
cat > Modelfile.adkar_phi << 'EOL'
${phiModelfileContent}
EOL

# Pull the Phi model if needed
echo "Pulling Phi model (this may take a few minutes)..."
ollama pull phi

# Create the ADKAR fast model
echo "Creating ADKAR fast model..."
ollama create adkar_fast -f Modelfile.adkar_phi

echo "Setup complete! You can now use the adkar_fast model."`;

  const gemmaScript = `#!/bin/bash
# Script to set up the ultra-fast ADKAR model with Gemma 2B

# Create a temporary directory
mkdir -p adkar_setup
cd adkar_setup

# Create the Modelfile
cat > Modelfile.adkar_gemma << 'EOL'
${gemmaModelfileContent}
EOL

# Pull the Gemma model if needed
echo "Pulling Gemma 2B model (this may take a few minutes)..."
ollama pull gemma:2b

# Create the ADKAR ultrafast model
echo "Creating ADKAR ultrafast model..."
ollama create adkar_ultrafast -f Modelfile.adkar_gemma

echo "Setup complete! You can now use the adkar_ultrafast model."`;

  const copyToClipboard = (text: string, type: 'phi' | 'gemma') => {
    navigator.clipboard.writeText(text);
    if (type === 'phi') {
      setPhiScriptCopied(true);
      setTimeout(() => setPhiScriptCopied(false), 2000);
    } else {
      setGemmaScriptCopied(true);
      setTimeout(() => setGemmaScriptCopied(false), 2000);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chatbot/setup/small-model" className="flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Fast Model Setup
          </Link>
        </Button>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Fast Model Setup Scripts</h1>
        <p className="text-muted-foreground mb-6">
          Use these scripts to quickly set up the fast ADKAR models with just one command
        </p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">Phi-2 Fast Model Script</h2>
            <Card className="p-6">
              <div className="bg-muted p-4 rounded-md mb-4 relative overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">{phiScript}</pre>
                <div className="absolute top-2 right-2 space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(phiScript, 'phi')}
                    className="h-8 px-2"
                  >
                    {phiScriptCopied ? <Check className="h-4 w-4" /> : "Copy"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadFile(phiScript, 'setup_adkar_fast.sh')}
                    className="h-8 px-2"
                  >
                    <Download className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
              
              <div className="text-sm">
                <h3 className="font-medium mb-2">How to use:</h3>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Save the script as <code>setup_adkar_fast.sh</code></li>
                  <li>Make it executable with <code>chmod +x setup_adkar_fast.sh</code></li>
                  <li>Run the script: <code>./setup_adkar_fast.sh</code></li>
                </ol>
              </div>
            </Card>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Gemma 2B Ultra-Fast Model Script</h2>
            <Card className="p-6">
              <div className="bg-muted p-4 rounded-md mb-4 relative overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">{gemmaScript}</pre>
                <div className="absolute top-2 right-2 space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(gemmaScript, 'gemma')}
                    className="h-8 px-2"
                  >
                    {gemmaScriptCopied ? <Check className="h-4 w-4" /> : "Copy"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadFile(gemmaScript, 'setup_adkar_ultrafast.sh')}
                    className="h-8 px-2"
                  >
                    <Download className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
              
              <div className="text-sm">
                <h3 className="font-medium mb-2">How to use:</h3>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Save the script as <code>setup_adkar_ultrafast.sh</code></li>
                  <li>Make it executable with <code>chmod +x setup_adkar_ultrafast.sh</code></li>
                  <li>Run the script: <code>./setup_adkar_ultrafast.sh</code></li>
                </ol>
              </div>
            </Card>
          </section>
          
          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/chatbot/setup/small-model">
                Back to Setup Guide
              </Link>
            </Button>
            <Button asChild>
              <Link href="/chatbot">
                Go to Chatbot
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 