import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { onAuthStateChanged } from "firebase/auth";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  quizType: z.enum(["multiple-choice", "true-false", "short-answer", "auto"], {
    required_error: "Please select a quiz type",
  }),
  numQuestions: z.number().min(1).max(20),
});

type FormValues = z.infer<typeof formSchema>;

const GenerateQuiz = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Get the authentication token if the user is logged in
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          setAuthToken(token);
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      }
      
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      quizType: "auto",
      numQuestions: 5,
    },
  });
  
  // If not authenticated, redirect to login
  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }
  
  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    
    if (!authToken) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate quizzes.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }
    
    try {
      console.log('Generating quiz with data:', data);
      console.log('Using auth token (first 20 chars):', authToken?.substring(0, 20) + '...');
      
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.message || responseData.error || 'Failed to generate quiz');
      }
      
      if (responseData.questions && Array.isArray(responseData.questions)) {
        console.log('Questions received successfully, count:', responseData.questions.length);
        
        // Create a quiz object with the generated questions
        const generatedQuiz = {
          title: `${data.topic} Quiz`,
          topic: data.topic,
          quizType: data.quizType,
          questions: responseData.questions,
          timeLimit: 10 // Default time limit of 10 minutes
        };
        
        console.log('Storing quiz in localStorage:', generatedQuiz);
        
        try {
          // Store the generated quiz in local storage
          localStorage.setItem('generatedQuiz', JSON.stringify(generatedQuiz));
          
          console.log('Successfully stored quiz in localStorage');
          
          toast({
            title: "Quiz generated!",
            description: "Your quiz has been successfully created.",
          });
          
          // Ensure toast is shown before navigation
          setTimeout(() => {
            console.log('Navigating to /quiz...');
            
            // Check if the current route might already be /quiz (which could cause issues)
            console.log('Current location:', location);
            
            // Navigate to the quiz page, always using wouter navigate
            navigate("/quiz");
            
            // Log for debugging
            console.log('Navigation to /quiz requested');
          }, 100);
        } catch (err) {
          console.error('Error during post-generation process:', err);
          toast({
            title: "Error",
            description: "There was a problem processing the quiz. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        console.error("Invalid response format:", responseData);
        throw new Error("Quiz generation failed - invalid response format");
      }
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Generation failed",
        description: error.message || "There was a problem generating your quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Generate a New Quiz</CardTitle>
          <CardDescription className="text-center">
            Use AI to create a customized quiz on any topic
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Topic</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Solar System, World War II, Machine Learning..." 
                        {...field}
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter any topic you want to learn about
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quizType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Type</FormLabel>
                    <Select 
                      disabled={isGenerating}
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quiz type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="auto">Auto (AI decides best format)</SelectItem>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of questions for your quiz
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="numQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        disabled={isGenerating}
                        value={[field.value]}
                        min={1}
                        max={20}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Choose how many questions you want in your quiz (1-20)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full gradient-primary" 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="mt-8 bg-muted/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">How Quiz Generation Works</h3>
        <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
          <li>Enter any topic you're interested in learning about</li>
          <li>Select your preferred question format or let the AI decide</li>
          <li>Our AI generates meaningful questions that test your knowledge</li>
          <li>Take the quiz immediately or save it for later</li>
          <li>Get instant feedback and explanations to enhance your learning</li>
        </ol>
      </div>
    </div>
  );
};

export default GenerateQuiz;