'use client';

import { useState, useEffect } from 'react';
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
import { BookOpen, File, Bookmark, ArrowLeft, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function UserResourcesPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  
  // Redirect if user is an admin (resources only for regular users)
  useEffect(() => {
    if (isAdmin) {
      router.push('/admin/resources');
    }
  }, [isAdmin, router]);
  
  const faqItems = [
    {
      question: "How can I start using AI tools to improve my work efficiency?",
      answer: "Begin by familiarizing yourself with the AI tools available within your organization. Participate in training sessions or workshops that introduce you to AI applications relevant to your role. Start with simple tasks and gradually move to more complex ones as you become more comfortable with the technology."
    },
    {
      question: "What are some common AI tools used in the pharmaceutical industry?",
      answer: "Common AI tools include predictive analytics for drug discovery, machine learning algorithms for data analysis, and automation tools for streamlining processes. Additionally, AI-powered chatbots can assist with customer service and internal queries."
    },
    {
      question: "How can I improve my engineering skills to better utilize AI tools?",
      answer: "Enhance your engineering skills by:\n\n• Continuous Learning: Engage in online courses or workshops focused on AI and data science.\n\n• Practical Experience: Apply AI tools to real-world projects to gain hands-on experience.\n\n• Collaboration: Work with colleagues who have experience with AI to learn from their insights."
    },
    {
      question: "What role does data quality play in using AI effectively?",
      answer: "High-quality data is crucial for AI tools to function effectively. Ensure that data is accurate, complete, and well-organized. Implement data validation processes to maintain data integrity and regularly review data for inconsistencies."
    },
    {
      question: "How can I stay updated with the latest AI trends and technologies?",
      answer: "Stay updated by:\n\n• Industry Reports: Read industry reports and research papers on AI advancements.\n\n• Webinars and Conferences: Attend webinars and conferences focused on AI in the pharmaceutical sector.\n\n• Professional Networks: Engage with professionals in AI and pharmaceuticals through networking platforms."
    },
    {
      question: "What are some common challenges when adopting AI, and how can I overcome them?",
      answer: "Common challenges include resistance to change, data privacy concerns, and technical difficulties. Overcome these by:\n\n• Clear Communication: Communicate the benefits of AI clearly to colleagues.\n\n• Training and Support: Ensure adequate training and support for using AI tools.\n\n• Feedback Mechanisms: Establish feedback loops to address technical issues promptly."
    },
    {
      question: "How can AI enhance collaboration within teams?",
      answer: "AI can enhance collaboration by:\n\n• Automating Routine Tasks: Freeing up time for more strategic discussions.\n\n• Data-Driven Insights: Providing data-driven insights that inform team decisions.\n\n• Virtual Collaboration Tools: Facilitating remote collaboration through AI-powered communication platforms."
    },
    {
      question: "What are some best practices for integrating AI into my daily workflow?",
      answer: "Best practices include:\n\n• Start Small: Begin with simple AI applications and gradually scale up.\n\n• Monitor Progress: Regularly assess the impact of AI on your workflow.\n\n• Continuous Learning: Stay updated with new AI tools and techniques."
    },
    {
      question: "How can I ensure that AI tools are used ethically and responsibly?",
      answer: "Ensure ethical use by:\n\n• Understanding AI Limitations: Recognize the limitations and potential biases of AI tools.\n\n• Data Privacy: Adhere to data privacy regulations and guidelines.\n\n• Transparency: Maintain transparency in how AI tools are used and their impact on decision-making."
    },
    {
      question: "What resources are available to help me develop my skills in AI and engineering?",
      answer: "Resources include:\n\n• Internal Training Programs: Utilize training programs offered by your organization.\n\n• Online Courses: Engage with online platforms like Coursera, edX, and Udemy.\n\n• Professional Communities: Join professional communities and forums focused on AI and engineering."
    }
  ];

  // If user is admin, don't render the content
  if (isAdmin) {
    return null;
  }

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
              <h1 className="text-3xl font-bold">Resources</h1>
            </div>
            
            <Card className="mb-8 border-purple-200 bg-purple-50/30">
              <CardHeader className="bg-purple-100/50 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-purple-900">
                    FAQ: Adopting AI and Improving Efficiency in the Pharmaceutical Industry
                  </CardTitle>
                </div>
                <CardDescription className="text-purple-700">
                  A practical guide to help employees adopt AI and enhance engineering skills
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