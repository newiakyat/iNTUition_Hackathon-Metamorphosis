import AdkarChat from "@/components/AdkarChat";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Settings, AlertTriangle } from "lucide-react";

export default function ChatbotPage() {
  return (
    <div className="container py-10">
      <div className="mb-6 flex justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/chatbot/verify" className="flex items-center gap-1">
              <AlertTriangle size={16} />
              Troubleshoot
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link href="/chatbot/setup" className="flex items-center gap-1">
              <Settings size={16} />
              Setup Instructions
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold">ADKAR Change Management Assistant</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get expert guidance through each stage of organizational change using the ADKAR framework: 
            Awareness, Desire, Knowledge, Ability, and Reinforcement.
          </p>
        </div>
        
        <AdkarChat />
        
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-3">About ADKAR</h2>
          <p className="mb-4">
            The ADKAR model is a change management framework that helps organizations successfully implement change by focusing on five key building blocks:
          </p>
          
          <dl className="space-y-3">
            <div>
              <dt className="font-medium">Awareness</dt>
              <dd className="text-sm ml-4">Help stakeholders understand why change is necessary</dd>
            </div>
            <div>
              <dt className="font-medium">Desire</dt>
              <dd className="text-sm ml-4">Build motivation and willingness to support the change</dd>
            </div>
            <div>
              <dt className="font-medium">Knowledge</dt>
              <dd className="text-sm ml-4">Provide information and training on how to change</dd>
            </div>
            <div>
              <dt className="font-medium">Ability</dt>
              <dd className="text-sm ml-4">Develop skills and behaviors needed to implement the change</dd>
            </div>
            <div>
              <dt className="font-medium">Reinforcement</dt>
              <dd className="text-sm ml-4">Sustain the change through recognition, rewards, and feedback</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 