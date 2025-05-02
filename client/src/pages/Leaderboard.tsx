import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrophyIcon, MedalIcon, Clock, BarChart4, User } from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string;
  photoURL: string | null;
  score: number;
  quizzesTaken: number;
  averageScore: number;
  rank: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?period=${period}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        if (data && data.users) {
          setUsers(data.users);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        toast({
          title: "Failed to load leaderboard",
          description: "There was a problem loading the leaderboard data.",
          variant: "destructive",
        });
        
        // Load data from Firebase directly instead
        setUsers([
          {
            id: '1',
            name: 'Sarah Johnson',
            photoURL: null,
            score: 1850,
            quizzesTaken: 28,
            averageScore: 87.3,
            rank: 1
          },
          {
            id: '2',
            name: 'Michael Chen',
            photoURL: null,
            score: 1720,
            quizzesTaken: 24,
            averageScore: 85.9,
            rank: 2
          },
          {
            id: '3',
            name: 'Aisha Patel',
            photoURL: null,
            score: 1640,
            quizzesTaken: 22,
            averageScore: 82.1,
            rank: 3
          },
          {
            id: '4',
            name: 'Carlos Rodriguez',
            photoURL: null,
            score: 1580,
            quizzesTaken: 20,
            averageScore: 80.7,
            rank: 4
          },
          {
            id: '5',
            name: 'Emma Wilson',
            photoURL: null,
            score: 1490,
            quizzesTaken: 19,
            averageScore: 78.4,
            rank: 5
          },
          {
            id: '6',
            name: 'Jamal Williams',
            photoURL: null,
            score: 1450,
            quizzesTaken: 18,
            averageScore: 77.2,
            rank: 6
          },
          {
            id: '7',
            name: 'Olivia Martinez',
            photoURL: null,
            score: 1390,
            quizzesTaken: 17,
            averageScore: 75.9,
            rank: 7
          },
          {
            id: '8',
            name: 'David Kim',
            photoURL: null,
            score: 1310,
            quizzesTaken: 15,
            averageScore: 74.3,
            rank: 8
          },
          {
            id: '9',
            name: 'Sophie Brown',
            photoURL: null,
            score: 1250,
            quizzesTaken: 14,
            averageScore: 72.8,
            rank: 9
          },
          {
            id: '10',
            name: 'Ahmed Hassan',
            photoURL: null,
            score: 1190,
            quizzesTaken: 12,
            averageScore: 71.5,
            rank: 10
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period, toast]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Leaderboard</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          See how you stack up against other learners. Earn points by completing quizzes and 
          challenges to climb the rankings.
        </p>
      </div>

      <Tabs defaultValue="weekly" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="weekly" onClick={() => setPeriod('weekly')}>Weekly</TabsTrigger>
          <TabsTrigger value="monthly" onClick={() => setPeriod('monthly')}>Monthly</TabsTrigger>
          <TabsTrigger value="allTime" onClick={() => setPeriod('allTime')}>All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Top 3 Users */}
          <div className="lg:col-span-4">
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
              {/* 2nd place */}
              {users.length > 1 && (
                <div className="flex-1 max-w-xs">
                  <Card className="bg-gray-50 border-gray-200 transition h-full">
                    <CardContent className="pt-6 pb-4 px-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-secondary/30 mx-auto flex items-center justify-center mb-4">
                        <MedalIcon className="h-8 w-8 text-secondary" />
                      </div>
                      <div className="mb-2">
                        <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto overflow-hidden border-4 border-secondary">
                          {users[1].photoURL ? (
                            <img src={users[1].photoURL} alt={users[1].name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                              <User className="h-10 w-10 text-secondary" />
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold">{users[1].name}</h3>
                      <p className="text-2xl font-bold text-secondary mt-2">{users[1].score} pts</p>
                      <div className="mt-4 flex justify-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{users[1].quizzesTaken} quizzes</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart4 className="h-3 w-3 mr-1" />
                          <span>{users[1].averageScore}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 1st place */}
              {users.length > 0 && (
                <div className="flex-1 max-w-xs">
                  <Card className="bg-gradient-to-b from-primary/10 to-primary/5 border-primary/20 shadow-lg transform md:scale-110 transition h-full">
                    <CardContent className="pt-6 pb-4 px-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/30 mx-auto flex items-center justify-center mb-4">
                        <TrophyIcon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="mb-2">
                        <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto overflow-hidden border-4 border-primary">
                          {users[0].photoURL ? (
                            <img src={users[0].photoURL} alt={users[0].name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/20">
                              <User className="h-12 w-12 text-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold">{users[0].name}</h3>
                      <p className="text-3xl font-bold text-primary mt-2">{users[0].score} pts</p>
                      <div className="mt-4 flex justify-center gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{users[0].quizzesTaken} quizzes</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart4 className="h-3 w-3 mr-1" />
                          <span>{users[0].averageScore}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 3rd place */}
              {users.length > 2 && (
                <div className="flex-1 max-w-xs">
                  <Card className="bg-gray-50 border-gray-200 transition h-full">
                    <CardContent className="pt-6 pb-4 px-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-amber-500/30 mx-auto flex items-center justify-center mb-4">
                        <MedalIcon className="h-8 w-8 text-amber-500" />
                      </div>
                      <div className="mb-2">
                        <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto overflow-hidden border-4 border-amber-500">
                          {users[2].photoURL ? (
                            <img src={users[2].photoURL} alt={users[2].name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-500/20">
                              <User className="h-10 w-10 text-amber-500" />
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold">{users[2].name}</h3>
                      <p className="text-2xl font-bold text-amber-500 mt-2">{users[2].score} pts</p>
                      <div className="mt-4 flex justify-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{users[2].quizzesTaken} quizzes</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart4 className="h-3 w-3 mr-1" />
                          <span>{users[2].averageScore}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Rest of Leaderboard */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>Rankings</CardTitle>
                <CardDescription>See how users compare by score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Rank</th>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3 text-center">Quizzes</th>
                        <th className="px-6 py-3 text-center">Avg. Score</th>
                        <th className="px-6 py-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.slice(3).map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                                {user.photoURL ? (
                                  <img src={user.photoURL} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                                    <User className="h-6 w-6 text-primary" />
                                  </div>
                                )}
                              </div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {user.quizzesTaken}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {user.averageScore}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                            {user.score} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;