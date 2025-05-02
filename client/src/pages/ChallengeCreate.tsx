import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, ClipboardCheck, ClipboardCopy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ChallengeForm from "@/components/challenge/ChallengeForm";

const ChallengeCreate = () => {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleChallengeCreated = (token: string) => {
    setChallengeToken(token);
  };

  const getChallengeUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/challenge/${challengeToken}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getChallengeUrl());
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Challenge link copied to clipboard",
      });

      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to Copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-800 mb-2">
          Challenge a Friend
        </h1>
        <p className="text-gray-600">
          Select a quiz and send a challenge to test your friend's knowledge.
        </p>
      </div>

      {challengeToken ? (
        <Card className="bg-white rounded-xl card-shadow overflow-hidden">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="h-20 w-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Challenge Created!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Share this unique link with your friend to challenge them. The link will remain active based on your expiration settings.
              </p>

              <div className="relative max-w-lg mx-auto mt-4">
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-700 pr-12 truncate">
                  {getChallengeUrl()}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <ClipboardCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <ClipboardCopy className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                <Button
                  onClick={() => setChallengeToken(null)}
                  variant="outline"
                >
                  Create Another Challenge
                </Button>
                <Button onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl card-shadow p-6 mb-8">
          <ChallengeForm onChallengeCreated={handleChallengeCreated} />
        </div>
      )}
    </div>
  );
};

export default ChallengeCreate;
