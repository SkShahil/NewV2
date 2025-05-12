import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Share2, Download, ArrowLeft, FileCheck, FileQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { generateQuizAttemptPDF, generateAnswerKeyPDF } from '@/lib/pdfGenerator';
import { safelyConvertFirestoreTimestamp, safelyFormatDate } from '@/lib/utils';

interface QuestionResult {
  questionId: string;
  question: string;
  options?: string[];
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  explanation?: string;
}

interface ResultsData {
  id: string;
  quizId: string;
  quizTitle: string;
  quizTopic?: string;
  quizType?: 'multiple-choice' | 'true-false' | 'short-answer' | 'auto';
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number | null;
  completedAt: Date;
  questions: QuestionResult[];
}

const Results = () => {
  const { attemptId } = useParams();
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ResultsData | null>(null);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (!currentUser) {
        navigate('/login');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchResults = async () => {
      if (!user || !attemptId) return;

      try {
        setLoading(true);
        const attemptRef = doc(db, 'quiz_attempts', attemptId);
        const attemptDoc = await getDoc(attemptRef);

        if (!attemptDoc.exists()) {
          toast({
            title: 'Results Not Found',
            description: 'Could not find the requested quiz results',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }

        const attemptData = attemptDoc.data();

        // Get quiz details to fetch questions
        const quizRef = doc(db, 'quizzes', attemptData.quizId);
        const quizDoc = await getDoc(quizRef);

        if (!quizDoc.exists()) {
          toast({
            title: 'Quiz Not Found',
            description: 'The associated quiz could not be found',
            variant: 'destructive',
          });
          return;
        }

        const quizData = quizDoc.data();
        const questions = quizData.questions;

        // Map answers to questions
        const questionResults: QuestionResult[] = attemptData.answers.map((answer: any) => {
          const question = questions.find((q: any) => q.id === answer.questionId);
          return {
            questionId: answer.questionId,
            question: question?.question || 'Question not found',
            userAnswer: answer.userAnswer,
            correctAnswer: question?.correctAnswer || '',
            isCorrect: answer.isCorrect,
            explanation: question?.explanation || '',
          };
        });

        setResults({
          id: attemptId,
          quizId: attemptData.quizId,
          quizTitle: quizData.title,
          userId: attemptData.userId,
          score: attemptData.score,
          totalQuestions: attemptData.totalQuestions,
          correctAnswers: attemptData.correctAnswers,
          timeTaken: attemptData.timeTaken,
          completedAt: safelyConvertFirestoreTimestamp(attemptData.completedAt),
          questions: questionResults,
        });
      } catch (error) {
        console.error('Error fetching results:', error);
        toast({
          title: 'Error',
          description: 'Failed to load quiz results',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId, authLoading, user, navigate, toast]);

  const handleShare = async () => {
    if (!results) return;

    try {
      const shareData = {
        title: `MindMash Quiz: ${results.quizTitle}`,
        text: `I scored ${results.score}% on the "${results.quizTitle}" quiz! Can you beat my score?`,
        url: `${window.location.origin}/challenge/create?quiz=${results.quizId}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`
        );
        toast({
          title: 'Link Copied!',
          description: 'Share link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Download attempted quiz as PDF
  const handleDownloadAttempt = () => {
    if (!results) return;
    
    try {
      // Convert results to format expected by PDF generator
      const quizData = {
        id: results.quizId,
        title: results.quizTitle,
        topic: results.quizTopic || "Quiz",
        quizType: results.quizType || "multiple-choice",
        questions: results.questions.map(q => ({
          id: q.questionId,
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer
        }))
      };
      
      // Convert answers to format expected by PDF generator
      const userAnswers = results.questions.map(q => ({
        questionId: q.questionId,
        userAnswer: q.userAnswer,
        isCorrect: q.isCorrect
      }));
      
      // Generate PDF
      generateQuizAttemptPDF(quizData, userAnswers);
      
      toast({
        title: "PDF Generated",
        description: "Your quiz attempt has been downloaded as a PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    }
  };
  
  // Download answer key as PDF
  const handleDownloadAnswerKey = () => {
    if (!results) return;
    
    try {
      // Convert results to format expected by PDF generator
      const quizData = {
        id: results.quizId,
        title: results.quizTitle,
        topic: results.quizTopic || "Quiz",
        quizType: results.quizType || "multiple-choice",
        questions: results.questions.map(q => ({
          id: q.questionId,
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }))
      };
      
      // Generate PDF
      generateAnswerKeyPDF(quizData);
      
      toast({
        title: "Answer Key Generated",
        description: "The answer key has been downloaded as a PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Could not generate answer key PDF",
        variant: "destructive",
      });
    }
  };

  // Original download function (text format)
  const handleDownload = () => {
    if (!results) return;

    // Create a printable version of the quiz with answers
    const content = `
      # ${results.quizTitle} - Quiz Results
      
      Score: ${results.score}% (${results.correctAnswers}/${results.totalQuestions})
      Completed: ${safelyFormatDate(results.completedAt, 'datetime')}
      ${results.timeTaken ? `Time taken: ${Math.floor(results.timeTaken / 60)}m ${results.timeTaken % 60}s` : ''}
      
      ## Questions and Answers
      
      ${results.questions.map((q, i) => `
      ### Q${i + 1}: ${q.question}
      
      Your answer: ${Array.isArray(q.userAnswer) ? q.userAnswer.join(', ') : q.userAnswer}
      Correct answer: ${Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
      ${q.explanation ? `Explanation: ${q.explanation}` : ''}
      `).join('\n')}
    `;

    // Create a blob and download it
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.quizTitle.replace(/\s+/g, '_')}_results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !results) {
    return null; // Will redirect in useEffect
  }

  const scorePercent = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const scoreColor = 
    scorePercent >= 80 ? 'text-green-600' : 
    scorePercent >= 60 ? 'text-amber-600' : 
    'text-red-600';

  const formatTimeTaken = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0" 
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="bg-white rounded-xl card-shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold font-poppins text-gray-800">Quiz Results</h1>
            <p className="text-gray-600">{results.quizTitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
            <div className="md:hidden w-full">
              <div className="flex flex-row gap-2 mb-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadAttempt} className="flex-1">
                  <FileCheck className="mr-2 h-4 w-4" />
                  PDF Report
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadAnswerKey} className="w-full">
                <FileQuestion className="mr-2 h-4 w-4" />
                Answer Key
              </Button>
            </div>
            
            <div className="hidden md:flex md:space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleDownloadAttempt}>
                      <FileCheck className="mr-2 h-4 w-4" />
                      PDF Report
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download your quiz attempt as a PDF report</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleDownloadAnswerKey}>
                      <FileQuestion className="mr-2 h-4 w-4" />
                      Answer Key
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download answer key with explanations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${scoreColor}`}>
                  {scorePercent}%
                </div>
                <p className="text-sm text-gray-500 mt-1">Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <p className="text-sm text-gray-500 mt-1">Correct Answers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {results.timeTaken ? formatTimeTaken(results.timeTaken) : 'N/A'}
                </div>
                <p className="text-sm text-gray-500 mt-1">Time Taken</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Performance Breakdown</h2>
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Accuracy</span>
              <span className="text-sm font-medium">{scorePercent}%</span>
            </div>
            <Progress value={scorePercent} className="h-2" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Question Review</h2>
          <div className="space-y-6">
            {results.questions.map((question, index) => (
              <div key={question.questionId} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                      {index + 1}
                    </span>
                    <h3 className="text-gray-800 font-medium">{question.question}</h3>
                  </div>
                  <Badge variant={question.isCorrect ? "success" : "destructive"}>
                    {question.isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
                
                <Separator className="my-3" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Your Answer:</p>
                    <p className="text-gray-800">
                      {Array.isArray(question.userAnswer) 
                        ? question.userAnswer.join(', ') 
                        : question.userAnswer}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Correct Answer:</p>
                    <p className="text-gray-800">
                      {Array.isArray(question.correctAnswer) 
                        ? question.correctAnswer.join(', ') 
                        : question.correctAnswer}
                    </p>
                  </div>
                </div>
                
                {question.explanation && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Explanation:</p>
                    <p className="text-gray-700 text-sm">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button onClick={() => navigate(`/challenge/create?quiz=${results.quizId}`)}>
          Challenge a Friend
        </Button>
      </div>
    </div>
  );
};

export default Results;
