import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserChallenges, updateChallengeStatus } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

interface Challenge {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  quizTitle: string;
  status: "pending" | "accepted" | "completed" | "declined";
  challengeToken: string;
}

const ChallengeList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { received } = await getUserChallenges(user.uid);
        
        // Convert to challenges format
        const pendingChallenges = received
          .filter((challenge: any) => challenge.status === "pending")
          .map((challenge: any) => ({
            id: challenge.id,
            senderId: challenge.senderId,
            senderName: challenge.senderName || "Friend",
            senderPhoto: challenge.senderPhoto,
            quizTitle: challenge.quizTitle || "Quiz Challenge",
            status: challenge.status,
            challengeToken: challenge.challengeToken,
          }));
        
        setChallenges(pendingChallenges);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, [user]);
  
  const handleAcceptChallenge = async (challengeId: string, token: string) => {
    try {
      await updateChallengeStatus(challengeId, "accepted");
      
      // Update state
      setChallenges(challenges.filter(c => c.id !== challengeId));
      
      toast({
        title: "Challenge Accepted",
        description: "Good luck with your challenge!",
      });
      
      // Redirect to challenge page
      window.location.href = `/challenge/${token}`;
    } catch (error) {
      console.error("Error accepting challenge:", error);
      toast({
        title: "Error",
        description: "Failed to accept challenge. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeclineChallenge = async (challengeId: string) => {
    try {
      await updateChallengeStatus(challengeId, "declined");
      
      // Update state
      setChallenges(challenges.filter(c => c.id !== challengeId));
      
      toast({
        title: "Challenge Declined",
        description: "Challenge has been declined.",
      });
    } catch (error) {
      console.error("Error declining challenge:", error);
      toast({
        title: "Error",
        description: "Failed to decline challenge. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-all animate-pulse">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                <div className="ml-3">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="mt-4 flex space-x-2">
              <div className="h-8 bg-gray-300 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (challenges.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending challenges.</p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/challenge/create">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Challenge a friend
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <div key={challenge.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-all">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={challenge.senderPhoto} alt={challenge.senderName} />
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(challenge.senderName)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h4 className="font-medium text-gray-800">{challenge.senderName}</h4>
                <p className="text-sm text-gray-500">{challenge.quizTitle}</p>
              </div>
            </div>
            <Badge variant="pending">Pending</Badge>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button 
              className="flex-1" 
              onClick={() => handleAcceptChallenge(challenge.id, challenge.challengeToken)}
            >
              Accept Challenge
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => handleDeclineChallenge(challenge.id)}
            >
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChallengeList;
