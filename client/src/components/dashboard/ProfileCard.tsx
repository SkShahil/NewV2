import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { format } from "date-fns";
import { getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getUserAttempts, getUserChallenges } from "@/lib/firebase";

const ProfileCard = () => {
  const { user, userData } = useAuth();
  const [stats, setStats] = useState({
    quizzes: 0,
    avgScore: 0,
    challenges: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Get user attempts
        const attempts = await getUserAttempts(user.uid);
        
        // Get user challenges
        const { sent, received } = await getUserChallenges(user.uid);
        
        // Calculate stats
        const totalQuizzes = attempts.length;
        
        let totalScore = 0;
        attempts.forEach((attempt: any) => {
          totalScore += (attempt.score / attempt.totalQuestions) * 100;
        });
        
        const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
        const totalChallenges = sent.length + received.length;
        
        setStats({
          quizzes: totalQuizzes,
          avgScore,
          challenges: totalChallenges
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-white rounded-xl card-shadow">
        <div className="bg-primary p-6 pb-12 relative">
          <h2 className="text-white text-lg font-semibold mb-2 font-poppins">Your Profile</h2>
          <p className="text-primary-100 text-sm opacity-80">Please sign in</p>
        </div>
        <div className="px-6 pt-0 pb-6 -mt-8">
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const joinedDate = userData?.createdAt ? format(new Date(userData.createdAt.toDate()), 'MMM yyyy') : format(new Date(), 'MMM yyyy');
  
  const quizLevel = stats.quizzes >= 20 ? "Quiz Master" : stats.quizzes >= 10 ? "Quiz Pro" : "Quiz Novice";
  const quizLevelNumber = stats.quizzes >= 20 ? 3 : stats.quizzes >= 10 ? 2 : 1;

  return (
    <div className="bg-white rounded-xl card-shadow overflow-hidden">
      <div className="bg-primary p-6 pb-12 relative">
        <h2 className="text-white text-lg font-semibold mb-2 font-poppins">Your Profile</h2>
        <p className="text-primary-100 text-sm opacity-80">{quizLevel} Level {quizLevelNumber}</p>
      </div>
      <div className="px-6 pt-0 pb-6 -mt-8">
        <div className="flex items-center">
          <Avatar className="h-16 w-16 border-4 border-white">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User profile"} />
            <AvatarFallback className="bg-primary text-white text-lg">
              {getInitials(user.displayName || user.email || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="text-gray-800 font-medium text-lg">
              {user.displayName || user.email?.split('@')[0]}
            </h3>
            <p className="text-gray-500 text-sm">Joined {joinedDate}</p>
          </div>
        </div>
        
        {loading ? (
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-2 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-md mb-1"></div>
                <div className="h-4 bg-gray-100 rounded-md mx-auto w-12"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="p-2">
              <h4 className="text-2xl font-semibold text-primary">{stats.quizzes}</h4>
              <p className="text-xs text-gray-500 mt-1">Quizzes</p>
            </div>
            <div className="p-2">
              <h4 className="text-2xl font-semibold text-primary">{stats.avgScore}%</h4>
              <p className="text-xs text-gray-500 mt-1">Avg. Score</p>
            </div>
            <div className="p-2">
              <h4 className="text-2xl font-semibold text-primary">{stats.challenges}</h4>
              <p className="text-xs text-gray-500 mt-1">Challenges</p>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <Button asChild variant="outline" className="w-full">
            <Link href="/profile">
              View Full Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
