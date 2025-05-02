import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextToSpeech } from '@/components/TextToSpeech';
import { Question } from '@/lib/gemini';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string | string[];
  onAnswer: (answer: string | string[]) => void;
  showExplanation?: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionCard = ({
  question,
  selectedAnswer,
  onAnswer,
  showExplanation = false,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) => {
  const isMultipleChoice = Array.isArray(question.options) && question.options.length > 0;
  const isTrueFalse = !isMultipleChoice && (
    question.correctAnswer === 'True' || 
    question.correctAnswer === 'False' || 
    question.correctAnswer === 'true' || 
    question.correctAnswer === 'false'
  );
  
  const handleOptionClick = (option: string) => {
    if (selectedAnswer) return; // Don't allow changing answer if already answered
    onAnswer(option);
  };
  
  const isOptionSelected = (option: string) => {
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(option);
    }
    return selectedAnswer === option;
  };
  
  const getOptionClass = (option: string) => {
    if (!showExplanation || !selectedAnswer) {
      return isOptionSelected(option) 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-card hover:bg-secondary';
    }
    
    // Show correct/incorrect status
    if (option === question.correctAnswer || 
        (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option))) {
      return 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-100';
    }
    
    if (isOptionSelected(option)) {
      return 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-100';
    }
    
    return 'bg-card';
  };
  
  return (
    <Card className="gradient-card w-full max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl font-bold">
            Question {questionNumber} of {totalQuestions}
          </CardTitle>
          <TextToSpeech text={question.question} compact />
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {isMultipleChoice ? 'Multiple choice' : isTrueFalse ? 'True/False' : 'Short answer'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="text-lg mb-6 font-medium">{question.question}</div>
        
        {isMultipleChoice && (
          <div className="grid grid-cols-1 gap-3">
            {question.options!.map((option) => (
              <Button
                key={option}
                variant="outline"
                className={cn(
                  "quiz-option justify-start h-auto p-4 text-left font-normal transition-all",
                  getOptionClass(option)
                )}
                onClick={() => handleOptionClick(option)}
                disabled={!!selectedAnswer}
              >
                {option}
              </Button>
            ))}
          </div>
        )}
        
        {isTrueFalse && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className={cn(
                "h-16 text-lg font-semibold transition-all", 
                getOptionClass('True')
              )}
              onClick={() => handleOptionClick('True')}
              disabled={!!selectedAnswer}
            >
              True
            </Button>
            <Button
              variant="outline"
              className={cn(
                "h-16 text-lg font-semibold transition-all", 
                getOptionClass('False')
              )}
              onClick={() => handleOptionClick('False')}
              disabled={!!selectedAnswer}
            >
              False
            </Button>
          </div>
        )}
        
        {!isMultipleChoice && !isTrueFalse && (
          <div className="space-y-4">
            <textarea
              className="w-full min-h-[100px] p-4 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Type your answer here..."
              disabled={!!selectedAnswer}
              onChange={(e) => !selectedAnswer && onAnswer(e.target.value)}
            />
            {!selectedAnswer && (
              <Button onClick={() => onAnswer('')} className="w-full mt-2">
                Submit Answer
              </Button>
            )}
          </div>
        )}
        
        {showExplanation && question.explanation && (
          <div className="mt-6 p-4 bg-secondary rounded-md">
            <h4 className="font-semibold mb-2">Explanation:</h4>
            <p>{question.explanation}</p>
            {question.correctAnswer && !isMultipleChoice && !isTrueFalse && (
              <div className="mt-2">
                <h4 className="font-semibold">Correct answer:</h4>
                <p className="text-emerald-600 dark:text-emerald-400">
                  {Array.isArray(question.correctAnswer) 
                    ? question.correctAnswer.join(', ') 
                    : question.correctAnswer}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end pt-0">
        <div className="text-sm text-muted-foreground italic">
          Powered by Gemini AI
        </div>
      </CardFooter>
    </Card>
  );
};