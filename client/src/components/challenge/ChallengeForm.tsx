import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getUserQuizzes, createChallenge } from "@/lib/firebase";
import { Quiz } from "@/types/index";
import { nanoid } from "nanoid";

const challengeFormSchema = z.object({
  quizId: z.string().min(1, { message: "Please select a quiz" }),
  timeLimit: z.string(),
  expiration: z.string(),
  showResultsImmediately: z.boolean().default(true),
  recipient: z.string().optional(),
  friendEmail: z.string().email({ message: "Please enter a valid email" }).optional(),
  message: z.string().optional(),
});

type ChallengeFormValues = z.infer<typeof challengeFormSchema>;

type ChallengeFormProps = {
  onChallengeCreated: (challengeToken: string) => void;
};

const ChallengeForm = ({ onChallengeCreated }: ChallengeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      quizId: "",
      timeLimit: "10",
      expiration: "3",
      showResultsImmediately: true,
      recipient: "",
      friendEmail: "",
      message: "",
    },
  });

  useEffect(() => {
    const loadUserQuizzes = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const quizzes = await getUserQuizzes(user.uid);
        setUserQuizzes(quizzes as Quiz[]);
      } catch (error) {
        console.error("Error loading quizzes:", error);
        toast({
          title: "Failed to load quizzes",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserQuizzes();
  }, [user]);

  const onSubmit = async (data: ChallengeFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (!data.recipient && !data.friendEmail) {
        toast({
          title: "Recipient Required",
          description: "Please select a friend or enter an email address",
          variant: "destructive",
        });
        return;
      }
      
      // Find the selected quiz
      const selectedQuiz = userQuizzes.find(q => q.id === data.quizId);
      if (!selectedQuiz) {
        toast({
          title: "Quiz Not Found",
          description: "The selected quiz couldn't be found",
          variant: "destructive",
        });
        return;
      }
      
      // Generate challenge token
      const challengeToken = nanoid(10);
      
      // Create challenge in Firebase
      const challengeData = {
        challengeToken,
        senderId: user?.uid,
        senderName: user?.displayName || user?.email?.split('@')[0] || "Anonymous",
        senderPhoto: user?.photoURL || "",
        receiverId: data.recipient || undefined,
        receiverEmail: data.friendEmail || undefined,
        quizId: data.quizId,
        quizTitle: selectedQuiz.title,
        status: "pending",
        message: data.message,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + parseInt(data.expiration) * 24 * 60 * 60 * 1000),
        timeLimit: parseInt(data.timeLimit),
        showResultsImmediately: data.showResultsImmediately
      };
      
      await createChallenge(challengeData);
      
      toast({
        title: "Challenge Created!",
        description: "Your challenge has been sent successfully",
      });
      
      // Pass the challenge token back to the parent component
      onChallengeCreated(challengeToken);
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({
        title: "Challenge Creation Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userQuizzes.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Quizzes Available</h3>
        <p className="text-gray-600 mb-4">You need to create a quiz before you can challenge someone.</p>
        <Button asChild>
          <a href="/quiz/generate">Create Your First Quiz</a>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">Step 1: Select a Quiz</h2>
          
          <FormField
            control={form.control}
            name="quizId"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-sm font-medium text-gray-700">Choose from your quizzes</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Select a quiz..." />
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
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mb-6">
            <span className="block text-sm font-medium text-gray-700 mb-1">Or generate a new quiz</span>
            <Button asChild type="button" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <a href="/quiz/generate">
                Create New Quiz
              </a>
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">Step 2: Choose Challenge Settings</h2>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Time Limit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select time limit..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">No time limit</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expiration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Challenge Expiration</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select expiration..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="showResultsImmediately"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-4 w-4 text-accent focus:ring-accent"
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-gray-700">Show results immediately after completion</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">Step 3: Send Challenge</h2>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Send to Friend</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select a friend..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="friend1">Michael Chen</SelectItem>
                      <SelectItem value="friend2">Sarah Parker</SelectItem>
                      <SelectItem value="friend3">Alex Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="friendEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Or enter email address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="friend@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Personal Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="I challenge you to beat my score!"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-all"
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
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ChallengeForm;
