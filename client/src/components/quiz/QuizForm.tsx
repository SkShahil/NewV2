import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateQuiz } from "@/lib/gemini";
import { QuizData } from "@/context/QuizContext";

const quizFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters" }),
  quizType: z.enum(["auto", "multiple-choice", "true-false", "short-answer"]),
  timeLimit: z.boolean().optional(),
  downloadable: z.boolean().optional(),
  textToSpeech: z.boolean().optional(),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

type QuizFormProps = {
  onQuizGenerated: (quiz: QuizData) => void;
};

const QuizForm = ({ onQuizGenerated }: QuizFormProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      topic: "",
      quizType: "auto",
      timeLimit: false,
      downloadable: false,
      textToSpeech: true,
    },
  });

  const onSubmit = async (data: QuizFormValues) => {
    try {
      setIsGenerating(true);

      // Prepare params for the quiz generation
      const params = {
        topic: data.topic,
        quizType: data.quizType === "auto" 
          ? "auto" 
          : data.quizType as "multiple-choice" | "true-false" | "short-answer",
        numQuestions: 10, // Default to 10 questions
      };

      // Call the AI to generate the quiz
      const questions = await generateQuiz(params);

      // Convert to quiz data format
      const quizData: QuizData = {
        title: `${data.topic} Quiz`,
        topic: data.topic,
        quizType: data.quizType === "auto" 
          ? questions[0].options 
            ? "multiple-choice" 
            : (typeof questions[0].correctAnswer === "boolean" ? "true-false" : "short-answer")
          : data.quizType as "multiple-choice" | "true-false" | "short-answer",
        questions: questions,
        timeLimit: data.timeLimit ? 10 : undefined, // 10 minutes if time limit is enabled
      };

      toast({
        title: "Quiz Generated!",
        description: `${questions.length} questions created for "${data.topic}"`,
      });

      // Pass the generated quiz up to the parent component
      onQuizGenerated(quizData);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Quiz Generation Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Quiz Topic</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Ancient Greek Mythology, Quantum Physics, World War II..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </FormControl>
              <p className="mt-2 text-sm text-gray-500">
                Be specific for better results. You can include subtopics or specific areas to focus on.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel className="block text-sm font-medium text-gray-700">Quiz Type</FormLabel>
          <FormField
            control={form.control}
            name="quizType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-secondary transition-all">
                      <RadioGroupItem value="auto" id="auto" className="h-4 w-4 text-primary focus:ring-primary" />
                      <Label htmlFor="auto" className="ml-3">
                        <span className="block text-sm font-medium text-gray-700">Auto-Select</span>
                        <span className="block text-xs text-gray-500">AI chooses best format for topic</span>
                      </Label>
                    </div>

                    <div className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-secondary transition-all">
                      <RadioGroupItem value="multiple-choice" id="multiple-choice" className="h-4 w-4 text-primary focus:ring-primary" />
                      <Label htmlFor="multiple-choice" className="ml-3">
                        <span className="block text-sm font-medium text-gray-700">Multiple Choice</span>
                        <span className="block text-xs text-gray-500">Select from 4 options</span>
                      </Label>
                    </div>

                    <div className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-secondary transition-all">
                      <RadioGroupItem value="true-false" id="true-false" className="h-4 w-4 text-primary focus:ring-primary" />
                      <Label htmlFor="true-false" className="ml-3">
                        <span className="block text-sm font-medium text-gray-700">True/False</span>
                        <span className="block text-xs text-gray-500">Determine if statements are correct</span>
                      </Label>
                    </div>

                    <div className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-secondary transition-all">
                      <RadioGroupItem value="short-answer" id="short-answer" className="h-4 w-4 text-primary focus:ring-primary" />
                      <Label htmlFor="short-answer" className="ml-3">
                        <span className="block text-sm font-medium text-gray-700">Short Answer</span>
                        <span className="block text-xs text-gray-500">Type brief responses</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel className="block text-sm font-medium text-gray-700">Options</FormLabel>
          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-secondary transition-all">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-4 w-4 text-accent focus:ring-accent"
                    />
                  </FormControl>
                  <Label htmlFor="timeLimit" className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Enable time limit
                  </Label>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="downloadable"
              render={({ field }) => (
                <FormItem className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-secondary transition-all">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-4 w-4 text-accent focus:ring-accent"
                    />
                  </FormControl>
                  <Label htmlFor="downloadable" className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Make downloadable
                  </Label>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="textToSpeech"
              render={({ field }) => (
                <FormItem className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-secondary transition-all">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-4 w-4 text-accent focus:ring-accent"
                    />
                  </FormControl>
                  <Label htmlFor="textToSpeech" className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Enable text-to-speech
                  </Label>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isGenerating}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuizForm;
