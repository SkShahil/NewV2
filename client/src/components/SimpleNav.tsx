import React from 'react';
import { Link, useLocation } from "wouter";
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';

const SimpleNav = () => {
  const [location] = useLocation();

  return (
    <nav className="bg-background dark:bg-gray-950 shadow-sm sticky top-0 z-50 border-b border-border">
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
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  location === '/' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-foreground hover:border-border hover:text-foreground/70'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`${
                  location === '/about' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-foreground hover:border-border hover:text-foreground/70'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className={`${
                  location === '/contact' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-foreground hover:border-border hover:text-foreground/70'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="gradient-primary">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNav;