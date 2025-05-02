import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MailIcon, PhoneIcon, MapPinIcon, MessageSquareIcon, CheckIcon } from "lucide-react";
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
      
      {/* Map Placeholder */}
      <div className="mb-16 rounded-lg overflow-hidden h-[400px] bg-gray-200 flex items-center justify-center border border-gray-300">
        <p className="text-gray-600 text-lg">Interactive Map Would Be Displayed Here</p>
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