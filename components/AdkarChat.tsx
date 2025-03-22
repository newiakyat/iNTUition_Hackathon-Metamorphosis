'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Zap, ZapOff, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Utility function for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 90000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out. The model is taking too long to respond.');
    }
    throw error;
  }
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type AdkarStage = '1' | '2' | '3' | '4' | '5';

const stageInfo = {
  '1': {
    name: 'Awareness',
    description: 'Understanding why the change is needed'
  },
  '2': {
    name: 'Desire',
    description: 'Motivation to support the change'
  },
  '3': {
    name: 'Knowledge',
    description: 'Information about how to change'
  },
  '4': {
    name: 'Ability',
    description: 'Skills to implement the change'
  },
  '5': {
    name: 'Reinforcement',
    description: 'Sustaining the change'
  }
};

const examplePrompts: Record<AdkarStage, string[]> = {
  '1': [
    "We're implementing a new ERP system in 3 months, but employees aren't seeing the need for it.",
    "How do I help my team understand the importance of our new data privacy policy?",
    "Our department needs to restructure, but people don't see why the old structure doesn't work."
  ],
  '2': [
    "Our team understands why we need the new process, but they aren't motivated to adopt it.",
    "How can I get buy-in from middle managers who are resistant to the new org structure?",
    "My employees know we need to improve quality control, but see it as extra work."
  ],
  '3': [
    "What specific training should we provide for our team transitioning to a new CRM?",
    "What information do employees need before we switch to a remote-first model?",
    "How should we document our new approval process to ensure everyone follows it?"
  ],
  '4': [
    "Our team has completed training on the new software, but they're struggling to apply it.",
    "What tools can help employees build confidence using our new project management system?",
    "How do we help remote workers develop skills for effective virtual collaboration?"
  ],
  '5': [
    "How can we ensure our recent process changes stick long-term?",
    "What metrics should we track to verify our new safety protocols are being followed?",
    "How can we recognize and reward employees who consistently adopt the new workflow?"
  ]
};

export default function AdkarChat() {
  const [activeStage, setActiveStage] = useState<AdkarStage>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useStreaming, setUseStreaming] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('adkar_ultrafast');
  const [modelStatus, setModelStatus] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    // Get input information
    const question = inputValue.trim();
    const endpoint = useStreaming ? '/api/adkar-chat/stream' : '/api/adkar-chat';
    console.log(`Using ${useStreaming ? 'streaming' : 'regular'} endpoint (${endpoint}) with model: ${selectedModel}`);
    console.log(`Question: "${question.length > 50 ? question.substring(0, 50) + '...' : question}"`);
    
    // Add an initial assistant message that will be updated as streaming occurs
    if (useStreaming) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '' }
      ]);
    }
    
    try {
      const startTime = Date.now();
      
      if (useStreaming) {
        // Streaming approach
        console.log("Making streaming request...");
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            stage: activeStage,
            question: question,
            model: selectedModel
          })
        });
        
        console.log(`Stream response received in ${Date.now() - startTime}ms, status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Stream error:", response.status, errorText);
          throw new Error(errorText || `Error: ${response.status} ${response.statusText}`);
        }
        
        const reader = response.body?.getReader();
        if (!reader) {
          console.error("Response body is null");
          throw new Error('Response body is null');
        }
        
        const decoder = new TextDecoder();
        let streamedContent = '';
        let receivedChunks = 0;
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log(`Stream complete after ${receivedChunks} chunks, total length: ${streamedContent.length}`);
              break;
            }
            
            // Decode the chunk and append to content
            const chunk = decoder.decode(value, { stream: true });
            receivedChunks++;
            
            if (!chunk || chunk.length === 0) {
              console.log("Received empty chunk");
              continue;
            }
            
            console.log(`Chunk ${receivedChunks}: "${chunk.length > 50 ? chunk.substring(0, 50) + '...' : chunk}" (${chunk.length} chars)`);
            
            // Check if chunk contains an error message from the server
            if (chunk.includes("Error:")) {
              console.error("Error in stream chunk:", chunk);
              throw new Error(chunk.split("Error:")[1]?.trim() || "Unknown error from model");
            }
            
            streamedContent += chunk;
            
            // Update the last message content with the accumulated text
            setMessages(prev => {
              const newMessages = [...prev];
              if (newMessages.length > 0) {
                newMessages[newMessages.length - 1] = {
                  ...newMessages[newMessages.length - 1],
                  content: streamedContent
                };
              }
              return newMessages;
            });
          }
        } catch (streamError) {
          console.error("Error reading stream:", streamError);
          throw streamError;
        }
      } else {
        // Non-streaming approach
        console.log("Making regular request...");
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            stage: activeStage,
            question: question,
            model: selectedModel
          })
        });
        
        console.log(`Response received in ${Date.now() - startTime}ms, status: ${response.status}`);
        
        const contentType = response.headers.get("content-type");
        console.log("Response content type:", contentType);
        
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const textData = await response.text();
          console.error("Non-JSON response:", textData);
          throw new Error(`Unexpected response format: ${contentType || 'unknown'}`);
        }
        
        if (!response.ok) {
          console.error("API error:", data);
          throw new Error(data.error || `Failed with status: ${response.status}`);
        }
        
        if (!data.response) {
          console.error("Missing response in data:", data);
          throw new Error("No response data received from API");
        }
        
        console.log(`Received response of length: ${data.response.length}`);
        
        // Add assistant message
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: data.response }
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Remove the empty assistant message if we're using streaming
      if (useStreaming) {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleStageChange = (value: string) => {
    setActiveStage(value as AdkarStage);
  };
  
  const handleExampleClick = (example: string) => {
    setInputValue(example);
  };
  
  const toggleStreaming = () => {
    setUseStreaming(!useStreaming);
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ADKAR Change Management Assistant</CardTitle>
            <CardDescription>
              Get help implementing organizational change with the ADKAR framework
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  <span className="hidden sm:inline">Model Settings</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Model Settings</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model-selector">Select Model</Label>
                    <Select
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                    >
                      <SelectTrigger id="model-selector">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adkar_ultrafast">
                          Gemma 2B (Ultra-Fast, Recommended)
                        </SelectItem>
                        <SelectItem value="adkar_fast">
                          Phi-2 (Faster, More Accurate)
                        </SelectItem>
                        <SelectItem value="adkar">
                          Llama3/Mistral (Slow, Most Detailed)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Faster models respond quicker but may be less detailed.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="streaming-mode" className="text-sm flex items-center gap-1">
                      {useStreaming ? <Zap className="h-3 w-3" /> : <ZapOff className="h-3 w-3" />}
                      Streaming Mode
                    </Label>
                    <Switch
                      id="streaming-mode"
                      checked={useStreaming}
                      onCheckedChange={toggleStreaming}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeStage} onValueChange={handleStageChange} className="flex-1 flex flex-col">
        <div className="px-6">
          <TabsList className="grid grid-cols-5 w-full">
            {Object.entries(stageInfo).map(([key, { name }]) => (
              <TabsTrigger key={key} value={key}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {Object.keys(stageInfo).map((stage) => (
          <TabsContent key={stage} value={stage} className="flex-1 flex flex-col px-6 mt-2">
            <CardContent className="flex-1 p-0">
              {isLoading && !useStreaming && (
                <div className="px-6 py-2 bg-muted text-xs flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Using {selectedModel} model - this may take a moment...</span>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-sm font-medium">{stageInfo[stage as AdkarStage].description}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {examplePrompts[stage as AdkarStage].map((example, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleExampleClick(example)}
                      className="text-xs"
                    >
                      {example.length > 40 ? example.substring(0, 40) + '...' : example}
                    </Button>
                  ))}
                </div>
              </div>
              
              <ScrollArea className="h-[340px] p-4 rounded-md border">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                            {index === messages.length - 1 && message.role === 'assistant' && message.content === '' && (
                              <span className="inline-flex items-center">
                                <Loader2 size={12} className="animate-spin mr-1" />
                                <span className="text-xs">
                                  Loading response from {selectedModel.replace('adkar_', '')} model...
                                </span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
                
                {isLoading && !useStreaming && (
                  <div className="flex justify-start mt-4">
                    <div className="bg-muted rounded-lg px-4 py-2 flex items-center space-x-2">
                      <Loader2 size={16} className="animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex flex-col justify-center items-center mt-4">
                    <div className="bg-red-100 text-red-800 rounded-lg px-4 py-3 mb-2 max-w-full overflow-auto">
                      <p className="text-sm font-medium mb-1">Error:</p>
                      <pre className="text-xs whitespace-pre-wrap break-words">{error}</pre>
                      
                      {error.includes('timed out') && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs">
                          <p className="font-medium text-amber-800 mb-1">💡 Why this happens & solutions</p>
                          <p className="mb-2">Large language models like {selectedModel} can take time to process complex questions. Try these solutions:</p>
                          <ul className="list-disc pl-4 mb-2 space-y-1">
                            <li>Use a faster model like <strong>adkar_ultrafast</strong> (Gemma 2B)</li>
                            <li>Ask shorter, more focused questions</li>
                            <li>Run the model directly with this command:</li>
                          </ul>
                          <div className="bg-slate-800 text-green-400 p-2 rounded font-mono text-[10px] sm:text-xs overflow-auto">
                            ollama run {selectedModel} "What is the {stageInfo[activeStage as AdkarStage].name} stage of ADKAR for: {inputValue}"
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSend}
                      className="mt-2"
                    >
                      Retry with {selectedModel}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Try with a different model if current one fails
                        if (selectedModel === 'adkar') setSelectedModel('adkar_fast');
                        else if (selectedModel === 'adkar_fast') setSelectedModel('adkar_ultrafast');
                        else setSelectedModel('adkar_fast');
                        
                        setTimeout(handleSend, 100);
                      }}
                      className="mt-2 ml-2"
                    >
                      Try with different model
                    </Button>
                    
                    {error && error.includes('timed out') && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedModel('adkar_ultrafast');
                          setTimeout(handleSend, 100);
                        }}
                        className="mt-2 ml-2 bg-green-600 hover:bg-green-700"
                      >
                        Use fastest model now
                      </Button>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="pt-4 pb-6 px-0">
              <div className="flex w-full gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask about ${stageInfo[stage as AdkarStage].name}...`}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send'}
                </Button>
              </div>
            </CardFooter>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
} 