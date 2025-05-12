import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import QuizPlayer from '@/components/quiz/QuizPlayer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizData {
  questions: any[];
}

const ChallengePlay = () => {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams();
  const token = (params as any).token;

  // Fetch challenge data
  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/challenge/${token}`);
        if (!res.ok) throw new Error('Challenge not found or expired');
        const data = await res.json();
        if (!data || !data.challenge || !data.challenge.quiz) throw new Error('Invalid challenge data');
        setChallenge(data.challenge);
        setQuiz(data.challenge.quiz);
        // Set timer if available
        if (data.challenge.timeLimit) {
          setTimeLeft(data.challenge.timeLimit);
        }
      } catch (err: any) {
        setError(err.message || 'Could not load challenge');
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [token]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || isCompleted) return;
    if (timeLeft <= 0) {
      setIsCompleted(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isCompleted]);

  // Keyboard shortcut for TTS (F+J)
  useEffect(() => {
    let fPressed = false;
    let jPressed = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f') fPressed = true;
      if (e.key.toLowerCase() === 'j') jPressed = true;
      if (fPressed && jPressed) setTextToSpeech((t) => !t);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f') fPressed = false;
      if (e.key.toLowerCase() === 'j') jPressed = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // QuizPlayer handlers
  const handleAnswer = useCallback((questionIndex: number, answer: any) => {
    if (!quiz) return;
    const question = quiz.questions[questionIndex];
    setUserAnswers((prev) => {
      const filtered = prev.filter(a => a.questionId !== question.id);
      return [
        ...filtered,
        {
          questionId: question.id,
          userAnswer: answer,
          isCorrect: Array.isArray(question.correctAnswer)
            ? JSON.stringify(answer) === JSON.stringify(question.correctAnswer)
            : answer === question.correctAnswer,
        }
      ];
    });
  }, [quiz]);

  const handleNext = useCallback(() => {
    if (!quiz) return;
    setCurrentQuestion((q) => Math.min(q + 1, quiz.questions.length - 1));
  }, [quiz]);

  const handlePrevious = useCallback(() => {
    setCurrentQuestion((q) => Math.max(q - 1, 0));
  }, []);

  const handleJumpToQuestion = useCallback((index: number) => {
    setCurrentQuestion(index);
  }, []);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    toast({ title: 'Quiz Completed', description: 'You have completed the challenge!' });
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-600 font-semibold mb-4">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (!quiz) return null;

  // Ensure quiz has all required fields for QuizPlayer
  const quizForPlayer = {
    title: (quiz as any).title || 'Challenge Quiz',
    questions: quiz.questions || [],
    timeLimit: (quiz as any).timeLimit,
    quizType: (quiz as any).quizType || 'multiple-choice',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <QuizPlayer
        quiz={quizForPlayer}
        currentQuestion={currentQuestion}
        onAnswer={handleAnswer}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onJumpToQuestion={handleJumpToQuestion}
        onComplete={handleComplete}
        userAnswers={userAnswers}
        timeLeft={timeLeft}
        textToSpeech={textToSpeech}
        isCompleted={isCompleted}
      />
      <div className="flex justify-end mt-4">
        <Button onClick={() => setTextToSpeech((t) => !t)} variant={textToSpeech ? 'default' : 'outline'}>
          {textToSpeech ? 'Disable' : 'Enable'} Text-to-Speech
        </Button>
      </div>
    </div>
  );
};

export default ChallengePlay; 