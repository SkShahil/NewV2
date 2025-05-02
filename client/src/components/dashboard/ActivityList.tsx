import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserAttempts } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "quiz" | "challenge" | "achievement";
  title: string;
  details: string;
  timestamp: Date;
}

const ActivityList = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Get recent quiz attempts
        const attempts = await getUserAttempts(user.uid);
        
        // Convert to activities format
        const quizActivities = attempts.map((attempt: any) => ({
          id: attempt.id,
          type: "quiz" as const,
          title: `Completed "${attempt.quizTitle || 'Quiz'}"`,
          details: `Score: ${attempt.score}/${attempt.totalQuestions} • ${formatDistanceToNow(new Date(attempt.createdAt.toDate()), { addSuffix: true })}`,
          timestamp: new Date(attempt.createdAt.toDate()),
        }));
        
        setActivities(quizActivities.slice(0, 3)); // Limit to 3 activities
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivity();
  }, [user]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start p-3 rounded-lg bg-secondary hover:bg-secondary-dark transition-all animate-pulse">
            <div className="bg-gray-300 rounded-lg w-10 h-10 flex-shrink-0"></div>
            <div className="ml-4 w-full">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent activity.</p>
        <button className="mt-2 text-accent font-medium text-sm">
          Take your first quiz
        </button>
      </div>
    );
  }

  const getIconForActivityType = (type: string) => {
    switch (type) {
      case 'quiz':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lg">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        );
      case 'challenge':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lg">
            <path d="m22 2-7 20-4-9-9-4Z"></path>
            <path d="M22 2 11 13"></path>
          </svg>
        );
      case 'achievement':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lg">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lg">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        );
    }
  };

  const getBgColorForActivityType = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-primary';
      case 'challenge':
        return 'bg-accent';
      case 'achievement':
        return 'bg-purple-600';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start p-3 rounded-lg bg-secondary hover:bg-secondary-dark transition-all">
          <div className={`${getBgColorForActivityType(activity.type)} text-white rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0`}>
            {getIconForActivityType(activity.type)}
          </div>
          <div className="ml-4">
            <h4 className="text-gray-800 font-medium">{activity.title}</h4>
            <p className="text-gray-500 text-sm mt-1">{activity.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityList;
