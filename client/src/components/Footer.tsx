import { Link } from "wouter";
import { TwitterIcon, GithubIcon, LinkedinIcon } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted dark:bg-footer-background text-muted-foreground dark:text-footer-foreground border-t border-border mt-12 py-6">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-primary dark:text-accent mr-2"
              >
                <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" />
                <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" />
                <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" />
                <path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" />
                <path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" />
                <path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" />
              </svg>
              <span className="font-bold text-lg text-primary dark:text-accent">MindMash</span>
            </div>
            <p className="text-muted-foreground dark:text-footer-foreground mb-4">
              Empowering learners with AI-powered quizzes and interactive challenges to make education engaging and effective.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground dark:text-footer-foreground hover:text-foreground dark:hover:text-accent">
                <span className="sr-only">Twitter</span>
                <TwitterIcon className="h-6 w-6" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground dark:text-footer-foreground hover:text-foreground dark:hover:text-accent">
                <span className="sr-only">GitHub</span>
                <GithubIcon className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground dark:text-footer-foreground hover:text-foreground dark:hover:text-accent">
                <span className="sr-only">LinkedIn</span>
                <LinkedinIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground dark:text-footer-foreground tracking-wider uppercase mb-4">Features</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/generate-quiz" className="text-base text-muted-foreground dark:text-footer-foreground hover:text-primary dark:hover:text-accent">
                  AI Quiz Generation
                </Link>
              </li>
              <li>
                <Link href="/challenge/create" className="text-base text-muted-foreground dark:text-footer-foreground hover:text-primary dark:hover:text-accent">
                  Challenge Friends
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-base text-muted-foreground dark:text-footer-foreground hover:text-primary dark:hover:text-accent">
                  Leaderboards
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-base text-muted-foreground dark:text-footer-foreground hover:text-primary dark:hover:text-accent">
                  Performance Analytics
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground dark:text-footer-foreground tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-base text-muted-foreground dark:text-footer-foreground hover:text-primary dark:hover:text-accent">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-muted-foreground dark:text-footer-foreground hover:text-primary dark:hover:text-accent">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-muted-foreground dark:text-footer-foreground hover:text-primary dark:hover:text-accent">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-muted-foreground dark:text-footer-foreground hover:text-primary dark:hover:text-accent">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-base text-muted-foreground dark:text-footer-foreground text-center">
            &copy; {new Date().getFullYear()} MindMash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 