import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Chart colors
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const Admin = () => {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    userStats: { total: 0, active: 0, new: 0 },
    quizStats: { total: 0, completed: 0, popular: [] },
    feedbackStats: { bug: 0, feature: 0, general: 0 },
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDocs(query(collection(db, 'users'), where('firebaseId', '==', user.uid)));
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          if (userData.role === 'admin') {
            setIsAdmin(true);
            fetchAdminData();
          } else {
            toast({
              title: 'Access Denied',
              description: 'You do not have permission to view this page.',
              variant: 'destructive',
            });
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/dashboard');
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading, navigate, toast]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('joinedDate', 'desc'), limit(50));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      
      // Fetch feedback
      const feedbackRef = collection(db, 'feedback');
      const feedbackQuery = query(feedbackRef, orderBy('createdAt', 'desc'), limit(50));
      const feedbackSnapshot = await getDocs(feedbackQuery);
      
      const feedbackData = feedbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setFeedback(feedbackData);
      
      // Fetch quizzes
      const quizzesRef = collection(db, 'quizzes');
      const quizzesQuery = query(quizzesRef, orderBy('createdAt', 'desc'), limit(50));
      const quizzesSnapshot = await getDocs(quizzesQuery);
      
      const quizzesData = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setQuizzes(quizzesData);
      
      // Calculate analytics
      const now = new Date();
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      
      // User stats
      const newUsers = usersData.filter(u => u.joinedDate?.toDate() > oneMonthAgo).length;
      
      // Quiz stats
      const attemptRef = collection(db, 'quiz_attempts');
      const attemptsSnapshot = await getDocs(query(attemptRef, limit(1000)));
      const attemptData = attemptsSnapshot.docs.map(doc => doc.data());
      
      // Count quizzes by topic
      const quizTopics: Record<string, number> = {};
      quizzesData.forEach(quiz => {
        const topic = quiz.topic;
        if (topic) {
          quizTopics[topic] = (quizTopics[topic] || 0) + 1;
        }
      });
      
      // Get top 5 topics
      const popularTopics = Object.entries(quizTopics)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      // Feedback stats
      const bugCount = feedbackData.filter(f => f.category === 'bug').length;
      const featureCount = feedbackData.filter(f => f.category === 'feature').length;
      const generalCount = feedbackData.filter(f => f.category === 'general').length;
      
      setAnalytics({
        userStats: {
          total: usersData.length,
          active: usersData.filter(u => u.lastActive > oneMonthAgo).length || Math.floor(usersData.length * 0.7), // Estimate if no lastActive
          new: newUsers,
        },
        quizStats: {
          total: quizzesData.length,
          completed: attemptData.length,
          popular: popularTopics,
        },
        feedbackStats: {
          bug: bugCount,
          feature: featureCount,
          general: generalCount,
        },
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (id: string, status: string) => {
    try {
      const feedbackRef = doc(db, 'feedback', id);
      await updateDoc(feedbackRef, { status });
      
      // Update local state
      setFeedback(feedback.map(item => 
        item.id === id ? { ...item, status } : item
      ));
      
      toast({
        title: 'Status Updated',
        description: `Feedback status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update feedback status',
        variant: 'destructive',
      });
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesQuery = searchQuery === '' || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesQuery && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  // Chart data for feedback
  const feedbackChartData = [
    { name: 'Bug Reports', value: analytics.feedbackStats.bug },
    { name: 'Feature Requests', value: analytics.feedbackStats.feature },
    { name: 'General Feedback', value: analytics.feedbackStats.general },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, quizzes, and platform settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Total Users</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-primary">{analytics.userStats.total}</div>
              <Badge variant="success" className="ml-3">
                +{analytics.userStats.new} new
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Quizzes Created</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-primary">{analytics.quizStats.total}</div>
              <div className="ml-3 text-sm text-gray-500">
                {analytics.quizStats.completed} completed
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Feedback Items</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-primary">{feedback.length}</div>
              <div className="ml-3 text-sm text-gray-500">
                {feedback.filter(f => f.status === 'new').length} unresolved
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Popular Quiz Topics</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.quizStats.popular}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="hsl(var(--primary))" name="Number of Quizzes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Feedback Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feedbackChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {feedbackChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">User Management</h3>
                <Input
                  placeholder="Search users..."
                  className="max-w-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 bg-muted p-3 font-medium">
                  <div className="col-span-4">User</div>
                  <div className="col-span-3">Joined</div>
                  <div className="col-span-2">Quizzes</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-1"></div>
                </div>
                
                <div className="divide-y">
                  {users
                    .filter(user => 
                      !searchQuery || 
                      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(user => (
                      <div key={user.id} className="grid grid-cols-12 gap-4 p-3 items-center">
                        <div className="col-span-4 flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.profilePicture} alt={user.displayName || user.email} />
                            <AvatarFallback className="bg-primary text-white text-xs">
                              {getInitials(user.displayName || user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.displayName || 'No name'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="col-span-3 text-sm text-gray-600">
                          {user.joinedDate?.toDate().toLocaleDateString() || 'Unknown'}
                        </div>
                        <div className="col-span-2 text-sm">
                          {user.quizCount || '0'}
                        </div>
                        <div className="col-span-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role || 'user'}
                          </Badge>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium">User Feedback</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Search feedback..."
                    className="max-w-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredFeedback.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No feedback found matching your criteria.</p>
                  </div>
                ) : (
                  filteredFeedback.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                        <div className="flex items-start mb-2 sm:mb-0">
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-800 mr-2">{item.title}</h4>
                              <Badge variant={
                                item.category === 'bug' ? 'destructive' :
                                item.category === 'feature' ? 'info' :
                                'secondary'
                              }>
                                {item.category === 'bug' ? 'Bug' :
                                 item.category === 'feature' ? 'Feature' :
                                 'General'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {item.createdAt?.toLocaleDateString()} • User ID: {item.userId?.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Select
                            defaultValue={item.status}
                            onValueChange={(value) => updateFeedbackStatus(item.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 whitespace-pre-line">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quizzes">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Quiz Management</h3>
                <Input
                  placeholder="Search quizzes..."
                  className="max-w-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 bg-muted p-3 font-medium">
                  <div className="col-span-4">Quiz</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Created</div>
                  <div className="col-span-2">Questions</div>
                  <div className="col-span-2">Actions</div>
                </div>
                
                <div className="divide-y">
                  {quizzes
                    .filter(quiz => 
                      !searchQuery || 
                      quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      quiz.topic?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(quiz => (
                      <div key={quiz.id} className="grid grid-cols-12 gap-4 p-3 items-center">
                        <div className="col-span-4">
                          <div className="font-medium">{quiz.title}</div>
                          <div className="text-sm text-gray-500">Topic: {quiz.topic}</div>
                        </div>
                        <div className="col-span-2">
                          <Badge variant="secondary">
                            {quiz.quizType?.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="col-span-2 text-sm text-gray-600">
                          {quiz.createdAt?.toLocaleDateString() || 'Unknown'}
                        </div>
                        <div className="col-span-2 text-sm">
                          {quiz.questions?.length || '0'} questions
                        </div>
                        <div className="col-span-2 flex justify-end space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
