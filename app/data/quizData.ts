// Quiz questions about AI tools and technologies
export const quizQuestions = [
  {
    id: 1,
    question: "Which of the following is NOT a common application of natural language processing (NLP)?",
    options: [
      "Sentiment analysis",
      "Speech recognition",
      "Cryptocurrency mining",
      "Machine translation"
    ],
    correctAnswer: 2, // Index of the correct answer (0-based)
    explanation: "Cryptocurrency mining is primarily a computational process that involves validating transactions and adding them to the blockchain. It doesn't typically involve natural language processing technologies."
  },
  {
    id: 2,
    question: "What is prompt engineering in the context of AI?",
    options: [
      "Writing code that makes AI models run faster",
      "Crafting effective inputs to get desired outputs from AI models",
      "Designing hardware for AI processing",
      "The process of training an AI model from scratch"
    ],
    correctAnswer: 1,
    explanation: "Prompt engineering refers to the process of carefully designing and refining text prompts to effectively communicate with AI models to produce the desired outputs."
  },
  {
    id: 3,
    question: "Which is a key ethical concern when implementing AI in pharmaceutical companies?",
    options: [
      "Making AI interfaces too colorful",
      "Data privacy and security",
      "Using too many cloud servers",
      "Having AI with voice capabilities"
    ],
    correctAnswer: 1,
    explanation: "Data privacy and security are critical ethical concerns in pharmaceutical companies, as they often deal with sensitive patient information and proprietary research data."
  },
  {
    id: 4,
    question: "What is 'hallucination' in the context of generative AI?",
    options: [
      "When AI models produce false or misleading information presented as fact",
      "When AI becomes self-aware",
      "A technique for generating images",
      "When AI models need to be restarted"
    ],
    correctAnswer: 0,
    explanation: "AI 'hallucination' occurs when models generate content that appears plausible but contains factual errors or completely fabricated information not supported by their training data."
  },
  {
    id: 5,
    question: "Which of these is NOT a typical use case for AI in pharmaceutical research?",
    options: [
      "Drug discovery",
      "Clinical trial design",
      "Replacing human scientists entirely",
      "Predicting drug interactions"
    ],
    correctAnswer: 2,
    explanation: "While AI assists scientists in many tasks, it is designed to augment human capabilities rather than replace scientists entirely. The human element remains crucial for creativity, ethical oversight, and complex decision-making."
  },
  {
    id: 6,
    question: "What does RAG stand for in the context of AI systems?",
    options: [
      "Reactive Automation Generation",
      "Retrieval Augmented Generation",
      "Random Access Gateway",
      "Responsive AI Graphics"
    ],
    correctAnswer: 1,
    explanation: "Retrieval Augmented Generation (RAG) is an AI framework that combines retrieval of relevant information from a knowledge base with text generation, improving factuality and relevance of AI outputs."
  },
  {
    id: 7,
    question: "Which statement about AI implementation is most accurate?",
    options: [
      "AI implementation should completely replace existing workflows",
      "AI should only be used for simple administrative tasks",
      "AI implementation is most effective when it augments human capabilities",
      "AI systems rarely need human oversight once deployed"
    ],
    correctAnswer: 2,
    explanation: "Successful AI implementation typically augments human capabilities rather than replacing them entirely, creating a collaborative human-AI workflow that leverages the strengths of both."
  },
  {
    id: 8,
    question: "What is a key benefit of implementing AI in change management processes?",
    options: [
      "Eliminating the need for human managers",
      "Making decisions without human input",
      "Providing data-driven insights to inform decision-making",
      "Reducing the company headcount"
    ],
    correctAnswer: 2,
    explanation: "AI can analyze large volumes of data to provide valuable insights that help human leaders make more informed decisions during change management initiatives."
  },
  {
    id: 9,
    question: "Which approach is recommended when introducing AI tools to a team unfamiliar with AI?",
    options: [
      "Implement all AI tools at once for maximum impact",
      "Start with simple, high-value use cases and gradually expand",
      "Let each team member decide which AI tools to use",
      "Wait until all team members are AI experts before implementing"
    ],
    correctAnswer: 1,
    explanation: "A gradual approach that begins with simple, high-value use cases allows team members to build familiarity and confidence with AI tools before moving to more complex applications."
  },
  {
    id: 10,
    question: "What is a digital twin?",
    options: [
      "A backup AI system",
      "A virtual representation of a physical object or system",
      "A clone of a database",
      "Two identical AI models working in parallel"
    ],
    correctAnswer: 1,
    explanation: "A digital twin is a virtual representation of a physical object or system that serves as a real-time digital counterpart, enabling simulation, analysis, and optimization of the physical entity."
  }
];

// Mock user quiz data for the leaderboard
export const mockQuizUsers = [
  {
    id: "u1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    department: "Research",
    quizAttempts: 5,
    bestScore: 9,
    averageScore: 7.8,
    totalTimeTaken: 1250, // in seconds
    lastAttemptDate: "2024-05-10T15:30:00Z"
  },
  {
    id: "u2",
    name: "Michael Chen",
    email: "michael.c@example.com",
    department: "IT",
    quizAttempts: 3,
    bestScore: 10,
    averageScore: 8.7,
    totalTimeTaken: 840,
    lastAttemptDate: "2024-05-12T09:15:00Z"
  },
  {
    id: "u3",
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    department: "Manufacturing",
    quizAttempts: 4,
    bestScore: 8,
    averageScore: 7.0,
    totalTimeTaken: 1100,
    lastAttemptDate: "2024-05-08T14:20:00Z"
  },
  {
    id: "u4",
    name: "David Kim",
    email: "david.k@example.com",
    department: "Marketing",
    quizAttempts: 2,
    bestScore: 7,
    averageScore: 6.5,
    totalTimeTaken: 600,
    lastAttemptDate: "2024-05-15T11:45:00Z"
  },
  {
    id: "u5",
    name: "Priya Patel",
    email: "priya.p@example.com",
    department: "HR",
    quizAttempts: 6,
    bestScore: 9,
    averageScore: 8.2,
    totalTimeTaken: 1580,
    lastAttemptDate: "2024-05-14T16:10:00Z"
  },
  {
    id: "u6",
    name: "James Wilson",
    email: "james.w@example.com",
    department: "Sales",
    quizAttempts: 4,
    bestScore: 8,
    averageScore: 7.5,
    totalTimeTaken: 980,
    lastAttemptDate: "2024-05-11T10:30:00Z"
  },
  {
    id: "u7",
    name: "Olivia Garcia",
    email: "olivia.g@example.com",
    department: "Research",
    quizAttempts: 7,
    bestScore: 10,
    averageScore: 9.0,
    totalTimeTaken: 1750,
    lastAttemptDate: "2024-05-13T13:20:00Z"
  },
  {
    id: "u8",
    name: "Thomas Nguyen",
    email: "thomas.n@example.com",
    department: "Finance",
    quizAttempts: 3,
    bestScore: 7,
    averageScore: 6.3,
    totalTimeTaken: 840,
    lastAttemptDate: "2024-05-09T15:40:00Z"
  }
];

// User quiz records storage
let userQuizRecords: Record<string, {
  userId: string,
  attempts: Array<{
    date: string,
    score: number,
    timeTaken: number, // in seconds
    questionsAnswered: number,
    correctAnswers: number
  }>
}> = {};

// Helper functions for the quiz
export const getUserQuizStats = (userId: string) => {
  if (!userQuizRecords[userId]) {
    return {
      attempts: 0,
      bestScore: 0,
      averageScore: 0,
      totalTimeTaken: 0,
      lastAttemptDate: null
    };
  }

  const records = userQuizRecords[userId];
  const attempts = records.attempts.length;
  
  if (attempts === 0) {
    return {
      attempts: 0,
      bestScore: 0,
      averageScore: 0,
      totalTimeTaken: 0,
      lastAttemptDate: null
    };
  }

  const bestScore = Math.max(...records.attempts.map(a => a.score));
  const averageScore = records.attempts.reduce((sum, a) => sum + a.score, 0) / attempts;
  const totalTimeTaken = records.attempts.reduce((sum, a) => sum + a.timeTaken, 0);
  const lastAttemptDate = records.attempts[records.attempts.length - 1].date;

  return {
    attempts,
    bestScore,
    averageScore,
    totalTimeTaken,
    lastAttemptDate
  };
};

export const saveQuizAttempt = (
  userId: string, 
  score: number, 
  timeTaken: number, 
  questionsAnswered: number, 
  correctAnswers: number
) => {
  if (!userQuizRecords[userId]) {
    userQuizRecords[userId] = {
      userId,
      attempts: []
    };
  }

  userQuizRecords[userId].attempts.push({
    date: new Date().toISOString(),
    score,
    timeTaken,
    questionsAnswered,
    correctAnswers
  });

  // Return the updated stats
  return getUserQuizStats(userId);
};

export const getLeaderboard = () => {
  // Combine real user records with mock data
  const realUserEntries = Object.keys(userQuizRecords).map(userId => {
    const stats = getUserQuizStats(userId);
    return {
      id: userId,
      name: userId, // In a real app, you'd lookup the user's name
      email: userId, // In a real app, you'd lookup the user's email
      department: "User", // In a real app, you'd lookup the user's department
      quizAttempts: stats.attempts,
      bestScore: stats.bestScore,
      averageScore: stats.averageScore,
      totalTimeTaken: stats.totalTimeTaken,
      lastAttemptDate: stats.lastAttemptDate
    };
  });

  // Combine real user stats with mock data
  const allUsers = [...mockQuizUsers, ...realUserEntries];
  
  // Sort by best score (descending), then by average time (ascending)
  return allUsers.sort((a, b) => {
    if (b.bestScore !== a.bestScore) {
      return b.bestScore - a.bestScore;
    }
    // If scores are tied, sort by average time (faster is better)
    const aAvgTime = a.totalTimeTaken / a.quizAttempts;
    const bAvgTime = b.totalTimeTaken / b.quizAttempts;
    return aAvgTime - bAvgTime;
  });
}; 