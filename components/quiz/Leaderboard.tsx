"use client";

import { useState, useEffect } from "react";
import { getLeaderboard } from "@/app/data/quizData";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Trophy, 
  Medal, 
  Clock, 
  User, 
  Database, 
  Search 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface LeaderboardProps {
  currentUserId: string;
}

export default function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Get the leaderboard data
    const data = getLeaderboard();
    setLeaderboardData(data);
    setFilteredData(data);
  }, [refreshKey]);
  
  // Filter the data when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(leaderboardData);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = leaderboardData.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.department.toLowerCase().includes(query)
    );
    
    setFilteredData(filtered);
  }, [searchQuery, leaderboardData]);
  
  // Function to get rank badge
  const getRankBadge = (index: number) => {
    if (index === 0) {
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    } else if (index === 1) {
      return <Trophy className="h-5 w-5 text-slate-400" />;
    } else if (index === 2) {
      return <Trophy className="h-5 w-5 text-amber-600" />;
    }
    return index + 1;
  };
  
  // Function to format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Function to calculate average time per quiz
  const getAverageTime = (user: any) => {
    if (!user.quizAttempts || user.quizAttempts === 0) return "N/A";
    return formatTime(Math.floor(user.totalTimeTaken / user.quizAttempts));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {leaderboardData.length} participants
          </span>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or department"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Best Score</TableHead>
              <TableHead className="text-right">Avg. Score</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="text-right">Avg. Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((user, index) => (
              <TableRow 
                key={user.id}
                className={user.id === currentUserId ? "bg-primary/5" : ""}
              >
                <TableCell className="font-medium">
                  {getRankBadge(index)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.name}</span>
                    {user.id === currentUserId && (
                      <Badge variant="outline" className="ml-1 text-xs">You</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell className="text-right font-medium">
                  {user.bestScore}/10
                </TableCell>
                <TableCell className="text-right">
                  {user.averageScore.toFixed(1)}/10
                </TableCell>
                <TableCell className="text-right">
                  {user.quizAttempts}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{getAverageTime(user)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No results found. Try a different search query.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 