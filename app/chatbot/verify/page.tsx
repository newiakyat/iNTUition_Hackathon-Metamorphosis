'use client';

import { useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, AlertTriangle, Loader2, Terminal } from "lucide-react";

export default function VerifyOllamaPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [ollamaInstalled, setOllamaInstalled] = useState<boolean | null>(null);
  const [ollamaRunning, setOllamaRunning] = useState<boolean | null>(null);
  const [adkarModelExists, setAdkarModelExists] = useState<boolean | null>(null);
  const [fastModelExists, setFastModelExists] = useState<boolean | null>(null);
  const [ultrafastModelExists, setUltrafastModelExists] = useState<boolean | null>(null);
  const [modelOutput, setModelOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const runVerification = async () => {
    setIsChecking(true);
    setError(null);
    setModelOutput(null);
    
    try {
      // Check if ollama is installed
      const ollamaCheck = await fetch('/api/adkar-chat/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'check-installation' })
      });
      
      const ollamaData = await ollamaCheck.json();
      setOllamaInstalled(ollamaData.installed);
      
      if (!ollamaData.installed) {
        setIsChecking(false);
        return;
      }
      
      // Check if ollama is running
      const runningCheck = await fetch('/api/adkar-chat/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'check-running' })
      });
      
      const runningData = await runningCheck.json();
      setOllamaRunning(runningData.running);
      
      if (!runningData.running) {
        setIsChecking(false);
        return;
      }
      
      // Check if models exist
      const modelCheck = await fetch('/api/adkar-chat/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'check-model' })
      });
      
      const modelData = await modelCheck.json();
      setAdkarModelExists(modelData.exists);
      setFastModelExists(modelData.fastModelExists || false);
      setUltrafastModelExists(modelData.ultrafastModelExists || false);
      
      // Choose which model to test based on availability - prefer fastest available
      const modelToTest = modelData.ultrafastModelExists ? 'adkar_ultrafast' : 
                           (modelData.fastModelExists ? 'adkar_fast' : 
                             (modelData.exists ? 'adkar' : null));
      
      if (modelToTest) {
        // Test the model with a simple prompt
        const testResponse = await fetch('/api/adkar-chat/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            action: 'test-model',
            model: modelToTest
          })
        });
        
        const testData = await testResponse.json();
        setModelOutput(testData.output);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsChecking(false);
    }
  };
  
  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return null;
    if (status === true) return <Check className="text-green-500" />;
    return <AlertTriangle className="text-amber-500" />;
  };
  
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
        <h1 className="text-3xl font-bold mb-6">Verify Ollama Setup</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verify Ollama and ADKAR Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="mb-4">
                Click the button below to verify that Ollama is properly installed and check the availability of ADKAR models.
              </p>
              
              <Button 
                onClick={runVerification} 
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Terminal className="mr-2 h-4 w-4" />
                    Run Verification
                  </>
                )}
              </Button>
            </div>
            
            {(ollamaInstalled !== null || error) && (
              <div className="space-y-4 mt-6 border-t pt-4">
                <h3 className="font-medium text-lg mb-2">Verification Results</h3>
                
                {error && (
                  <div className="bg-red-100 p-3 rounded-md text-red-800 text-sm">
                    <p className="font-medium">Error:</p>
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={ollamaInstalled} />
                    <span>Ollama installation: {ollamaInstalled === null ? 'Checking...' : ollamaInstalled ? 'Installed ✓' : 'Not installed ✗'}</span>
                  </div>
                  
                  {ollamaInstalled && (
                    <div className="flex items-center gap-2">
                      <StatusIcon status={ollamaRunning} />
                      <span>Ollama service: {ollamaRunning === null ? 'Checking...' : ollamaRunning ? 'Running ✓' : 'Not running ✗'}</span>
                    </div>
                  )}
                  
                  {ollamaRunning && (
                    <div className="border rounded-md p-3 mt-2 bg-gray-50">
                      <h4 className="font-medium mb-2">Available Models:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={adkarModelExists} />
                          <span>ADKAR model (Llama): {adkarModelExists === null ? 'Checking...' : adkarModelExists ? 'Available ✓' : 'Not found ✗'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StatusIcon status={fastModelExists} />
                          <span>ADKAR Fast (Phi): {fastModelExists === null ? 'Checking...' : fastModelExists ? 'Available ✓' : 'Not found ✗'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StatusIcon status={ultrafastModelExists} />
                          <span>ADKAR Ultra-Fast (Gemma): {ultrafastModelExists === null ? 'Checking...' : ultrafastModelExists ? 'Available ✓' : 'Not found ✗'}</span>
                        </div>
                        
                        {(!fastModelExists || !ultrafastModelExists) && (
                          <div className="pt-2 mt-2 border-t flex gap-2 items-center">
                            {!fastModelExists && !ultrafastModelExists && (
                              <div className="text-sm text-muted-foreground mr-2">Set up faster models:</div>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/chatbot/setup/small-model">Model Setup Guide</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/chatbot/setup/fast-model-script">Get Setup Scripts</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {modelOutput && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Model Test Output:</h4>
                    <div className="bg-muted p-3 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">{modelOutput}</pre>
                    </div>
                  </div>
                )}
                
                {(!ollamaInstalled || !ollamaRunning || !adkarModelExists) && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Next Steps:</h4>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <ul className="list-disc ml-5 space-y-1 text-sm">
                        {!ollamaInstalled && (
                          <li>Install Ollama from <a href="https://ollama.ai" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">ollama.ai</a></li>
                        )}
                        {ollamaInstalled && !ollamaRunning && (
                          <li>Start the Ollama service by running <code className="bg-gray-100 px-1 rounded">ollama serve</code> in your terminal</li>
                        )}
                        {ollamaRunning && !adkarModelExists && (
                          <li>Follow the <Link href="/chatbot/setup" className="text-blue-600 hover:underline">setup instructions</Link> to create the ADKAR model</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 