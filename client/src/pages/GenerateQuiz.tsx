import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import QuizForm from "@/components/quiz/QuizForm";
import { QuizData, useQuiz } from "@/context/QuizContext";
import { getUserQuizzes } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";

interface RecentQuiz {
  id: string;
  title: string;
  quizType: string;
  createdAt: Date;
  completed: boolean;
}

const GenerateQuiz = () => {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const { loadQuiz } = useQuiz();
  const { toast } = useToast();
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }

    const fetchRecentQuizzes = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const quizzes = await getUserQuizzes(user.uid);
        
        const recentQuizzes = quizzes.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          quizType: quiz.quizType,
          createdAt: new Date(quiz.createdAt.toDate()),
          completed: Math.random() > 0.3, // In a real app, this would be determined by quiz attempts
        }));

        setRecentQuizzes(recentQuizzes.slice(0, 5)); // Limit to 5 recent quizzes
      } catch (error) {
        console.error("Error fetching recent quizzes:", error);
        toast({
          title: "Error",
          description: "Failed to load recent quizzes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentQuizzes();
  }, [user, loading, navigate, toast]);

  const handleQuizGenerated = (quizData: QuizData) => {
    loadQuiz(quizData);
    navigate("/quiz/" + (quizData.id || "new"));
  };

  const handleRecentQuizClick = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-800 mb-2">
          Generate a New Quiz
        </h1>
        <p className="text-gray-600">
          Enter a topic and our AI will create a custom quiz just for you.
        </p>
      </div>

      <div className="bg-white rounded-xl card-shadow p-6 mb-8">
        <QuizForm onQuizGenerated={handleQuizGenerated} />
      </div>

      <div className="bg-white rounded-xl card-shadow p-6">
        <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">
          Recently Generated
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center p-3 rounded-lg animate-pulse"
              >
                <div className="bg-gray-300 text-white rounded-lg w-10 h-10 flex-shrink-0"></div>
                <div className="ml-3 w-full">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="ml-auto">
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentQuizzes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent quizzes generated.</p>
            <p className="text-sm text-gray-400 mt-1">
              Use the form above to create your first quiz!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuizzes.map((quiz) => (
              <Button
                key={quiz.id}
                variant="ghost"
                className="flex items-center p-3 rounded-lg hover:bg-secondary transition-all w-full justify-start"
                onClick={() => handleRecentQuizClick(quiz.id)}
              >
                <div className="bg-primary text-white rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                  </svg>
                </div>
                <div className="ml-3 text-left">
                  <h4 className="text-gray-800 font-medium">{quiz.title}</h4>
                  <p className="text-gray-500 text-xs">
                    {quiz.quizType.replace(/-/g, " ")} • Generated{" "}
                    {formatDistanceToNow(quiz.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge
                    variant={quiz.completed ? "success" : "info"}
                    className="rounded-full text-xs"
                  >
                    {quiz.completed ? "Completed" : "Saved"}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateQuiz;
