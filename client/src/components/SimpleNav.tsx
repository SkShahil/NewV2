import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { auth, logoutUser } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Settings, Bookmark } from 'lucide-react';
import { getInitials } from '@/lib/utils';

const SimpleNav = () => {
  const [location, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as any);
      setLoading(false);
    });
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-background dark:bg-gray-950 shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo section - left side */}
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
          
          {/* Navigation and buttons - right side */}
          <div className="flex items-center gap-2">
            {/* Navigation links */}
            <div className="hidden sm:flex sm:space-x-6 mr-4">
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
            
            {/* Theme toggle */}
            <ThemeToggle />
            
            {/* Auth buttons or user profile */}
            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 via-white to-green-400">
                          {user.displayName ? getInitials(user.displayName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center cursor-pointer">
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={async () => {
                        await logoutUser();
                        navigate('/');
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="gradient-primary">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNav;