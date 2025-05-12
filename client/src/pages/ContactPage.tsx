import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MailIcon, PhoneIcon, MapPinIcon, MessageSquareIcon, CheckIcon, GithubIcon } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send the form data to a server
    setFormSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false);
      const form = e.target as HTMLFormElement;
      form.reset();
    }, 3000);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Have questions about MindMash? We're here to help. Get in touch with our team.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
          
          {formSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-center text-gray-600">
                Thank you for contacting us. We'll get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" required placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" required placeholder="Enter your last name" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" required placeholder="Enter your email address" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required placeholder="What is this regarding?" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  required 
                  placeholder="Please provide details about your inquiry..." 
                  className="min-h-[150px]" 
                />
              </div>
              
              <Button type="submit" className="w-full">
                <MessageSquareIcon className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </form>
          )}
        </div>
        
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
          
          <div className="space-y-8">
            <div className="flex">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <MailIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Email Us</h3>
                <p className="text-gray-600 mb-1">For general inquiries:</p>
                <a href="mailto:info@mindmash.com" className="text-primary hover:underline">
                  info@mindmash.com
                </a>
                <p className="text-gray-600 mt-2 mb-1">For support:</p>
                <a href="mailto:support@mindmash.com" className="text-primary hover:underline">
                  support@mindmash.com
                </a>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <PhoneIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Call Us</h3>
                <p className="text-gray-600 mb-1">Main Office:</p>
                <a href="tel:+1-555-123-4567" className="text-primary hover:underline">
                  +1 (555) 123-4567
                </a>
                <p className="text-gray-600 mt-2 mb-1">Support Hotline:</p>
                <a href="tel:+1-555-987-6543" className="text-primary hover:underline">
                  +1 (555) 987-6543
                </a>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <MapPinIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Visit Us</h3>
                <p className="text-gray-600">
                  123 Innovation Drive<br />
                  Tech Center, Suite 456<br />
                  San Francisco, CA 94105<br />
                  United States
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Business Hours</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Monday - Friday:</span>
                <span className="font-medium">9:00 AM - 6:00 PM (PST)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saturday:</span>
                <span className="font-medium">10:00 AM - 4:00 PM (PST)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sunday:</span>
                <span className="font-medium">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Meet Our Developers Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">Meet Our Developers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Sk Shahil Akhtar Card */}
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-xl font-semibold text-primary mb-1">Sk Shahil Akhtar</h3>
            <p className="text-sm text-muted-foreground mb-3">Front-end Developer</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href="mailto:skshahilakhtar@gmail.com" className="hover:underline">skshahilakhtar@gmail.com</a>
              </div>
              <div className="flex items-center">
                <GithubIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href="https://github.com/SkShahil" target="_blank" rel="noopener noreferrer" className="hover:underline">github.com/SkShahil</a>
              </div>
            </div>
          </div>

          {/* Sahil Singh Card */}
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-xl font-semibold text-primary mb-1">Sahil Singh</h3>
            <p className="text-sm text-muted-foreground mb-3">Back-end Developer</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href="mailto:sahilrajputsingh81@gmail.com" className="hover:underline">sahilrajputsingh81@gmail.com</a>
              </div>
              <div className="flex items-center">
                <GithubIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href="https://github.com/SahilSR81" target="_blank" rel="noopener noreferrer" className="hover:underline">github.com/SahilSR81</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-gray-50 rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">How do I create a MindMash account?</h3>
            <p className="text-gray-600">
              Creating an account is easy! Click on the "Sign Up" button in the top navigation bar, 
              fill in your details, and you're ready to start your learning journey.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Is MindMash free to use?</h3>
            <p className="text-gray-600">
              MindMash offers both free and premium plans. The free plan gives you access to 
              basic features, while the premium plans offer advanced capabilities and unlimited quizzes.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">How does the AI generate quizzes?</h3>
            <p className="text-gray-600">
              Our AI analyzes vast amounts of educational content to generate relevant, 
              accurate questions on your chosen topic. The system learns from user interactions 
              to continuously improve the quality of questions.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Can I challenge my friends to quizzes?</h3>
            <p className="text-gray-600">
              Absolutely! After creating or taking a quiz, you can send challenge invitations 
              to your friends via email. They'll receive a link to take the same quiz, and you 
              can compare results on the leaderboard.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <Button>
            View All FAQs
          </Button>
        </div>
      </div>
      
      {/* Connect With Us Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Connect With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white gradient-card p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">
              Our support team is available via email to answer your questions promptly.
            </p>
            <a href="mailto:support@mindmash.com" className="text-primary font-medium hover:underline">
              support@mindmash.com
            </a>
          </div>
          
          <div className="bg-white gradient-card p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">
              Need immediate assistance? Chat with our customer service representatives.
            </p>
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
              Start Chat
            </Button>
          </div>
          
          <div className="bg-white gradient-card p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Help Center</h3>
            <p className="text-gray-600 mb-4">
              Browse our comprehensive knowledge base for tutorials and guides.
            </p>
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
              Visit Help Center
            </Button>
          </div>
        </div>
      </div>
      
      {/* Newsletter Signup */}
      <div className="bg-primary text-white rounded-xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Subscribe to our newsletter to receive the latest updates, educational content, and exclusive offers.
        </p>
        <div className="max-w-md mx-auto flex gap-2">
          <Input 
            placeholder="Enter your email address" 
            className="bg-white" 
          />
          <Button className="bg-white text-primary hover:bg-gray-100">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}