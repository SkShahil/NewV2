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
    // currentQuestion, // Not directly used in QuizPage's primary logic, but in QuizPlayer
    // userAnswers, // Not directly used
    // timeLeft, // Not directly used
    isQuizCompleted,
    resetQuiz,
    startQuiz,
    // nextQuestion, // For QuizPlayer
    // previousQuestion, // For QuizPlayer
    // answerQuestion, // For QuizPlayer
    completeQuiz, // For handleCompleteQuiz
  } = useQuiz();
  
  const [loading, setLoading] = useState(true);
  const [textToSpeech, setTextToSpeech] = useState(true); // This seems to be for QuizPlayer, not QuizPage itself
  const { toast } = useToast();
  
  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);
  
  // Main effect for loading quiz data
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("QuizPage: User not authenticated, redirecting to login");
      navigate('/login');
      return;
    }

    if (authLoading || !user) {
      console.log("QuizPage: Auth still loading or no user, skipping quiz load.");
      return; 
    }

    const loadQuizData = async () => {
      console.log("QuizPage: loadQuizData attempting to load. Current quiz in context:", currentQuiz?.id, "URL ID:", id);
      setLoading(true);

      // Scenario 1: Quiz is already in context and matches the ID, or it's a 'new' quiz that's already loaded.
      if (currentQuiz && ((id && currentQuiz.id === id) || ((!id || id === 'new') && currentQuiz.id))) {
        console.log("QuizPage: Quiz already in context, ID:", currentQuiz.id);
        setLoading(false); 
        // startQuiz() will be handled by its own useEffect watching currentQuiz and loading state
        return;
      }
      
      // Scenario 2: Try loading from sessionStorage (e.g., after quiz generation)
      const currentQuizJson = sessionStorage.getItem('currentQuiz');
      if (currentQuizJson) {
        try {
          const quizData = JSON.parse(currentQuizJson) as QuizData;
          console.log("QuizPage: Loading quiz from sessionStorage. ID in session:", quizData.id);

          if (!quizData || !quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            console.error("QuizPage: Invalid quiz data structure from sessionStorage:", quizData);
            toast({ title: "Error Loading Quiz", description: "Invalid quiz data from session. Please try generating again.", variant: "destructive"});
            sessionStorage.removeItem('currentQuiz'); // Clear bad data
            navigate('/generate-quiz');
            return;
          }
          if (quizData.quizType === 'auto') quizData.quizType = 'multiple-choice';
          
          loadQuiz(quizData); // This will update currentQuiz in context
          // Set loading to false immediately after loading quiz
          setLoading(false);
          console.log("QuizPage: Quiz loaded from sessionStorage and loading set to false");
          return;
        } catch (error) {
          console.error("QuizPage: Error parsing quiz from sessionStorage:", error);
          sessionStorage.removeItem('currentQuiz'); // Clear potentially corrupt data
          toast({ title: "Error Loading Quiz", description: "Could not load quiz from session. Please try generating again.", variant: "destructive"});
          navigate('/generate-quiz');
          return;
        }
      }

      // Scenario 3: Try loading an existing quiz by ID from Firebase (if ID is present and not 'new')
      if (id && id !== 'new') {
        console.log("QuizPage: Attempting to fetch quiz by ID from Firebase:", id);
        try {
          const fetchedQuiz = await getQuizById(id);
          if (!fetchedQuiz) {
            console.error("QuizPage: Quiz not found in Firebase for ID:", id);
            toast({ title: 'Quiz Not Found', description: 'The requested quiz could not be found.', variant: 'destructive' });
            navigate('/generate-quiz');
            return;
          }
          // Explicitly cast fetchedQuiz to a more flexible type for mapping if necessary,
          // or ensure properties are optional on FirebaseQuizData if they truly are.
          // For now, let's assume they might be on the object from Firebase.
          const firebaseQuizShape = fetchedQuiz as any; // Use with caution, or define a more precise intermediate type

          const quizData: QuizData = { // This QuizData is ContextQuizData
            id: fetchedQuiz.id,
            title: firebaseQuizShape.title || 'Untitled Quiz',
            topic: firebaseQuizShape.category || 'General Topic', // Map category to topic
            quizType: firebaseQuizShape.quizType || 'multiple-choice', // Provide fallback
            questions: Array.isArray(firebaseQuizShape.questions) ? firebaseQuizShape.questions : [],
            timeLimit: typeof firebaseQuizShape.timeLimit === 'number' ? firebaseQuizShape.timeLimit : undefined, // Provide fallback
          };
          if (quizData.questions.length === 0) {
             console.error("QuizPage: Fetched quiz from Firebase has no questions. ID:", id);
             toast({ title: 'Empty Quiz', description: 'The fetched quiz has no questions.', variant: 'destructive' });
             navigate('/generate-quiz');
             return;
          }
          loadQuiz(quizData);
          // Set loading to false immediately after loading quiz from Firebase
          setLoading(false);
          console.log("QuizPage: Quiz loaded from Firebase and loading set to false");
          return;
        } catch (error) {
          console.error('QuizPage: Error fetching quiz from Firebase by ID:', id, error);
          toast({ title: 'Error Fetching Quiz', description: 'Failed to load the quiz. Please try again.', variant: 'destructive' });
          navigate('/generate-quiz');
          return;
        }
      }
      
      // Scenario 4: No ID, not 'new', or 'new' but nothing in session/context (e.g. direct navigation to /quiz or /quiz/new without prior state)
      // If we reach here, it means no quiz was loaded from session or fetched by ID.
      // If currentQuiz is also null, then we truly have no quiz.
      if (!currentQuiz) {
        console.log("QuizPage: No quiz loaded from any source and no quiz in context. Redirecting to generate.");
        toast({ title: 'No Quiz Available', description: 'Please generate or select a quiz first.', variant: 'destructive' });
        navigate('/generate-quiz');
        return;
      }

      // If somehow currentQuiz got set by a concurrent process but didn't match earlier conditions, 
      // ensure loading is false.
      setLoading(false);
    };

    loadQuizData();

  }, [id, authLoading, user, navigate, loadQuiz, toast]); // Removed currentQuiz and other context updaters

  // Effect to start the quiz once it's loaded and ready
  useEffect(() => {
    if (currentQuiz && !loading && !isQuizCompleted) {
      console.log("QuizPage: currentQuiz is loaded, page is not in loading state, and quiz not completed. Calling startQuiz(). Quiz ID:", currentQuiz.id);
      startQuiz();
    }
  }, [currentQuiz, loading, startQuiz, isQuizCompleted]);

  // Effect for cleanup when component unmounts or relevant IDs change
  useEffect(() => {
    const quizIdBeforeUnmount = currentQuiz?.id;
    return () => {
      console.log("QuizPage: Cleanup effect running. Quiz ID at time of setup:", quizIdBeforeUnmount, "isQuizCompleted:", isQuizCompleted);
      // Only reset if the quiz was not completed AND the quiz context is still for the same quiz.
      // This avoids resetting a new quiz if the user quickly navigates away then back to a different quiz.
      // However, `resetQuiz` typically clears `currentQuiz` entirely.
      // A more fine-grained reset might be needed if `resetQuiz` is too broad.
      if (!isQuizCompleted) {
          // console.log("QuizPage: Resetting quiz as it was not completed.");
          // resetQuiz(); // Consider the implications of resetting. If navigating away, usually yes.
      }
    };
    // Dependencies: `id` changing means we are on a different quiz page path.
    // `resetQuiz` and `isQuizCompleted` are part of the logic.
  }, [id, resetQuiz, isQuizCompleted, currentQuiz?.id]); // currentQuiz.id helps track if it's the same quiz for reset logic


  const handleCompleteQuiz = async () => {
    const attemptId = await completeQuiz();
    if (attemptId) {
      navigate(`/results/${attemptId}`);
    }
  };
  
  // Render loading indicator
  if (authLoading || (loading && !currentQuiz)) {
    console.log("QuizPage: Rendering Loader. authLoading:", authLoading, "loading:", loading, "currentQuiz exists:", !!currentQuiz);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect if user somehow got here without being authenticated (should be caught by useEffect)
  if (!user) {
    console.log("QuizPage: Rendering null because no user (should have been redirected).");
    return null; 
  }
  
  // Render message if quiz data is still not available after loading attempts
  if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
    console.log("QuizPage: No quiz data available in render function after loading attempts. currentQuiz:", currentQuiz);
    // The useEffect should have navigated away if no quiz could be loaded. 
    // If we reach here, it's an unexpected state.
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <p className="text-xl text-red-500 mb-4">Could not load quiz data.</p>
        <p className="mb-2">This can happen if the quiz ID is invalid, data is missing, or an error occurred.</p>
        <Button onClick={() => navigate('/generate-quiz')}>Generate New Quiz</Button>
      </div>
    );
  }

  // Render the QuizPlayer if everything is loaded
  console.log("QuizPage: Rendering QuizPlayer. Quiz ID:", currentQuiz.id, "Number of questions:", currentQuiz.questions.length);
  return (
    <div className="container mx-auto px-4 py-8">
      <QuizPlayer
        quiz={currentQuiz}
        currentQuestion={useQuiz().currentQuestion} // Get latest from context
        userAnswers={useQuiz().userAnswers} // Get latest from context
        onAnswer={useQuiz().answerQuestion} // Get latest from context
        onNext={useQuiz().nextQuestion} // Get latest from context
        onPrevious={useQuiz().previousQuestion} // Get latest from context
        timeLeft={useQuiz().timeLeft} // Get latest from context
        onComplete={handleCompleteQuiz}
        isCompleted={isQuizCompleted} // This is from QuizPage's own useQuiz() destructuring
        textToSpeech={textToSpeech}
        onJumpToQuestion={(index) => useQuiz().setCurrentQuestion(index)}
      />
    </div>
  );
};

export default QuizPage;
