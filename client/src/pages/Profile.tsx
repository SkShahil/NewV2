import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Camera, LogOut } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, updateProfile, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, getUserAttempts } from '@/lib/firebase';
import { getInitials, safelyFormatDate } from '@/lib/utils';
import { format } from 'date-fns';

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  birthdate: z.string().optional(),
  linkedinUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  instagramUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const [, navigate] = useLocation();
  const auth = getAuth();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<{
    totalQuizzes: number;
    avgScore: number;
    bestScore: number;
    subjectsMastered: string[];
  }>({
    totalQuizzes: 0,
    avgScore: 0,
    bestScore: 0,
    subjectsMastered: [],
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      firstName: '',
      lastName: '',
      birthdate: '',
      linkedinUrl: '',
      instagramUrl: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Set form default values
          form.reset({
            displayName: user.displayName || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            birthdate: userData.birthdate || '',
            linkedinUrl: userData.linkedinUrl || '',
            instagramUrl: userData.instagramUrl || '',
          });
        }
        
        // Fetch user quiz attempts
        const attempts = await getUserAttempts(user.uid);
        
        // Calculate stats
        if (attempts.length > 0) {
          let totalScore = 0;
          let bestScore = 0;
          const subjects = new Set<string>();
          
          attempts.forEach((attempt: any) => {
            const score = (attempt.correctAnswers / attempt.totalQuestions) * 100;
            totalScore += score;
            if (score > bestScore) bestScore = score;
            
            // Add to subjects if mastered (score >= 70%)
            if (score >= 70 && attempt.quizCategory) {
              subjects.add(attempt.quizCategory);
            }
          });
          
          setStats({
            totalQuizzes: attempts.length,
            avgScore: Math.round(totalScore / attempts.length),
            bestScore: Math.round(bestScore),
            subjectsMastered: Array.from(subjects),
          });
          
          // Set recent activity
          setRecentActivity(attempts.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, authLoading, navigate, toast, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    try {
      setSaving(true);
      
      // Update display name in Auth
      if (data.displayName !== user.displayName) {
        await updateProfile(auth.currentUser!, {
          displayName: data.displayName
        });
        // Force reload user data
        setUser({ ...auth.currentUser });
      }
      
      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        firstName: data.firstName,
        lastName: data.lastName,
        birthdate: data.birthdate,
        linkedinUrl: data.linkedinUrl,
        instagramUrl: data.instagramUrl,
      });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
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

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Get joined date (formatted)
  const joinedDate = user.metadata?.creationTime 
    ? format(new Date(user.metadata.creationTime), 'MMMM yyyy')
    : 'Unknown';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-800 mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your account details and view your quiz statistics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile info */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-white shadow">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback className="bg-primary text-white text-lg">
                          {getInitials(user.displayName || user.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 shadow-md">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{user.displayName || user.email?.split('@')[0]}</h2>
                      <p className="text-gray-500">Joined {joinedDate}</p>
                      <p className="text-gray-500 mt-1">{user.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="birthdate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Birthdate</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Social Links</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="linkedinUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>LinkedIn URL</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://linkedin.com/in/username" 
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="instagramUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instagram URL</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://instagram.com/username" 
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Quiz Activity</h3>
                  
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You haven't taken any quizzes yet.</p>
                      <Button 
                        variant="link" 
                        onClick={() => navigate('/quiz/generate')}
                        className="mt-2"
                      >
                        Generate your first quiz
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity: any, index) => (
                        <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">{activity.quizTitle || 'Quiz'}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Score: {activity.correctAnswers}/{activity.totalQuestions} •&nbsp;
                                {safelyFormatDate(activity.completedAt)}
                              </p>
                            </div>
                            <Badge variant={
                              (activity.correctAnswers / activity.totalQuestions) >= 0.8 ? 'success' :
                              (activity.correctAnswers / activity.totalQuestions) >= 0.6 ? 'warning' :
                              'destructive'
                            }>
                              {Math.round((activity.correctAnswers / activity.totalQuestions) * 100)}%
                            </Badge>
                          </div>
                          <Button 
                            variant="link" 
                            className="mt-2 h-auto p-0 text-accent"
                            onClick={() => navigate(`/results/${activity.id}`)}
                          >
                            View Results
                          </Button>
                        </div>
                      ))}
                      
                      <div className="text-center mt-4">
                        <Button variant="outline" onClick={() => navigate('/dashboard')}>
                          View All Activity
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-medium mb-2">Email Address</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">{user.email}</p>
                        <Button variant="outline" size="sm">Change Email</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-base font-medium mb-2">Password</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">••••••••••••</p>
                        <Button variant="outline" size="sm">Change Password</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-base font-medium mb-2 text-red-600">Danger Zone</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600">Sign out from your account</p>
                          <p className="text-sm text-gray-500">You can sign in again anytime</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column - Stats */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Quiz Statistics</h3>
              
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.totalQuizzes}</p>
                  <p className="text-xs text-gray-500">Quizzes Taken</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.avgScore}%</p>
                  <p className="text-xs text-gray-500">Average Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.bestScore}%</p>
                  <p className="text-xs text-gray-500">Best Score</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Average Performance</span>
                    <span className="text-sm font-medium text-primary">{stats.avgScore}%</span>
                  </div>
                  <Progress value={stats.avgScore} className="h-2" />
                </div>
                
                {stats.subjectsMastered.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Subjects Mastered</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.subjectsMastered.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/quiz/generate')}
                >
                  Generate New Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-700">{joinedDate}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-gray-700 text-sm truncate">{user.uid}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="text-gray-700">
                    {user.providerData[0]?.providerId === 'google.com' 
                      ? 'Google Account' 
                      : 'Email & Password'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
