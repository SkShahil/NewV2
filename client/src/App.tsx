import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRightIcon, BrainIcon, TrophyIcon, UsersIcon, BookOpenIcon, BoltIcon, GraduationCapIcon, MessageCircleIcon, MailIcon, GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import SimpleNav from "@/components/SimpleNav";

// Import pages
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import GenerateQuiz from "@/pages/GenerateQuiz";
import Leaderboard from "@/pages/Leaderboard";
import ChallengeCreate from "@/pages/ChallengeCreate";

function App() {
  const [location] = useLocation();
  const { theme } = useTheme();
  
  // Apply theme class to body element
  useEffect(() => {
    const body = document.body;
    body.classList.remove('light', 'dark');
    
    if (theme) {
      // If theme is system, detect the preferred color scheme
      const systemTheme = theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
        
      body.classList.add(systemTheme);
    }
  }, [theme]);
  
  return (
    <TooltipProvider>
      <Toaster />
      
      <SimpleNav />
      
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/generate-quiz" component={GenerateQuiz} />
        <Route path="/quiz/generate" component={GenerateQuiz} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/challenge/create" component={ChallengeCreate} />
        <Route component={NotFound} />
      </Switch>
      
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-primary mr-2"
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
                <span className="font-bold text-lg text-primary">MindMash</span>
              </div>
              <p className="text-gray-600 mb-4">
                Empowering learners with AI-powered quizzes and interactive challenges to make education engaging and effective.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <TwitterIcon className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">GitHub</span>
                  <GithubIcon className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">LinkedIn</span>
                  <LinkedinIcon className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Features</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-primary">AI Quiz Generation</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-primary">Challenge Friends</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-primary">Leaderboards</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-primary">Performance Analytics</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/about" className="text-base text-gray-500 hover:text-primary">About Us</a>
                </li>
                <li>
                  <a href="/contact" className="text-base text-gray-500 hover:text-primary">Contact Us</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-primary">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-primary">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; {new Date().getFullYear()} MindMash. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
}

// Home Page Component
function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
                Learn Smarter with<br />AI-Powered Quizzes
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                MindMash combines the power of AI with interactive learning to create personalized quizzes that adapt to your knowledge level and learning style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="sm:px-8 gradient-primary" asChild>
                  <Link href="/signup">
                    <BrainIcon className="mr-2 h-5 w-5" /> Try It Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="sm:px-8 gradient-secondary" asChild>
                  <Link href="/login">
                    <ChevronRightIcon className="mr-2 h-5 w-5" /> Get Started
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-75"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Generated Quiz</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">Biology</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-md bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">What is the powerhouse of the cell?</p>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full border border-primary mr-2"></div>
                          <span className="text-sm text-gray-700">Mitochondria</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full border border-gray-300 mr-2"></div>
                          <span className="text-sm text-gray-700">Nucleus</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full border border-gray-300 mr-2"></div>
                          <span className="text-sm text-gray-700">Endoplasmic Reticulum</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full border border-gray-300 mr-2"></div>
                          <span className="text-sm text-gray-700">Golgi Apparatus</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Supercharge Your Learning Journey
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of learning with our powerful features designed to make education interactive and engaging.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BrainIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">AI Quiz Generation</h3>
              <p className="text-gray-600 mb-4">
                Create customized quizzes on any topic with our advanced Gemini AI integration. Get intelligent questions tailored to your learning needs.
              </p>
              <Link href="/generate-quiz" className="text-primary font-medium flex items-center group">
                Learn more <ChevronRightIcon className="ml-1 h-4 w-4 group-hover:ml-2 transition-all" />
              </Link>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UsersIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Challenge Friends</h3>
              <p className="text-gray-600 mb-4">
                Create competitive quizzes and challenge your friends. Send quiz invitations via email and see who scores higher.
              </p>
              <Link href="/challenge-create" className="text-primary font-medium flex items-center group">
                Learn more <ChevronRightIcon className="ml-1 h-4 w-4 group-hover:ml-2 transition-all" />
              </Link>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrophyIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Global Leaderboards</h3>
              <p className="text-gray-600 mb-4">
                Compete on global leaderboards, earn badges for your achievements, and track your progress over time.
              </p>
              <Link href="/leaderboard" className="text-primary font-medium flex items-center group">
                Learn more <ChevronRightIcon className="ml-1 h-4 w-4 group-hover:ml-2 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How MindMash Works
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Learn anything, anytime with personalized quizzes powered by AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="h-8 w-8 text-primary" />
                <span className="absolute -right-1 -top-1 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Choose a Topic</h3>
              <p className="text-gray-600">
                Select any topic you want to learn about or improve your knowledge in.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                <BoltIcon className="h-8 w-8 text-primary" />
                <span className="absolute -right-1 -top-1 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">AI Generation</h3>
              <p className="text-gray-600">
                Our AI creates personalized questions based on your selected topic and difficulty level.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                <GraduationCapIcon className="h-8 w-8 text-primary" />
                <span className="absolute -right-1 -top-1 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Take the Quiz</h3>
              <p className="text-gray-600">
                Answer the questions at your own pace and receive instant feedback on your performance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                <MessageCircleIcon className="h-8 w-8 text-primary" />
                <span className="absolute -right-1 -top-1 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Learn & Improve</h3>
              <p className="text-gray-600">
                Review explanations, track your progress, and challenge yourself with new quizzes.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start learning?</span>
            <span className="block text-indigo-100">Create your free account today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-50" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button size="lg" variant="outline" className="bg-primary text-white border-white hover:bg-primary/90" asChild>
                <Link href="/about">Learn more</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
