import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { QuizPlayer } from '@/components/quiz';
import { useQuiz } from '@/context/QuizContext';
import { getQuizById } from '@/lib/firebase';
import { Question } from '@/lib/gemini';
import type { QuizData } from '@/context/QuizContext';

const QuizPage = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const auth = getAuth();
  
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
  
  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting to login");
      navigate('/login');
      return;
    }
    
    const fetchQuiz = async () => {
      console.log("fetchQuiz called in QuizPage, id:", id);
      
      // Try to get quiz from sessionStorage (preferred way now)
      const currentQuizJson = sessionStorage.getItem('currentQuiz');
      
      if (currentQuizJson) {
        try {
          // Parse and load the generated quiz
          const quizData = JSON.parse(currentQuizJson);
          console.log("Loading quiz from sessionStorage:", quizData);
          
          // Validate quiz data
          if (!quizData || !quizData.questions || !Array.isArray(quizData.questions)) {
            console.error("Invalid quiz data structure:", quizData);
            toast({
              title: "Error Loading Quiz",
              description: "The quiz data appears to be invalid. Please try generating a new quiz.",
              variant: "destructive"
            });
            navigate('/generate-quiz');
            return;
          }
          
          // Debug the content of the quiz
          console.log("Quiz has", quizData.questions.length, "questions");
          console.log("First question:", quizData.questions[0]);
          console.log("Quiz type:", quizData.quizType);
          
          // Ensure quiz type is compatible
          if (quizData.quizType === 'auto') {
            quizData.quizType = 'multiple-choice';
            console.log("Converted 'auto' quiz type to 'multiple-choice'");
          }
          
          // Load the quiz immediately and force state update
          loadQuiz(quizData);
          console.log("Quiz loaded into context successfully from sessionStorage");
          
          // Don't clear from sessionStorage immediately to allow for page refreshes
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing quiz from sessionStorage:", error);
        }
      } else {
        console.log("No currentQuiz found in sessionStorage");
      }
      
      // Fallback to localStorage for backward compatibility
      const generatedQuizJson = localStorage.getItem('generatedQuiz');
      
      if (generatedQuizJson) {
        try {
          const generatedQuiz = JSON.parse(generatedQuizJson);
          console.log("Loading quiz from localStorage (legacy):", generatedQuiz);
          
          if (!generatedQuiz.questions || !Array.isArray(generatedQuiz.questions)) {
            throw new Error("Invalid quiz data");
          }
          
          if (generatedQuiz.quizType === 'auto') {
            generatedQuiz.quizType = 'multiple-choice';
          }
          
          loadQuiz(generatedQuiz);
          localStorage.removeItem('generatedQuiz');
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error with localStorage quiz:", error);
          localStorage.removeItem('generatedQuiz');
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
          if (typeof fetchedQuiz === 'object' && fetchedQuiz !== null) {
            // Treat fetchedQuiz as a dynamic object
            const fetchedQuizObj = fetchedQuiz as Record<string, any>;
            
            const quizData: QuizData = {
              id: fetchedQuizObj.id,
              title: fetchedQuizObj.title || 'Untitled Quiz',
              topic: fetchedQuizObj.topic || 'General Knowledge',
              quizType: (fetchedQuizObj.quizType as 'multiple-choice' | 'true-false' | 'short-answer' | 'auto') || 'multiple-choice',
              questions: Array.isArray(fetchedQuizObj.questions) ? fetchedQuizObj.questions as Question[] : [],
              timeLimit: typeof fetchedQuizObj.timeLimit === 'number' ? fetchedQuizObj.timeLimit : undefined,
            };
            
            loadQuiz(quizData);
          } else {
            throw new Error('Invalid quiz data returned from server');
          }
          
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
  
  if (!user) {
    return null; // Will redirect to login in useEffect
  }
  
  if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
    console.log("No quiz data available in the component render function");
    
    // Try one more time to get quiz from sessionStorage
    const lastChanceQuiz = sessionStorage.getItem('currentQuiz');
    if (lastChanceQuiz) {
      try {
        const parsedQuiz = JSON.parse(lastChanceQuiz);
        console.log("Found quiz in sessionStorage during render, loading now");
        
        // Fix quiz type if needed
        if (parsedQuiz.quizType === 'auto') {
          parsedQuiz.quizType = 'multiple-choice';
        }
        
        // Force immediate load
        setTimeout(() => loadQuiz(parsedQuiz), 0);
      } catch (e) {
        console.error("Error parsing quiz from sessionStorage in render:", e);
      }
    } else {
      // Final attempt from localStorage (legacy)
      const legacyQuiz = localStorage.getItem('generatedQuiz');
      if (legacyQuiz) {
        try {
          const parsedLegacyQuiz = JSON.parse(legacyQuiz);
          console.log("Found quiz in localStorage during render (legacy fallback)");
          setTimeout(() => loadQuiz(parsedLegacyQuiz), 0);
        } catch (e) {
          console.error("Error parsing legacy quiz:", e);
        }
      }
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <h2 className="text-2xl font-bold mb-4">Loading Quiz...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600 text-center">If the quiz doesn't load within a few seconds, please <Button 
          variant="link" 
          className="p-0 h-auto font-semibold"
          onClick={() => navigate('/generate-quiz')}
        >click here</Button> to generate a new quiz.</p>
      </div>
    );
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
