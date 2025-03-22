"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/AuthContext";
import QuizContent from "@/components/quiz/QuizContent";
import Leaderboard from "@/components/quiz/Leaderboard";
import PersonalStats from "@/components/quiz/PersonalStats";
import { Trophy, LineChart, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuizPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("quiz");

  // Redirect admins away from the quiz page
  useEffect(() => {
    if (isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);

  if (isAdmin) {
    return null; // Don't render anything for admins while redirecting
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">AI Skills Quiz</h1>
              <p className="text-muted-foreground mt-2">
                Test your knowledge of AI tools and technologies used in pharmaceutical industry.
              </p>
            </div>

            <Tabs defaultValue="quiz" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>Take Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Leaderboard</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span>My Stats</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quiz" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Knowledge Quiz</CardTitle>
                    <CardDescription>
                      Test your understanding of AI concepts and tools in just 10 questions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QuizContent 
                      userId={user?.id || user?.email || "anonymous"} 
                      onComplete={() => setActiveTab("stats")}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaderboard">
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Leaderboard</CardTitle>
                    <CardDescription>
                      See how you rank against your colleagues.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Leaderboard currentUserId={user?.id || user?.email || "anonymous"} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats">
                <Card>
                  <CardHeader>
                    <CardTitle>My Quiz Statistics</CardTitle>
                    <CardDescription>
                      Track your performance and progress over time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PersonalStats userId={user?.id || user?.email || "anonymous"} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 