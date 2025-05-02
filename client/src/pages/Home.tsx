import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-6">
              Test Your Knowledge with AI-Generated Quizzes
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Create custom quizzes powered by AI, challenge your friends, and track your progress - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Button asChild size="lg" className="px-8 py-6 text-lg">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="px-8 py-6 text-lg">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent border-white text-white hover:bg-white hover:text-primary">
                    <Link href="/login">Log In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-poppins text-center mb-12">Why Choose MindMash?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Quizzes</h3>
                <p className="text-gray-600">
                  Generate customized quizzes on any topic in seconds using advanced AI technology. Multiple choice, true/false, and short answer formats available.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-lg bg-accent bg-opacity-10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Challenge Friends</h3>
                <p className="text-gray-600">
                  Send quiz challenges to friends via unique links and compare results. Compete to see who knows more on your favorite topics.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
                <p className="text-gray-600">
                  Monitor your quiz performance, view detailed statistics, and see how you rank against others on the leaderboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-poppins text-center mb-12">How MindMash Works</h2>
          <div className="grid md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2">Enter a Topic</h3>
              <p className="text-gray-600">Type in any subject you want to be quizzed on</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2">AI Generates Quiz</h3>
              <p className="text-gray-600">Our AI creates custom questions just for you</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2">Take the Quiz</h3>
              <p className="text-gray-600">Answer questions and test your knowledge</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-lg font-semibold mb-2">Share Results</h3>
              <p className="text-gray-600">Challenge friends and compare scores</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-poppins mb-6">Ready to Test Your Knowledge?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already creating quizzes, challenging friends, and expanding their knowledge.
          </p>
          {user ? (
            <Button asChild size="lg" className="bg-white text-accent hover:bg-opacity-90 px-8 py-6 text-lg">
              <Link href="/quiz/generate">Create Your First Quiz</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-white text-accent hover:bg-opacity-90 px-8 py-6 text-lg">
              <Link href="/signup">Sign Up for Free</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-white mr-2"
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
                  <path d="M21 2c-1.2 1.2-2.5 2-4.5 2s-3.3-.8-4.5-2)" />
                  <path d="M21 16a2 2 0 0 1-2 2h-6" />
                  <path d="M19 18a2 2 0 0 1-2 2h-2" />
                </svg>
                <span className="font-poppins font-bold text-xl">MindMash</span>
              </div>
              <p className="mt-2 text-gray-400">Expand your knowledge through AI-powered quizzes</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">About</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© {new Date().getFullYear()} MindMash. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
