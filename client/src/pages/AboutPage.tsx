import { GraduationCapIcon, BookOpenIcon, UsersIcon, BrainIcon, StarIcon, TrophyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">About MindMash</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transforming education through artificial intelligence and 
          personalized learning experiences.
        </p>
      </div>

      {/* Our Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 mb-6">
            At MindMash, we're on a mission to revolutionize the way people learn. 
            We believe that education should be personalized, engaging, and accessible to everyone.
          </p>
          <p className="text-lg text-gray-600 mb-6">
            By harnessing the power of artificial intelligence, we create adaptive 
            learning experiences that cater to individual needs, making education more 
            effective and enjoyable.
          </p>
          <div className="mt-8">
            <Button size="lg">
              <GraduationCapIcon className="mr-2 h-5 w-5" />
              Join Our Journey
            </Button>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-8 shadow-md border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <BrainIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Adaptive Learning</h3>
              <p className="text-gray-600">Tailored to your unique learning style and pace</p>
            </div>
          </div>
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <BookOpenIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Diverse Content</h3>
              <p className="text-gray-600">Covering a vast range of subjects and topics</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <UsersIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Community Learning</h3>
              <p className="text-gray-600">Connect with fellow learners worldwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="bg-primary/5 rounded-xl p-8 mb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
          <div className="space-y-6 text-lg text-gray-600">
            <p>
              MindMash was born from a simple observation: traditional education often fails 
              to adapt to individual learning needs. Our founders, a group of educators, 
              technologists, and lifelong learners, set out to create a solution.
            </p>
            <p>
              In 2023, we began developing an AI-powered platform that could generate 
              personalized quizzes on any topic. What started as a small project quickly 
              grew as educators and students alike discovered the power of adaptive learning.
            </p>
            <p>
              Today, MindMash serves thousands of learners across the globe, from students 
              preparing for exams to professionals looking to expand their knowledge. 
              Our commitment to innovation and education excellence remains at the core 
              of everything we do.
            </p>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 text-center">
            <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
              <StarIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
            <p className="text-gray-600">
              We strive for excellence in every quiz, every challenge, and every 
              interaction on our platform.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 text-center">
            <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
              <UsersIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Inclusivity</h3>
            <p className="text-gray-600">
              Education should be accessible to all. We design our platform with 
              inclusivity and diversity in mind.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 text-center">
            <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
              <BrainIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
            <p className="text-gray-600">
              We embrace cutting-edge technology to continuously improve the 
              learning experience.
            </p>
          </div>
        </div>
      </div>

      {/* Meet Our Team - With only 2 key members */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto gap-8">
          <div className="bg-white gradient-card rounded-lg shadow-md overflow-hidden">
            <div className="h-4 gradient-primary"></div>
            <div className="p-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BrainIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center">Dr. Rajesh Kumar</h3>
              <p className="text-primary font-medium text-sm mb-3 text-center">Founder & CEO</p>
              <p className="text-gray-600 text-center">
                With over 15 years of experience in education technology, Rajesh leads our mission to make learning accessible and engaging for everyone.
              </p>
            </div>
          </div>
          
          <div className="bg-white gradient-card rounded-lg shadow-md overflow-hidden">
            <div className="h-4 gradient-secondary"></div>
            <div className="p-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCapIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center">Priya Sharma</h3>
              <p className="text-primary font-medium text-sm mb-3 text-center">CTO & AI Lead</p>
              <p className="text-gray-600 text-center">
                An AI researcher with a passion for education, Priya oversees our technology development and ensures our platform delivers personalized learning experiences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gray-50 rounded-xl p-8 mb-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose MindMash</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
          <div className="flex items-start">
            <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
              <CheckIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">AI-Powered Intelligence</h3>
              <p className="text-gray-600">
                Our advanced AI algorithms create tailored quizzes that adapt to your learning needs.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
              <CheckIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Comprehensive Coverage</h3>
              <p className="text-gray-600">
                From academic subjects to professional skills, we cover a vast range of topics.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
              <CheckIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Social Learning</h3>
              <p className="text-gray-600">
                Challenge friends and compete on leaderboards to make learning more engaging.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
              <CheckIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Detailed Analytics</h3>
              <p className="text-gray-600">
                Track your progress with comprehensive performance metrics and insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary text-white rounded-xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Revolutionize Your Learning?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Join thousands of learners who are already experiencing the future of education with MindMash.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
            <TrophyIcon className="mr-2 h-5 w-5" />
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" className="border-white hover:bg-primary/90">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}