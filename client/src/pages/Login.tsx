import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/authentication/LoginForm";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
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
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
