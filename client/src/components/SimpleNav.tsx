import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
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
    <nav className="bg-background dark:bg-header-background shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo section - left side */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-8 w-8 text-primary dark:text-accent mr-2"
              >
                <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" />
                <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" />
                <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" />
                <path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" />
                <path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" />
                <path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" />
              </svg>
              <span className="font-bold text-xl text-primary dark:text-accent">MindMash</span>
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
                    ? 'border-primary text-primary dark:border-accent dark:text-accent' 
                    : 'border-transparent text-foreground dark:text-header-foreground hover:border-primary dark:hover:border-accent hover:text-primary/80 dark:hover:text-accent'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`${
                  location === '/about' 
                    ? 'border-primary text-primary dark:border-accent dark:text-accent' 
                    : 'border-transparent text-foreground dark:text-header-foreground hover:border-primary dark:hover:border-accent hover:text-primary/80 dark:hover:text-accent'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className={`${
                  location === '/contact' 
                    ? 'border-primary text-primary dark:border-accent dark:text-accent' 
                    : 'border-transparent text-foreground dark:text-header-foreground hover:border-primary dark:hover:border-accent hover:text-primary/80 dark:hover:text-accent'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Contact
              </Link>
            </div>
            
            {/* Auth buttons or user profile */}
            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {user.displayName ? getInitials(user.displayName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground dark:text-header-foreground">{user.displayName || 'User'}</p>
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
                      className="text-destructive hover:text-destructive focus:text-destructive cursor-pointer"
                      onClick={async () => {
                        setUser(null);
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
                  <Button asChild variant="ghost" className="dark:text-header-foreground dark:hover:text-accent">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-button-primary-hover-background">
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