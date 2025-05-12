import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Mail, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  recipientEmail: z.string().email("Please enter a valid email address"),
  quizType: z.enum(["generate", "existing"], {
    required_error: "Please select a quiz type",
  }),
  topic: z.string().min(3, "Topic must be at least 3 characters").optional(),
  questionType: z.enum(["multiple-choice", "true-false", "short-answer", "auto"], {
    required_error: "Please select a question type",
  }).optional(),
  numQuestions: z.number().min(1).max(20).optional(),
  quizId: z.string().optional(),
  message: z.string().optional(),
  expiryDays: z.enum(["3", "7", "14", "30"], {
    required_error: "Please select an expiry period",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ChallengeCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengeCreated, setChallengeCreated] = useState(false);
  const [challengeLink, setChallengeLink] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [creationError, setCreationError] = useState<string | null>(null);
  const lastSubmittedData = useRef<FormValues | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Get the auth token when the component mounts
  useEffect(() => {
    const getToken = async () => {
      try {
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error getting auth token:", error);
      }
    };
    
    getToken();
    
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
        // Redirect to login if not authenticated
        navigate("/login");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientEmail: "",
      quizType: "generate",
      topic: "",
      questionType: "auto",
      numQuestions: 5,
      message: "",
      expiryDays: "7",
    },
  });
  
  // Watch for quiz type to conditionally render fields
  const quizType = form.watch("quizType");
  
  // Mock user quizzes data - in a real app, this would come from an API call
  const userQuizzes = [
    { id: "quiz1", title: "World Geography" },
    { id: "quiz2", title: "Ancient History" },
    { id: "quiz3", title: "Basic Mathematics" },
    { id: "quiz4", title: "English Literature" },
    { id: "quiz5", title: "Computer Science Fundamentals" },
  ];
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setCreationError(null);
    // Store the form data for retry purposes
    lastSubmittedData.current = data;
    
    if (!authToken) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a challenge.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // First ensure we have a valid quizId
      let quizId = data.quizId;
      
      // If generating a new quiz, construct quiz data to send
      if (data.quizType === 'generate') {
        // For generate mode, ensure we have a topic
        if (!data.topic || data.topic.trim() === '') {
          throw new Error('Please provide a topic for the quiz');
        }
        
        // Use the first quiz from the available quizzes as a fallback if no quiz ID
        if (!quizId) {
          quizId = userQuizzes[0]?.id;
          console.log('Using fallback quiz ID:', quizId);
        }
      } else {
        // For existing quiz mode, ensure a quiz is selected
        if (!quizId) {
          throw new Error('Please select a quiz');
        }
      }
      
      // Prepare the challenge data with all required fields
      const challengeData = {
        quizId: quizId,
        receiverEmail: data.recipientEmail,
        timeLimit: data.numQuestions ? Number(data.numQuestions) * 60 : 300, // Default to 5 minutes if not specified
        showResultsImmediately: true,
        message: data.message || '',
        expiryDays: parseInt(data.expiryDays),
      };
      
      console.log('Sending challenge data:', challengeData);
      
      // API call to create challenge
      const response = await fetch("/api/challenge/create", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(challengeData)
      });
      
      // Parse response data
      const responseData = await response.json();
      console.log('Challenge API response:', responseData);
      
      // Handle server response with more detailed logging
      if (!response.ok) {
        console.error(`Server returned ${response.status} ${response.statusText}`);
        console.error('Response body:', responseData);
        throw new Error(responseData?.message || responseData?.error || `Server error: ${response.status}`);
      }
      
      // Check for explicit error indicators in the response
      if (responseData.error || responseData.success === false) {
        console.error('API indicated error:', responseData);
        throw new Error(responseData.message || responseData.error || 'Failed to create challenge');
      }
      
      // If we reached here, the challenge was created successfully
      console.log('Challenge created successfully:', responseData);
      
        toast({
          title: "Challenge created!",
        description: "Your challenge is ready to share with your friend.",
        });
        
        // Set the challenge link for sharing
      if (responseData.challengeToken) {
        const fullLink = `${window.location.origin}/challenge/accept/${responseData.challengeToken}`;
        console.log('Setting challenge link:', fullLink);
        setChallengeLink(fullLink);
      } else if (responseData.challengeId || responseData.token || responseData.challengeLink) {
        const linkId = responseData.challengeId || responseData.token || '';
        const fullLink = `${window.location.origin}/challenge/accept/${linkId}`;
        console.log('Setting challenge link:', fullLink);
        setChallengeLink(fullLink);
      } else {
        // Fallback to a default format if no ID is provided
        const fallbackLink = `${window.location.origin}/challenge/accept/latest`;
        console.log('Using fallback challenge link:', fallbackLink);
        setChallengeLink(fallbackLink);
      }
      
      // Update UI state to show success screen
      setChallengeCreated(true);
      
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      
      // Store the error message for the retry UI
      setCreationError(error.message || "Unknown error occurred");
      
      // Show a more detailed error message
      toast({
        title: "Challenge creation failed",
        description: error.message || "There was a problem creating your challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Retry function to attempt challenge creation again
  const handleRetry = async () => {
    if (!lastSubmittedData.current) {
      toast({
        title: "Cannot retry",
        description: "No previous submission data available",
        variant: "destructive",
      });
      return;
    }
    
    // Clear any previous error
    setCreationError(null);
    
    // Resubmit with the last data
    await onSubmit(lastSubmittedData.current);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(challengeLink).then(() => {
      toast({
        title: "Link copied!",
        description: "Challenge link copied to clipboard.",
      });
    });
  };
  
  // Send email with challenge link directly
  const sendEmailDirectly = () => {
    const email = form.getValues("recipientEmail");
    const subject = "Quiz Challenge Invitation";
    const body = `Hello,\n\nYou've been challenged to take a quiz! Click the link below to accept:\n\n${challengeLink}\n\n${form.getValues("message") || ''}\n\nThis challenge will expire in ${form.getValues("expiryDays")} days.`;
    
    // Use the noreferrer attribute to prevent COOP errors
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Create an anchor element and trigger it
    const a = document.createElement('a');
    a.href = mailtoLink;
    a.rel = 'noreferrer';
    a.click();
    
    toast({
      title: "Email client launched",
      description: "Your default email client should open with the challenge details.",
    });
  };
  
  if (challengeCreated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Challenge Created!</CardTitle>
            <CardDescription className="text-center">
              Your challenge has been sent successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <Send className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-gray-700 mb-2">
                We've prepared a challenge for <span className="font-medium">{form.getValues("recipientEmail")}</span>
              </p>
              <p className="text-gray-600 text-sm">
                Use the options below to share the challenge link
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Challenge link:</p>
              <div className="flex items-center">
                <Input value={challengeLink} readOnly className="border-r-0 rounded-r-none" />
                <Button 
                  onClick={copyToClipboard}
                  className="rounded-l-none"
                  variant="outline"
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can also share this link directly with your friend
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={sendEmailDirectly}
                className="w-full md:w-auto"
                variant="outline"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send via Email
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <p>Ready to share</p>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4" />
              <p>Expires in {form.getValues("expiryDays")} days</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full gradient-primary" 
              onClick={() => setChallengeCreated(false)}
            >
              Create Another Challenge
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/dashboard")}
            >
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Challenge a Friend</CardTitle>
          <CardDescription className="text-center">
            Create a quiz challenge and send it to a friend
          </CardDescription>
        </CardHeader>
        
        {creationError && (
          <div className="mx-6 mb-4 p-4 border border-red-200 bg-red-50 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Challenge Creation Failed</h3>
            <p className="text-sm text-red-700 mb-3">{creationError}</p>
            <div className="flex justify-end">
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  "Retry Challenge Creation"
                )}
              </Button>
            </div>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Friend's Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="friend@example.com" 
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the email address of the person you want to challenge
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quizType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Quiz Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        disabled={isSubmitting}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="generate" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Generate a new quiz
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="existing" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Use an existing quiz
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {quizType === "generate" ? (
                <>
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quiz Topic</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. World Geography, Physics, Literature..." 
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the topic for the AI to generate questions about
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="questionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="auto">Auto (AI decides)</SelectItem>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="short-answer">Short Answer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the type of questions
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
                          <FormLabel>Number of Questions</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value?.toString()}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of questions" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5">5 questions</SelectItem>
                              <SelectItem value="10">10 questions</SelectItem>
                              <SelectItem value="15">15 questions</SelectItem>
                              <SelectItem value="20">20 questions</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose how many questions to include
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="quizId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Quiz</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select one of your quizzes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userQuizzes.map((quiz) => (
                            <SelectItem key={quiz.id} value={quiz.id}>
                              {quiz.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose from quizzes you've previously created
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Message (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a message to send with your challenge" 
                        className="resize-none"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Add a personal note to your challenge invitation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiryDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenge Expiry</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiry period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                        <SelectItem value="14">2 weeks</SelectItem>
                        <SelectItem value="30">1 month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how long this challenge will be available
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Challenge...
                  </>
                ) : (
                  "Send Challenge"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="mt-8 bg-muted/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">How Challenges Work</h3>
        <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
          <li>Create a new quiz or select one of your existing quizzes</li>
          <li>Send the challenge to your friend via email</li>
          <li>Your friend will receive a link to take the quiz</li>
          <li>Compare your results when they complete the challenge</li>
          <li>Climb the leaderboard based on your performance</li>
        </ol>
      </div>
    </div>
  );
};

export default ChallengeCreate;