"use client";

import { useState, useEffect } from "react";
import { getUserQuizStats } from "@/app/data/quizData";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { 
  Award, 
  Clock, 
  BarChart3, 
  Brain, 
  CheckCircle,
  ArrowUp,
  Calendar 
} from "lucide-react";

interface PersonalStatsProps {
  userId: string;
}

export default function PersonalStats({ userId }: PersonalStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Get the user's quiz statistics
    const userStats = getUserQuizStats(userId);
    setStats(userStats);
    
    // Refresh stats every 5 seconds (in case they complete a quiz in another tab)
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [userId, refreshKey]);
  
  // Format time function
  const formatTime = (seconds: number) => {
    if (!seconds) return "N/A";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds} seconds`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Generate chart data
  const getChartData = () => {
    if (!stats || stats.attempts === 0) {
      return [
        {
          name: "No Data",
          score: 0,
          avgTimePerQuestion: 0
        }
      ];
    }
    
    // In a real app, we would have attempt history data to show trends
    // For now, we'll create some mock data based on the current stats
    return [
      {
        name: "Your Best",
        score: stats.bestScore,
        avgTimePerQuestion: stats.totalTimeTaken / stats.attempts / 10
      },
      {
        name: "Your Average",
        score: stats.averageScore,
        avgTimePerQuestion: stats.totalTimeTaken / stats.attempts / 10
      },
      {
        name: "Global Average",
        score: 7.2, // Mock global average
        avgTimePerQuestion: 18 // Mock global average time per question
      }
    ];
  };
  
  if (!stats) {
    return <div>Loading stats...</div>;
  }
  
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Best Score</p>
                <h3 className="text-2xl font-bold">
                  {stats.attempts > 0 ? stats.bestScore : "N/A"}/10
                </h3>
              </div>
              <Award className="h-8 w-8 text-primary/70" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Average Score</p>
                <h3 className="text-2xl font-bold">
                  {stats.attempts > 0 ? stats.averageScore.toFixed(1) : "N/A"}/10
                </h3>
              </div>
              <BarChart3 className="h-8 w-8 text-primary/70" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Quizzes Completed</p>
                <h3 className="text-2xl font-bold">{stats.attempts}</h3>
              </div>
              <CheckCircle className="h-8 w-8 text-primary/70" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Time Stats</h3>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-sm text-muted-foreground">Total Time</span>
                  <span className="font-medium">{formatTime(stats.totalTimeTaken)}</span>
                </div>
                
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-sm text-muted-foreground">Average Time per Quiz</span>
                  <span className="font-medium">
                    {stats.attempts > 0 
                      ? formatTime(Math.floor(stats.totalTimeTaken / stats.attempts)) 
                      : "N/A"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Average Time per Question</span>
                  <span className="font-medium">
                    {stats.attempts > 0 
                      ? formatTime(Math.floor(stats.totalTimeTaken / stats.attempts / 10)) 
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Quiz History</h3>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              
              {stats.attempts === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>You haven't taken any quizzes yet.</p>
                  <p className="text-xs mt-1">Complete a quiz to see your history.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-sm text-muted-foreground">First Quiz Taken</span>
                    <span className="font-medium">
                      {/* In a real app, we would track this */}
                      {formatDate(stats.lastAttemptDate)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-sm text-muted-foreground">Last Quiz Taken</span>
                    <span className="font-medium">{formatDate(stats.lastAttemptDate)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-muted-foreground">Improvement Trend</span>
                    <span className="font-medium flex items-center gap-1 text-green-600">
                      <ArrowUp className="h-4 w-4" />
                      {/* In a real app, we would calculate this */}
                      15% better
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Chart */}
      {stats.attempts > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Performance Comparison</h3>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getChartData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="score" name="Score (out of 10)" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="avgTimePerQuestion" name="Avg. Time per Question (seconds)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 