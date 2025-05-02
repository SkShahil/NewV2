import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question } from '@/lib/gemini';
import { formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { checkShortAnswer } from '@/lib/gemini';

interface QuizPlayerProps {
  quiz: {
    title: string;
    questions: Question[];
    timeLimit?: number;
    quizType: 'multiple-choice' | 'true-false' | 'short-answer';
  };
  currentQuestion: number;
  onAnswer: (answer: string | string[]) => void;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  userAnswers: Array<{
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
  }>;
  timeLeft: number | null;
  textToSpeech?: boolean;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  currentQuestion,
  onAnswer,
  onPrevious,
  onNext,
  onComplete,
  userAnswers,
  timeLeft,
  textToSpeech = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | string[]>("");
  const [inputValue, setInputValue] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const answerInputRef = useRef<HTMLInputElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const question = quiz.questions[currentQuestion];
  const currentAnswer = userAnswers.find(a => a.questionId === question.id);
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  
  // Speech synthesis
  const synth = window.speechSynthesis;
  
  useEffect(() => {
    // Reset selected option when the question changes
    if (currentAnswer) {
      setSelectedOption(currentAnswer.userAnswer);
      setInputValue(Array.isArray(currentAnswer.userAnswer) 
        ? currentAnswer.userAnswer.join(", ") 
        : currentAnswer.userAnswer);
    } else {
      setSelectedOption("");
      setInputValue("");
    }
    
    // Focus on input field for short answer questions
    if (quiz.quizType === 'short-answer' && answerInputRef.current) {
      answerInputRef.current.focus();
    }
    
    // Stop any ongoing speech when question changes
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [currentQuestion, question, currentAnswer]);
  
  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);
  
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    onAnswer(option);
  };
  
  const handleShortAnswerSubmit = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Answer Required",
        description: "Please enter your answer before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    setIsChecking(true);
    
    try {
      // For short answer, we need to check if the answer is correct
      const result = await checkShortAnswer(
        inputValue,
        Array.isArray(question.correctAnswer) 
          ? question.correctAnswer.join(", ") 
          : question.correctAnswer.toString(),
        question.question
      );
      
      onAnswer(inputValue);
      
      // Show feedback for short answer
      toast({
        title: result.isCorrect ? "Correct!" : "Incorrect",
        description: result.explanation,
        variant: result.isCorrect ? "default" : "destructive",
      });
      
      // Move to next question if not the last one
      if (currentQuestion < quiz.questions.length - 1) {
        setTimeout(() => onNext(), 1500);
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      // If we can't check the answer, just accept it and continue
      onAnswer(inputValue);
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleNextClick = () => {
    if (quiz.quizType === 'short-answer') {
      handleShortAnswerSubmit();
    } else {
      if (!selectedOption) {
        toast({
          title: "Selection Required",
          description: "Please select an answer before proceeding",
          variant: "destructive",
        });
        return;
      }
      
      // For multiple choice and true/false, we already know if it's correct
      onNext();
    }
  };
  
  const handleCompleteClick = () => {
    if (quiz.quizType === 'short-answer' && !currentAnswer) {
      handleShortAnswerSubmit();
    } else {
      onComplete();
    }
  };
  
  const toggleTextToSpeech = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    
    // Create utterance for the current question
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
    <div className="bg-white rounded-xl card-shadow p-6">
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold font-poppins text-gray-800">{quiz.title}</h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleTextToSpeech}
              variant="ghost"
              size="icon"
              className={`p-2 rounded-full ${
                isSpeaking ? 'bg-accent text-white' : 'bg-secondary text-gray-600'
              } hover:bg-secondary-dark transition-all`}
              aria-label="Text-to-speech"
              data-tooltip="Text-to-speech"
            >
              {isSpeaking ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5 6 9H2v6h4l5 4V5Z"></path>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5 6 9H2v6h4l5 4V5Z"></path>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-full bg-secondary text-gray-600 hover:bg-secondary-dark transition-all"
              aria-label="Accessibility options"
              data-tooltip="Accessibility options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">Question</span>
            <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
              {currentQuestion + 1}/{quiz.questions.length}
            </span>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-1">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="w-full h-2 quiz-progress-bar" />
      </div>

      {/* Quiz Question */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-6">{question.question}</h2>
        
        {/* Multiple Choice Options */}
        {quiz.quizType === 'multiple-choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                className={`w-full text-left p-4 border ${
                  selectedOption === option
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-gray-200'
                } rounded-lg hover:bg-secondary transition-all quiz-option`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex items-center">
                  <span className={`h-5 w-5 rounded-full border-2 ${
                    selectedOption === option
                      ? 'border-primary bg-primary text-white flex items-center justify-center'
                      : 'border-gray-300'
                  } flex items-center justify-center mr-3`}>
                    {selectedOption === option && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </span>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* True/False Options */}
        {quiz.quizType === 'true-false' && (
          <div className="space-y-3">
            {['True', 'False'].map((option) => (
              <button
                key={option}
                className={`w-full text-left p-4 border ${
                  selectedOption === option
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-gray-200'
                } rounded-lg hover:bg-secondary transition-all quiz-option`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex items-center">
                  <span className={`h-5 w-5 rounded-full border-2 ${
                    selectedOption === option
                      ? 'border-primary bg-primary text-white flex items-center justify-center'
                      : 'border-gray-300'
                  } flex items-center justify-center mr-3`}>
                    {selectedOption === option && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </span>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Short Answer Input */}
        {quiz.quizType === 'short-answer' && (
          <div className="space-y-3">
            <div className="relative">
              <input
                ref={answerInputRef}
                type="text"
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Type your answer here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleShortAnswerSubmit();
                  }
                }}
                disabled={isChecking}
              />
              {isChecking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-primary">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Press Enter to submit your answer or use the buttons below.
            </p>
          </div>
        )}
      </div>

      {/* Quiz Controls */}
      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          disabled={currentQuestion === 0}
          variant="outline"
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
        >
          Previous
        </Button>
        
        {currentQuestion < quiz.questions.length - 1 ? (
          <Button
            onClick={handleNextClick}
            disabled={isChecking}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all"
          >
            {isChecking ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin mr-2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Checking...
              </>
            ) : (
              "Next"
            )}
          </Button>
        ) : (
          <Button
            onClick={handleCompleteClick}
            disabled={isChecking}
            className="px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-all"
          >
            {isChecking ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin mr-2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Checking...
              </>
            ) : (
              "Complete Quiz"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
