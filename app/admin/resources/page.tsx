'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/sidebar';
import { useAuth } from '@/lib/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, File, Bookmark, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  
  // Redirect if user isn't an admin (extra protection)
  if (!isAdmin) {
    router.push('/unauthorized');
    return null;
  }
  
  const faqItems = [
    {
      question: "What are the key drivers of change in the pharmaceutical industry today?",
      answer: "The pharmaceutical industry is experiencing significant changes driven by technological advancements such as AI, digital health, and personalized medicine. Market trends like global competition and evolving patient needs also play a crucial role. Additionally, regulatory shifts, including data privacy and compliance requirements, necessitate adaptability."
    },
    {
      question: "How can we prepare our organization for technological changes like AI and digital health?",
      answer: "Preparing for technological changes involves several steps:\n\n• Assessment: Evaluate current capabilities and identify areas where AI and digital health can enhance operations.\n\n• Strategic Planning: Develop a comprehensive plan to integrate these technologies, focusing on employee training and process updates.\n\n• Pilot Projects: Implement pilot projects to test new technologies and refine strategies before full-scale adoption.\n\n• Continuous Monitoring: Regularly assess the impact of new technologies and adjust strategies as needed."
    },
    {
      question: "What role does leadership play in managing change?",
      answer: "Leadership is pivotal in managing change by setting a clear vision and communicating it effectively to all stakeholders. Leaders must foster a culture of adaptability, empower teams to innovate, and lead by example. They should also ensure that change initiatives align with organizational goals and values."
    },
    {
      question: "How can we ensure employee engagement during change initiatives?",
      answer: "Ensuring employee engagement involves:\n\n• Early Involvement: Involve employees in the planning process to ensure they understand the reasons for change.\n\n• Clear Communication: Provide transparent and regular updates about the change process.\n\n• Training and Support: Offer necessary training and support to develop new skills.\n\n• Recognition and Rewards: Recognize and reward employees who champion change efforts."
    },
    {
      question: "What strategies can we use to manage resistance to change?",
      answer: "Managing resistance involves:\n\n• Understanding Resistance: Identify the sources of resistance, such as fear or lack of understanding.\n\n• Communication: Clearly communicate the benefits and reasons for change.\n\n• Involvement: Involve employees in decision-making processes to build ownership.\n\n• Support Mechanisms: Provide support through training, coaching, and feedback."
    },
    {
      question: "How can we measure the success of change initiatives?",
      answer: "Measuring success involves:\n\n• Setting Clear Metrics: Establish specific, measurable goals and KPIs at the outset.\n\n• Regular Monitoring: Track progress regularly using data analytics.\n\n• Feedback Loops: Use feedback from stakeholders to adjust strategies as needed.\n\n• Continuous Evaluation: Regularly assess whether goals are being met and make necessary adjustments."
    },
    {
      question: "What role does continuous learning play in adapting to market trends?",
      answer: "Continuous learning is crucial for staying ahead of market trends. It involves:\n\n• Professional Development: Encourage ongoing training and workshops.\n\n• Industry Insights: Provide access to industry reports and research.\n\n• Innovation Culture: Foster a culture that values experimentation and innovation."
    },
    {
      question: "How can we balance the need for innovation with regulatory compliance?",
      answer: "Balancing innovation with compliance requires:\n\n• Early Engagement: Involve compliance experts early in the innovation process.\n\n• Regulatory Alignment: Ensure that new technologies or processes meet regulatory standards from the outset.\n\n• Risk Assessment: Conduct thorough risk assessments to identify potential compliance issues."
    },
    {
      question: "What tools or frameworks can we use to manage change effectively?",
      answer: "Effective change management can be supported by frameworks like ADKAR for individual change and Kotter's 8-Step Change Model for organizational change. Technology tools such as project management software and AI-driven analytics can also facilitate change initiatives by providing insights and streamlining processes."
    },
    {
      question: "How can we sustain change over time?",
      answer: "Sustaining change involves:\n\n• Reinforcement: Consistently reinforce new behaviors and processes.\n\n• Ongoing Communication: Continue to communicate the value of change.\n\n• Recognition: Recognize and reward achievements related to change.\n\n• Adaptability: Remain adaptable and willing to adjust strategies as needed to address emerging challenges."
    }
  ];

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">Admin Resources</h1>
            </div>
            
            <Card className="mb-8 border-purple-200 bg-purple-50/30">
              <CardHeader className="bg-purple-100/50 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-purple-900">
                    FAQ: Navigating Change in the Pharmaceutical Industry
                  </CardTitle>
                </div>
                <CardDescription className="text-purple-700">
                  A comprehensive guide to help management navigate industry changes effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className="border-b border-purple-200"
                    >
                      <AccordionTrigger className="text-purple-800 hover:text-purple-900 hover:no-underline py-4">
                        <div className="flex items-start gap-2 text-left">
                          <Bookmark className="h-5 w-5 min-w-5 mt-0.5 text-purple-500" />
                          <span>Q{index + 1}: {item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-purple-900 bg-purple-50/50 p-4 rounded-md mt-2 mb-3 whitespace-pre-line">
                        <div className="flex gap-2">
                          <File className="h-5 w-5 min-w-5 mt-0.5 text-purple-500" />
                          <span>A{index + 1}: {item.answer}</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 