import { Link } from "wouter";
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, limit, query, getFirestore } from "firebase/firestore";

interface Topic {
  id: string;
  name: string;
  count: number;
  icon: JSX.Element;
  color: string;
}

const PopularTopicsCard = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularTopics = async () => {
      const db = getFirestore();
      
      try {
        setLoading(true);
        
        // This would normally fetch from the database, but we'll use sample data
        // since we haven't implemented the full backend yet
        const sampleTopics: Topic[] = [
          {
            id: "science",
            name: "Science",
            count: 2100,
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8"></circle>
                <path d="M12 2v4"></path>
                <path d="M12 18v4"></path>
                <path d="m4.93 4.93 2.83 2.83"></path>
                <path d="m16.24 16.24 2.83 2.83"></path>
                <path d="M2 12h4"></path>
                <path d="M18 12h4"></path>
                <path d="m4.93 19.07 2.83-2.83"></path>
                <path d="m16.24 7.76 2.83-2.83"></path>
              </svg>
            ),
            color: "bg-blue-100 text-blue-600"
          },
          {
            id: "geography",
            name: "Geography",
            count: 1800,
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
            ),
            color: "bg-green-100 text-green-600"
          },
          {
            id: "literature",
            name: "Literature",
            count: 1500,
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            ),
            color: "bg-purple-100 text-purple-600"
          },
          {
            id: "history",
            name: "History",
            count: 1200,
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            ),
            color: "bg-red-100 text-red-600"
          }
        ];
        
        setTopics(sampleTopics);
      } catch (error) {
        console.error("Error fetching popular topics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopularTopics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl card-shadow p-6">
        <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">Popular Quiz Topics</h2>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center p-2 rounded-lg animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="ml-auto h-3 bg-gray-100 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">Popular Quiz Topics</h2>
      <div className="space-y-3">
        {topics.map((topic) => (
          <Link 
            key={topic.id} 
            href={`/quiz/generate?topic=${topic.name}`}
            className="flex items-center p-2 rounded-lg hover:bg-secondary transition-all"
          >
            <span className={`w-8 h-8 rounded-full ${topic.color} flex items-center justify-center mr-3`}>
              {topic.icon}
            </span>
            <span className="text-gray-700">{topic.name}</span>
            <span className="ml-auto text-xs font-medium text-gray-500">
              {topic.count >= 1000 ? `${(topic.count / 1000).toFixed(1)}k` : topic.count} quizzes
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularTopicsCard;
