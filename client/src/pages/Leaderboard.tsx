import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getInitials } from '@/lib/utils';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  score: number;
  quizCount: number;
  avgAccuracy: number;
  challengeWins: number;
}

const Leaderboard = () => {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('topScorers');
  const [topScorers, setTopScorers] = useState<LeaderboardEntry[]>([]);
  const [mostActive, setMostActive] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<{ score: number; active: number } | null>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Get top scorers (users with highest average scores)
        const usersRef = collection(db, 'users');
        const attemptsRef = collection(db, 'quiz_attempts');
        
        // Get all attempts for score calculation
        const attemptsQuery = query(
          attemptsRef,
          orderBy('completedAt', 'desc'),
          where('completedAt', '>', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))) // Last 30 days
        );
        const attemptsSnapshot = await getDocs(attemptsQuery);
        
        // Get all users
        const usersSnapshot = await getDocs(usersRef);
        
        // Process data to calculate scores
        const userData: Record<string, any> = {};
        
        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          userData[doc.id] = {
            userId: doc.id,
            displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
            photoURL: user.photoURL,
            totalScore: 0,
            quizCount: 0,
            avgAccuracy: 0,
            challengeWins: 0,
          };
        });
        
        // Process attempt data
        attemptsSnapshot.forEach((doc) => {
          const attempt = doc.data();
          const userId = attempt.userId;
          
          if (userData[userId]) {
            userData[userId].totalScore += attempt.score;
            userData[userId].quizCount += 1;
          }
        });
        
        // Calculate average scores
        Object.keys(userData).forEach((userId) => {
          if (userData[userId].quizCount > 0) {
            userData[userId].avgAccuracy = Math.round(userData[userId].totalScore / userData[userId].quizCount);
          }
        });
        
        // Convert to array and sort for both leaderboards
        const userArray = Object.values(userData);
        
        // Only include users who have taken at least one quiz
        const activeUsers = userArray.filter((u: any) => u.quizCount > 0);
        
        // Top scorers (by average accuracy)
        const sortedByScore = [...activeUsers].sort((a: any, b: any) => b.avgAccuracy - a.avgAccuracy);
        setTopScorers(sortedByScore.slice(0, 10));
        
        // Most active (by quiz count)
        const sortedByActivity = [...activeUsers].sort((a: any, b: any) => b.quizCount - a.quizCount);
        setMostActive(sortedByActivity.slice(0, 10));
        
        // Find current user's rank
        if (user) {
          const scoreRank = sortedByScore.findIndex((entry: any) => entry.userId === user.uid) + 1;
          const activeRank = sortedByActivity.findIndex((entry: any) => entry.userId === user.uid) + 1;
          
          setUserRank({
            score: scoreRank > 0 ? scoreRank : sortedByScore.length + 1,
            active: activeRank > 0 ? activeRank : sortedByActivity.length + 1
          });
        }
        
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboardData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-800 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other MindMash users.</p>
      </div>

      {user && userRank && (
        <Card className="bg-primary text-white mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 border-2 border-white">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback className="bg-accent text-white">
                    {getInitials(user.displayName || user.email || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="text-sm opacity-80">Your Ranking</p>
                  <h3 className="text-xl font-semibold">
                    {user.displayName || user.email?.split('@')[0]}
                  </h3>
                </div>
              </div>
              <div className="flex space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{userRank.score}</p>
                  <p className="text-xs opacity-80">Score Rank</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{userRank.active}</p>
                  <p className="text-xs opacity-80">Activity Rank</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="topScorers" onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="topScorers">Top Scorers</TabsTrigger>
            <TabsTrigger value="mostActive">Most Active</TabsTrigger>
          </TabsList>
          <p className="text-sm text-gray-500">
            Leaderboard updates daily
          </p>
        </div>
        
        <TabsContent value="topScorers" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="bg-primary text-white py-3 px-4 rounded-t-lg">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-5">User</div>
                  <div className="col-span-2 text-center">Avg. Score</div>
                  <div className="col-span-2 text-center">Quizzes</div>
                  <div className="col-span-2 text-center">Accuracy</div>
                </div>
              </div>
              
              <div className="divide-y">
                {topScorers.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No data available yet
                  </div>
                ) : (
                  topScorers.map((entry, index) => (
                    <div 
                      key={entry.userId}
                      className={`grid grid-cols-12 gap-4 py-3 px-4 items-center ${
                        user && entry.userId === user.uid ? 'bg-secondary' : ''
                      }`}
                    >
                      <div className="col-span-1 text-center font-bold">
                        {index === 0 ? (
                          <span className="text-yellow-500 text-lg">🥇</span>
                        ) : index === 1 ? (
                          <span className="text-gray-400 text-lg">🥈</span>
                        ) : index === 2 ? (
                          <span className="text-amber-700 text-lg">🥉</span>
                        ) : (
                          `${index + 1}`
                        )}
                      </div>
                      <div className="col-span-5 flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={entry.photoURL} alt={entry.displayName} />
                          <AvatarFallback className="bg-primary text-white text-xs">
                            {getInitials(entry.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{entry.displayName}</span>
                      </div>
                      <div className="col-span-2 text-center font-medium">
                        {entry.avgAccuracy}%
                      </div>
                      <div className="col-span-2 text-center">
                        {entry.quizCount}
                      </div>
                      <div className="col-span-2 text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mx-auto">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${entry.avgAccuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mostActive" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="bg-accent text-white py-3 px-4 rounded-t-lg">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-5">User</div>
                  <div className="col-span-3 text-center">Quizzes Taken</div>
                  <div className="col-span-3 text-center">Avg. Score</div>
                </div>
              </div>
              
              <div className="divide-y">
                {mostActive.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No data available yet
                  </div>
                ) : (
                  mostActive.map((entry, index) => (
                    <div 
                      key={entry.userId}
                      className={`grid grid-cols-12 gap-4 py-3 px-4 items-center ${
                        user && entry.userId === user.uid ? 'bg-secondary' : ''
                      }`}
                    >
                      <div className="col-span-1 text-center font-bold">
                        {index === 0 ? (
                          <span className="text-yellow-500 text-lg">🏆</span>
                        ) : index === 1 ? (
                          <span className="text-gray-400 text-lg">🏆</span>
                        ) : index === 2 ? (
                          <span className="text-amber-700 text-lg">🏆</span>
                        ) : (
                          `${index + 1}`
                        )}
                      </div>
                      <div className="col-span-5 flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={entry.photoURL} alt={entry.displayName} />
                          <AvatarFallback className="bg-accent text-white text-xs">
                            {getInitials(entry.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{entry.displayName}</span>
                      </div>
                      <div className="col-span-3 text-center font-medium">
                        {entry.quizCount}
                      </div>
                      <div className="col-span-3 text-center">
                        {entry.avgAccuracy}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
