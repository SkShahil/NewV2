import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { getUserAttempts, getUserChallenges, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const StatsCard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    accuracy: 0,
    winRate: 0,
    subjectsMastered: 0,
    totalSubjects: 12
  });
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user quiz attempts
        const attempts = await getUserAttempts(user.uid);
        
        // Calculate quiz accuracy
        let totalCorrect = 0;
        let totalQuestions = 0;
        
        attempts.forEach((attempt: any) => {
          if (attempt.correctAnswers && attempt.totalQuestions) {
            totalCorrect += attempt.correctAnswers;
            totalQuestions += attempt.totalQuestions;
          }
        });
        
        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        
        // Get user challenges
        const { sent, received } = await getUserChallenges(user.uid);
        
        // Calculate win rate
        const completedChallenges = [
          ...sent.filter((c: any) => c.status === "completed"),
          ...received.filter((c: any) => c.status === "completed")
        ];
        
        let wins = 0;
        completedChallenges.forEach((challenge: any) => {
          if (challenge.winnerId === user.uid) {
            wins++;
          }
        });
        
        const winRate = completedChallenges.length > 0 
          ? Math.round((wins / completedChallenges.length) * 100) 
          : 0;
        
        // Count unique subject categories in successful attempts
        const successfulAttempts = attempts.filter((a: any) => 
          a.score / a.totalQuestions >= 0.7
        );
        
        const subjects = new Set(successfulAttempts.map((a: any) => a.quizCategory || "general"));
        
        setStats({
          accuracy,
          winRate,
          subjectsMastered: subjects.size,
          totalSubjects: 12
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl card-shadow p-6">
        <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">Performance Stats</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between mb-1">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gray-300 h-2.5 rounded-full w-0"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">Performance Stats</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Quiz Accuracy</span>
            <span className="text-sm font-medium text-primary">{stats.accuracy}%</span>
          </div>
          <Progress value={stats.accuracy} className="h-2.5" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Challenge Win Rate</span>
            <span className="text-sm font-medium text-accent">{stats.winRate}%</span>
          </div>
          <Progress value={stats.winRate} className="h-2.5 bg-gray-200 [&>div]:bg-accent" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Subjects Mastered</span>
            <span className="text-sm font-medium text-purple-600">{stats.subjectsMastered}/{stats.totalSubjects}</span>
          </div>
          <Progress 
            value={Math.round((stats.subjectsMastered / stats.totalSubjects) * 100)} 
            className="h-2.5 bg-gray-200 [&>div]:bg-purple-600" 
          />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
