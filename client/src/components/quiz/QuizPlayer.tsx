import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question } from '@/lib/gemini';
import { formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { checkShortAnswer } from '@/lib/gemini';
import { useSettings } from '@/context/SettingsContext';
import { VolumeX, Volume2 } from 'lucide-react';

interface QuizPlayerProps {
  quiz: {
    title: string;
    questions: Question[];
    timeLimit?: number;
    quizType: 'multiple-choice' | 'true-false' | 'short-answer' | 'auto';
  };
  currentQuestion: number;
  onAnswer: (questionIndex: number, answer: string | string[]) => void;
  onPrevious: () => void;
  onNext: () => void;
  onJumpToQuestion: (index: number) => void;
  onComplete: () => void;
  userAnswers: Array<{
    questionId: string;
    userAnswer: string | string[];
    isCorrect?: boolean;
  }>;
  timeLeft: number | null;
  textToSpeech?: boolean;
  isCompleted: boolean;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  currentQuestion,
  onAnswer,
  onPrevious,
  onNext,
  onJumpToQuestion,
  onComplete,
  userAnswers,
  timeLeft,
  textToSpeech: propTextToSpeech,
  isCompleted,
}) => {
  const { textToSpeech: globalTTS } = useSettings();
  const textToSpeech = propTextToSpeech !== undefined ? propTextToSpeech : globalTTS;
  const [selectedOption, setSelectedOption] = useState<string | string[]>("");
  const [inputValue, setInputValue] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const answerInputRef = useRef<HTMLInputElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const question = quiz.questions[currentQuestion];
  const currentAnswerEntry = userAnswers.find(a => a.questionId === question.id);
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  
  const synth = window.speechSynthesis;

  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  useEffect(() => {
    const answerEntry = userAnswers.find(a => a.questionId === question.id);

    if (answerEntry) {
      setSelectedOption(answerEntry.userAnswer);
      if (question.type === 'short-answer' || quiz.quizType === 'short-answer') {
        setInputValue(Array.isArray(answerEntry.userAnswer) 
          ? answerEntry.userAnswer.join(", ") 
          : String(answerEntry.userAnswer));
      }
    } else {
      setSelectedOption(""); 
      if (question.type === 'short-answer' || quiz.quizType === 'short-answer') {
        setInputValue("");
      }
    }
    
    if ((question.type === 'short-answer' || quiz.quizType === 'short-answer') && answerInputRef.current) {
      answerInputRef.current.focus();
    }
    
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [currentQuestion, question.id, userAnswers, question.type, quiz.quizType, synth]);

  useEffect(() => {
    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, [synth]);
  
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    onAnswer(currentQuestion, option);
  };

  const handleShortAnswerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onAnswer(currentQuestion, newValue);
  };
  
  const handleShortAnswerSubmitValidation = async () => {
    if (!inputValue.trim()) {
      return; 
    }
    setIsChecking(true);
    try {
      const result = await checkShortAnswer(
        inputValue,
        Array.isArray(question.correctAnswer) 
          ? question.correctAnswer.join(", ") 
          : question.correctAnswer.toString(),
        question.question
      );
      toast({
        title: result.isCorrect ? "Correct!" : "Incorrect",
        description: result.explanation,
        variant: result.isCorrect ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error checking answer:", error);
      toast({ title: "Error", description: "Could not validate answer.", variant: "destructive" });
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleNextClick = () => {
    if (!isLastQuestion) {
      onNext();
    }
  };

  const handlePreviousClick = () => {
    if (!isFirstQuestion) {
      onPrevious();
    }
  };

  const handleQuestionJumpClick = (index: number) => {
    onJumpToQuestion(index);
  };

  const handleCompleteClick = () => {
    console.log('QuizPlayer - Completing quiz with current answers:', userAnswers);
    onComplete();
  };
  
  const toggleTextToSpeech = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(question.question);
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    setIsSpeaking(true);
    synth.speak(utterance);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-card text-card-foreground rounded-lg shadow-xl quiz-player-container">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="font-medium text-primary">{quiz.title}</span>
          {timeLeft !== null && (
            <Badge variant="outline" className="text-lg">
              Time Left: {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        <Progress value={progress} className="w-full h-3 quiz-progress-bar" />
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {quiz.questions.map((_, index) => (
          <Button
            key={`q-nav-${index}`}
            variant={index === currentQuestion ? 'default' : 'outline'}
            size="sm"
            className={`h-8 w-8 p-0 sm:h-9 sm:w-9 ${userAnswers.find(a => a.questionId === quiz.questions[index].id) ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}
            onClick={() => handleQuestionJumpClick(index)}
            aria-label={`Go to question ${index + 1}`}
          >
            {index + 1}
          </Button>
        ))}
      </div>

      <div className="mb-8 p-4 border border-border rounded-lg bg-background min-h-[100px]">
        <div className="flex justify-between items-start">
          <h2 className="text-xl md:text-2xl font-semibold">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </h2>
          {textToSpeech && (
            <Button variant="ghost" size="icon" onClick={toggleTextToSpeech} aria-label={isSpeaking ? "Stop speech" : "Read question"}>
              {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          )}
        </div>
        <p className="mt-2 text-lg md:text-xl whitespace-pre-wrap">{question.question}</p>
      </div>

      <div className="space-y-4 mb-8">
        {(question.type === 'multiple-choice' || (!question.type && quiz.quizType === 'multiple-choice')) && question.options && (
          question.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedOption === option ? 'default' : 'outline'}
              className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal quiz-option"
              onClick={() => handleOptionSelect(option)}
            >
              <span className="text-sm sm:text-base">{String.fromCharCode(65 + index)}. {option}</span>
            </Button>
          ))
        )}
        {(question.type === 'true-false' || (!question.type && quiz.quizType === 'true-false')) && (
          ['True', 'False'].map((option, index) => (
            <Button
              key={index}
              variant={selectedOption === option ? 'default' : 'outline'}
              className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal quiz-option"
              onClick={() => handleOptionSelect(option)}
            >
               <span className="text-sm sm:text-base">{option}</span>
            </Button>
          ))
        )}
        {(question.type === 'short-answer' || (!question.type && quiz.quizType === 'short-answer')) && (
          <div>
            <textarea
              ref={answerInputRef as any}
              value={inputValue}
              onChange={handleShortAnswerChange}
              placeholder="Type your answer here..."
              className="w-full p-2 border border-input rounded-md min-h-[80px] text-base bg-background text-foreground focus:ring-ring focus:ring-1"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-8 pt-6 border-t border-border">
        <Button
          onClick={handlePreviousClick}
          disabled={isFirstQuestion}
          variant={isFirstQuestion ? "outline" : "default"}
          className={`w-full sm:w-auto px-6 py-3 text-base ${isFirstQuestion ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          Previous
        </Button>
        <Button
          onClick={handleNextClick}
          disabled={isLastQuestion}
          variant={isLastQuestion ? "outline" : "default"}
          className={`w-full sm:w-auto px-6 py-3 text-base ${isLastQuestion ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          Next
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <Button
          onClick={handleCompleteClick}
          variant="success"
          size="lg"
          className="w-full sm:w-auto px-8 py-3 text-lg"
          disabled={isCompleted}
        >
          {isCompleted ? "Quiz Finished" : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
};

export default QuizPlayer;