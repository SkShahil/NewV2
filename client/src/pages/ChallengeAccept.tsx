import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getChallengeByToken, getQuizById, updateChallengeStatus } from "@/lib/firebase";
import { useQuiz } from "@/context/QuizContext";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const ChallengeAccept = () => {
  const { token } = useParams();
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { loadQuiz } = useQuiz();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        
        const challengeData = await getChallengeByToken(token);
        
        if (!challengeData) {
          setError("Challenge not found or has expired");
          return;
        }
        
        setChallenge(challengeData);
        
        // Fetch the quiz details
        const quizData = await getQuizById(challengeData.quizId);
        
        if (!quizData) {
          setError("Quiz not found");
          return;
        }
        
        setQuiz(quizData);
      } catch (error) {
        console.error("Error fetching challenge:", error);
        setError("Failed to load the challenge");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenge();
  }, [token]);

  const handleAcceptChallenge = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to accept this challenge",
      });
      navigate(`/login?redirect=/challenge/${token}`);
      return;
    }
    
    try {
      // Update challenge status to accepted
      if (challenge.id) {
        await updateChallengeStatus(challenge.id, "accepted");
      }
      
      // Load the quiz into the context
      loadQuiz({
        id: quiz.id,
        title: quiz.title,
        topic: quiz.topic,
        quizType: quiz.quizType,
        questions: quiz.questions,
        timeLimit: challenge.timeLimit
      });
      
      // Navigate to the quiz page
      navigate(`/quiz/${quiz.id}?challenge=${token}`);
    } catch (error) {
      console.error("Error accepting challenge:", error);
      toast({
        title: "Error",
        description: "Failed to accept the challenge",
        variant: "destructive",
      });
    }
  };

  const handleDeclineChallenge = async () => {
    if (!user) {
      navigate("/");
      return;
    }
    
    try {
      if (challenge.id) {
        await updateChallengeStatus(challenge.id, "declined");
      }
      
      toast({
        title: "Challenge Declined",
        description: "You have declined this challenge",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error declining challenge:", error);
      toast({
        title: "Error",
        description: "Failed to decline the challenge",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 pt-16">
        <Card className="rounded-xl card-shadow overflow-hidden">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-16 w-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Challenge Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!challenge || !quiz) {
    return null;
  }

  const expiresIn = challenge.expiresAt
    ? formatDistanceToNow(new Date(challenge.expiresAt.toDate()), { addSuffix: true })
    : "soon";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <Card className="rounded-xl card-shadow overflow-hidden">
        <div className="bg-primary p-6 text-white">
          <h1 className="text-2xl font-bold font-poppins">Quiz Challenge</h1>
          <p className="text-primary-100 opacity-90">You've been challenged to a quiz!</p>
        </div>
        
        <CardContent className="pt-6 pb-8">
          <div className="flex items-center mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage src={challenge.senderPhoto} alt={challenge.senderName} />
              <AvatarFallback className="bg-primary text-white">
                {getInitials(challenge.senderName)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Challenge from</div>
              <div className="text-lg font-medium">{challenge.senderName}</div>
            </div>
          </div>
          
          {challenge.message && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg italic text-gray-600">
              "{challenge.message}"
            </div>
          )}
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{quiz.title}</h3>
              <p className="text-gray-600 mt-1">
                {quiz.questions?.length || 0} questions · {challenge.timeLimit > 0 
                  ? `${challenge.timeLimit} minute time limit` 
                  : "No time limit"}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Challenge expires {expiresIn}
              </div>
              <Badge variant={
                challenge.status === "pending" ? "pending" : 
                challenge.status === "accepted" ? "info" : 
                challenge.status === "completed" ? "success" : "default"
              }>
                {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <Button onClick={handleAcceptChallenge} className="w-full">
              Accept Challenge
            </Button>
            <Button onClick={handleDeclineChallenge} variant="outline" className="w-full">
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeAccept;
