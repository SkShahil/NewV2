import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

function App() {
  const [location] = useLocation();
  
  return (
    <TooltipProvider>
      <Toaster />
      
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-8 w-8 text-primary mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12h1" />
                    <path d="M6 12h1" />
                    <path d="M9 12h1" />
                    <path d="M14 12h1" />
                    <path d="M18 12h1" />
                    <path d="M22 12h1" />
                    <path d="M21 8a9 9 0 0 0-9-9 9.9 9.9 0 0 0-6.29 2.29c-3.2 2.89-3.72 8.67 1.71 14.07a4.5 4.5 0 0 0 6.33 0l.54-.54a4.5 4.5 0 0 1 6.33 0" />
                    <path d="M21 2c-1.2 1.2-2.5 2-4.5 2s-3.3-.8-4.5-2" />
                    <path d="M21 16a2 2 0 0 1-2 2h-6" />
                    <path d="M19 18a2 2 0 0 1-2 2h-2" />
                  </svg>
                  <span className="font-bold text-xl text-primary">MindMash</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-center mb-6 text-primary">
            Welcome to MindMash
          </h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mb-12">
            The AI-powered quiz application that makes learning interactive and engaging. 
            Create quizzes, challenge friends, and boost your knowledge with personalized questions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-4xl w-full">
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 text-primary">AI-Powered Quizzes</h2>
              <p className="text-gray-600 mb-4">
                Generate custom quizzes on any topic in seconds using our advanced Gemini AI integration.
              </p>
              <Button className="w-full">Generate a Quiz</Button>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 text-primary">Challenge Friends</h2>
              <p className="text-gray-600 mb-4">
                Create challenges, share with friends, and compete on the leaderboard to see who knows more.
              </p>
              <Button variant="outline" className="w-full">View Leaderboard</Button>
            </div>
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}

export default App;
