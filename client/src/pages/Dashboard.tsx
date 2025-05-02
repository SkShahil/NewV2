import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import ActivityList from "@/components/dashboard/ActivityList";
import ChallengeList from "@/components/dashboard/ChallengeList";
import ProfileCard from "@/components/dashboard/ProfileCard";
import StatsCard from "@/components/dashboard/StatsCard";
import PopularTopicsCard from "@/components/dashboard/PopularTopicsCard";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getUserDocument } from '@/lib/firebase';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDoc = await getUserDocument(currentUser.uid);
          setUserData(userDoc);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      
      setLoading(false);
      
      if (!currentUser) {
        navigate('/login');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-800 mb-1">
          Welcome back, {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || "User"}!
        </h1>
        <p className="text-gray-600">Ready to exercise your brain today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <QuickActionCard
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xl text-primary">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
              <path d="M12 11h4"></path>
              <path d="M12 16h4"></path>
              <path d="M8 11h.01"></path>
              <path d="M8 16h.01"></path>
            </svg>
          }
          title="Generate New Quiz"
          description="Create a custom quiz on any topic using AI."
          linkText="Create now"
          linkUrl="/quiz/generate"
          bgColor="bg-primary bg-opacity-10"
        />

        <QuickActionCard
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xl text-accent">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          }
          title="Challenge a Friend"
          description="Send a challenge to test your friend's knowledge."
          linkText="Challenge now"
          linkUrl="/challenge/create"
          bgColor="bg-accent bg-opacity-10"
        />

        <QuickActionCard
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xl text-purple-600">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
          }
          title="Leaderboard"
          description="See how you rank against other users."
          linkText="View rankings"
          linkUrl="/leaderboard"
          bgColor="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl card-shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold font-poppins text-gray-800">Recent Activity</h2>
              <Button asChild variant="link" className="text-accent text-sm font-medium">
                <Link href="/profile">View all</Link>
              </Button>
            </div>

            <ActivityList />
          </div>

          {/* Current Challenges */}
          <div className="bg-white rounded-xl card-shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold font-poppins text-gray-800">Pending Challenges</h2>
              <Button asChild variant="link" className="text-accent text-sm font-medium">
                <Link href="/challenge/create">See all</Link>
              </Button>
            </div>
            
            <ChallengeList />
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <ProfileCard />
          <StatsCard />
          <PopularTopicsCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
