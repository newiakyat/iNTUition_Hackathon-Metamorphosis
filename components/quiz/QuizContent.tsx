"use client";

import { useState, useEffect, useCallback } from "react";
import { quizQuestions } from "@/app/data/quizData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveQuizAttempt } from "@/app/data/quizData";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import confetti from 'canvas-confetti';

interface QuizContentProps {
  userId: string;
  onComplete: () => void;
}

export default function QuizContent({ userId, onComplete }: QuizContentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timeDisplay, setTimeDisplay] = useState("00:00");
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const { toast } = useToast();

  // Start the timer when the component mounts
  useEffect(() => {
    // Reset everything when the component mounts
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCompleted(false);
    setScore(0);
    setCorrectAnswers(0);
    
    // Start the timer
    const now = Date.now();
    setStartTime(now);
    
    // Set up interval to update elapsed time
    const timer = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - now) / 1000);
      setElapsedTime(elapsed);
      
      // Format time as MM:SS
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setTimeDisplay(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Current question
  const currentQuestion = quizQuestions[currentQuestionIndex];
  
  // Progress percentage
  const progress = (currentQuestionIndex / quizQuestions.length) * 100;
  
  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
  };
  
  // Handle submitting the answer
  const handleSubmitAnswer = () => {
    if (selectedOption === null) {
      toast({
        title: "Please select an answer",
        description: "You need to select an option before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnswered(true);
    
    // Check if answer is correct
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };
  
  // Handle moving to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz completed
      finishQuiz();
    }
  };
  
  // Finish the quiz
  const finishQuiz = useCallback(() => {
    // Stop the timer
    const finishTime = Date.now();
    setEndTime(finishTime);
    
    // Calculate total time
    const totalTime = Math.floor((finishTime - startTime) / 1000);
    
    // Calculate score (out of 10)
    const calculatedScore = Math.round((correctAnswers / quizQuestions.length) * 10);
    setScore(calculatedScore);
    
    // Save the attempt
    saveQuizAttempt(
      userId,
      calculatedScore,
      totalTime,
      quizQuestions.length,
      correctAnswers
    );
    
    setIsCompleted(true);
    
    // Show success message
    toast({
      title: "Quiz Completed!",
      description: `You scored ${calculatedScore} out of 10 (${correctAnswers} correct answers)`,
    });
    
    // Trigger confetti if score is good
    if (calculatedScore >= 7) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
  }, [correctAnswers, startTime, toast, userId]);
  
  // If quiz is completed, show the result
  if (isCompleted) {
    return (
      <div className="space-y-8 py-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Quiz Completed!</h2>
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>Time taken: {timeDisplay}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center mt-6">
            <div className="text-5xl font-bold mb-2">
              {score}/10
            </div>
            <p className="text-muted-foreground">
              You got {correctAnswers} out of {quizQuestions.length} questions correct.
            </p>
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCompleted(false);
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setIsAnswered(false);
                setScore(0);
                setCorrectAnswers(0);
                setStartTime(Date.now());
              }}
            >
              Try Again
            </Button>
            <Button onClick={onComplete}>
              View My Stats
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Progress and timer */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1}/{quizQuestions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{timeDisplay}</span>
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      {/* Question */}
      <div className="py-4">
        <h3 className="text-xl font-medium mb-6">{currentQuestion.question}</h3>
        
        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all
                ${
                  selectedOption === index
                    ? isAnswered
                      ? index === currentQuestion.correctAnswer
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                      : "bg-primary/5 border-primary/20"
                    : "hover:bg-accent"
                }
                ${
                  isAnswered && index === currentQuestion.correctAnswer
                    ? "bg-green-50 border-green-200"
                    : ""
                }
              `}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`
                    flex items-center justify-center w-6 h-6 rounded-full shrink-0
                    ${
                      selectedOption === index
                        ? isAnswered
                          ? index === currentQuestion.correctAnswer
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                    ${
                      isAnswered && index === currentQuestion.correctAnswer
                        ? "bg-green-500 text-white"
                        : ""
                    }
                  `}
                >
                  {isAnswered ? (
                    index === currentQuestion.correctAnswer ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : selectedOption === index ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + index) // A, B, C, D
                    )
                  ) : (
                    String.fromCharCode(65 + index) // A, B, C, D
                  )}
                </div>
                <span className={`flex-1 ${selectedOption === index ? 'font-medium' : ''}`}>
                  {option}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Explanation (Only shown after answering) */}
        {isAnswered && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {selectedOption === currentQuestion.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="font-medium mb-1">
                  {selectedOption === currentQuestion.correctAnswer
                    ? "Correct!"
                    : "Incorrect"}
                </p>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {!isAnswered ? (
          <Button onClick={handleSubmitAnswer}>Submit Answer</Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
} 