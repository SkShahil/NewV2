import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon, LogOut, Settings, User } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const Navigation = () => {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/quiz/generate", label: "Generate Quiz" },
    { path: "/challenge/create", label: "Challenges" },
    { path: "/leaderboard", label: "Leaderboard" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
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
                <span className="font-poppins font-bold text-xl text-primary">MindMash</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    location === item.path
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:border-accent hover:text-accent"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="ghost" size="icon" className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-2" aria-label="Notifications">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center max-w-xs rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User profile"} />
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(user.displayName || user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[385px]">
                <nav className="flex flex-col h-full">
                  <div className="flex items-center mb-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-primary mr-2"
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
                    <span className="font-poppins font-bold text-xl text-primary">MindMash</span>
                  </div>
                  
                  {user && (
                    <div className="flex items-center mb-6 p-4 bg-secondary rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User profile"} />
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials(user.displayName || user.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">{user.displayName || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setOpen(false)}
                        className={`${
                          location === item.path
                            ? "bg-primary text-white"
                            : "text-gray-600 hover:bg-secondary"
                        } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-gray-200">
                    {user ? (
                      <Button onClick={handleLogout} variant="outline" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link href="/signup" onClick={() => setOpen(false)}>Sign up</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
