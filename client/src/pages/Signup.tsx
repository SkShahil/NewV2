import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import SignupForm from "@/components/authentication/SignupForm";
import { useAuth } from "@/context/AuthContext";

const Signup = () => {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 pb-8">
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
