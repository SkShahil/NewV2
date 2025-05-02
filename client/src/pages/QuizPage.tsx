import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { QuizPlayer } from '@/components/quiz';
import { useQuiz } from '@/context/QuizContext';
import { getQuizById } from '@/lib/firebase';
import { Question } from '@/lib/gemini';

const QuizPage = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const {
    currentQuiz,
    loadQuiz,
    currentQuestion,
    userAnswers,
    timeLeft,
    isQuizCompleted,
    resetQuiz,
    startQuiz,
    nextQuestion,
    previousQuestion,
    answerQuestion,
    completeQuiz,
  } = useQuiz();
  
  const [loading, setLoading] = useState(true);
  const [textToSpeech, setTextToSpeech] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    
    const fetchQuiz = async () => {
      // Check for a newly generated quiz in localStorage
      const generatedQuizJson = localStorage.getItem('generatedQuiz');
      
      if (generatedQuizJson) {
        try {
          // Parse and load the generated quiz
          const generatedQuiz = JSON.parse(generatedQuizJson);
          console.log("Loading quiz from localStorage:", generatedQuiz);
          
          loadQuiz(generatedQuiz);
          
          // Clear from localStorage to prevent reloading on refresh
          localStorage.removeItem('generatedQuiz');
          
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing generated quiz from localStorage:", error);
        }
      }
      
      // If we have an ID, try to fetch an existing quiz
      if (id && id !== 'new') {
        try {
          setLoading(true);
          // For an existing quiz, fetch it from Firebase
          const fetchedQuiz = await getQuizById(id);
          
          if (!fetchedQuiz) {
            toast({
              title: 'Quiz Not Found',
              description: 'The requested quiz could not be found',
              variant: 'destructive',
            });
            navigate('/generate-quiz');
            return;
          }
          
          // Transform the quiz to match our expected format
          loadQuiz({
            id: fetchedQuiz.id,
            title: fetchedQuiz.title,
            topic: fetchedQuiz.topic,
            quizType: fetchedQuiz.quizType,
            questions: fetchedQuiz.questions as Question[],
            timeLimit: fetchedQuiz.timeLimit,
          });
          
        } catch (error) {
          console.error('Error fetching quiz:', error);
          toast({
            title: 'Error',
            description: 'Failed to load the quiz. Please try again.',
            variant: 'destructive',
          });
          navigate('/generate-quiz');
        } finally {
          setLoading(false);
        }
      } else if (!currentQuiz) {
        // No quiz in localStorage or context, redirect to generate page
        navigate('/generate-quiz');
        return;
      }
      
      setLoading(false);
    };
    
    fetchQuiz();
    
    // Start the quiz when the component mounts
    startQuiz();
    
    // Clean up when unmounting
    return () => {
      // Reset the quiz state if navigating away without completing
      if (!isQuizCompleted) {
        resetQuiz();
      }
    };
  }, [id, authLoading, user, navigate, currentQuiz, loadQuiz, resetQuiz, startQuiz, isQuizCompleted, toast]);
  
  const handleCompleteQuiz = async () => {
    const attemptId = await completeQuiz();
    if (attemptId) {
      navigate(`/results/${attemptId}`);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || !currentQuiz) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {isQuizCompleted ? (
        <div className="bg-white rounded-xl card-shadow p-8 text-center">
          <div className="mb-6">
            <div className="h-20 w-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mt-4">Quiz Completed!</h2>
            <p className="text-gray-600 mt-2">
              You've answered {userAnswers.length} out of {currentQuiz.questions.length} questions.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button onClick={handleCompleteQuiz} className="bg-primary hover:bg-primary-dark">
              View Results
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <QuizPlayer
          quiz={currentQuiz}
          currentQuestion={currentQuestion}
          onAnswer={answerQuestion}
          onPrevious={previousQuestion}
          onNext={nextQuestion}
          onComplete={handleCompleteQuiz}
          userAnswers={userAnswers}
          timeLeft={timeLeft}
          textToSpeech={textToSpeech}
        />
      )}
    </div>
  );
};

export default QuizPage;
