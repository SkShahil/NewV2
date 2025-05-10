import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { formatTime } from '@/lib/utils';
import { Question } from '@shared/schema';

interface FixedQuizPlayerProps {
  quiz: {
    id?: string;
    title: string;
    topic: string;
    quizType: 'multiple-choice' | 'true-false' | 'short-answer' | 'auto';
    questions: Question[];
    timeLimit?: number;
  };
  onComplete: (answers: Array<{questionId: string, answer: string | string[], isCorrect: boolean}>) => void;
}

export default function FixedQuizPlayer({ quiz, onComplete }: FixedQuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Array<{questionId: string, answer: string | string[], isCorrect: boolean}>>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  const question = quiz.questions[currentQuestion];
  const answerInputRef = useRef<HTMLInputElement>(null);
  const synth = window.speechSynthesis;
  
  // Set up timer if there's a time limit
  useEffect(() => {
    if (!timeLeft) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  // Update progress percentage
  useEffect(() => {
    setProgress(((currentQuestion + 1) / quiz.questions.length) * 100);
  }, [currentQuestion, quiz.questions.length]);
  
  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);
  
  // Handle selecting an option
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    console.log("Selected option:", option);
    
    // Record the answer immediately
    const isCorrect = option === question.correctAnswer;
    
    // Update userAnswers
    setUserAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === question.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { questionId: question.id, answer: option, isCorrect };
        return updated;
      }
      return [...prev, { questionId: question.id, answer: option, isCorrect }];
    });
  };
  
  // Handle next button click
  const handleNextClick = () => {
    if (!selectedOption) {
      toast({
        title: "Selection Required",
        description: "Please select an answer before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    // Move to next question
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(''); // Reset selection for next question
    }
  };
  
  // Handle completing the quiz
  const handleCompleteClick = () => {
    if (!selectedOption) {
      toast({
        title: "Selection Required",
        description: "Please select an answer before completing",
        variant: "destructive",
      });
      return;
    }
    
    // Complete the quiz with all answers
    onComplete(userAnswers);
  };
  
  // Text to speech
  const toggleTextToSpeech = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(question.question);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synth.speak(utterance);
  };
  
  // Check if this question has been answered
  const isAnswered = userAnswers.some(a => a.questionId === question.id);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-6">
      {/* Progress Indicator */}
      <div className="flex justify-center mb-3 gap-2">
        {quiz.questions.map((_, index) => {
          // Check if this question has been answered
          const isAnswered = userAnswers.some(a => a.questionId === quiz.questions[index].id);
          // Check if this is the current question
          const isCurrent = index === currentQuestion;
          
          return (
            <div 
              key={index} 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                isCurrent 
                  ? 'bg-blue-500 text-white' // Current question
                  : isAnswered 
                    ? 'bg-green-500 text-white' // Answered
                    : 'bg-orange-400 text-white' // Not answered
              }`}
            >
              {index + 1}
            </div>
          );
        })}
      </div>
      
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold font-poppins text-gray-800 dark:text-white">{quiz.title}</h1>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H2v6h4l5 4V5Z"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Question</span>
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
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-6">{question.question}</h2>
        
        {/* Multiple Choice Options */}
        {quiz.quizType !== 'short-answer' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                className={`w-full text-left p-4 border ${
                  selectedOption === option
                    ? 'border-primary bg-primary bg-opacity-10 dark:bg-opacity-30'
                    : 'border-gray-200 dark:border-gray-600'
                } rounded-lg hover:bg-secondary dark:hover:bg-gray-700 transition-all quiz-option`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex items-center">
                  <span className={`h-5 w-5 rounded-full border-2 ${
                    selectedOption === option
                      ? 'border-primary bg-primary text-white flex items-center justify-center'
                      : 'border-gray-300 dark:border-gray-500'
                  } flex items-center justify-center mr-3`}>
                    {selectedOption === option && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </span>
                  <span className="text-gray-800 dark:text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Controls */}
      <div className="flex justify-between">
        <Button
          onClick={() => {
            if (currentQuestion > 0) {
              setCurrentQuestion(currentQuestion - 1);
              // Restore previous selection if exists
              const prevAnswer = userAnswers.find(a => a.questionId === quiz.questions[currentQuestion - 1].id);
              if (prevAnswer && typeof prevAnswer.answer === 'string') {
                setSelectedOption(prevAnswer.answer);
              } else {
                setSelectedOption('');
              }
            }
          }}
          disabled={currentQuestion === 0}
          variant="outline"
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
        >
          Previous
        </Button>
        
        {currentQuestion < quiz.questions.length - 1 ? (
          <Button
            onClick={handleNextClick}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleCompleteClick}
            className="px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-all"
          >
            Complete Quiz
          </Button>
        )}
      </div>
    </div>
  );
}