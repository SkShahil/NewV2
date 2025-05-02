import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin, resetPassword } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      
      toast({
        title: "Login Successful",
        description: "Welcome back to MindMash!",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Failed to log in. Please try again.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await googleLogin();
      
      toast({
        title: "Login Successful",
        description: "Welcome to MindMash!",
      });
    } catch (error: any) {
      console.error("Google login error:", error);
      
      toast({
        title: "Google Login Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const email = form.getValues("email");
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await resetPassword(email);
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a link to reset your password",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Failed to send password reset email. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address";
      }
      
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold font-poppins">Login to MindMash</h1>
        <p className="text-gray-500">Enter your credentials to access your account</p>
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={googleLoading || isLoading}
          className="w-full"
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2 h-4 w-4"
              preserveAspectRatio="xMidYMid"
            >
              <path 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                fill="#4285F4"
              />
              <path 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                fill="#34A853"
              />
              <path 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
                fill="#FBBC05"
              />
              <path 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-xs font-normal h-auto"
                      onClick={handleResetPassword}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
