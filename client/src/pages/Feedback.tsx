import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db, submitFeedback } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';

const feedbackFormSchema = z.object({
  category: z.string().min(1, { message: 'Please select a category' }),
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  message: z.string().min(10, { message: 'Feedback must be at least 10 characters' }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackItem {
  id: string;
  category: string;
  title: string;
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: Date;
}

const Feedback = () => {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      category: '',
      title: '',
      message: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchFeedback = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const feedbackRef = collection(db, 'feedback');
        const q = query(
          feedbackRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        const items: FeedbackItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            category: data.category,
            title: data.title,
            message: data.message,
            status: data.status,
            createdAt: new Date(data.createdAt.toDate()),
          });
        });

        setFeedbackItems(items);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your feedback history',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [user, authLoading, navigate, toast]);

  const onSubmit = async (data: FeedbackFormValues) => {
    if (!user) return;

    try {
      setSubmitting(true);
      await submitFeedback(user.uid, {
        category: data.category,
        title: data.title,
        message: data.message,
      });

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback! We appreciate your input.',
      });

      // Add the new feedback to the list
      setFeedbackItems([
        {
          id: `temp-${Date.now()}`,
          category: data.category,
          title: data.title,
          message: data.message,
          status: 'new',
          createdAt: new Date(),
        },
        ...feedbackItems,
      ]);

      // Reset the form
      form.reset();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission Failed',
        description: 'Unable to submit your feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-800 mb-2">Feedback</h1>
        <p className="text-gray-600">Help us improve MindMash by sharing your thoughts and suggestions.</p>
      </div>

      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="history">My Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submit">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="general">General Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of your feedback" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please provide as much detail as possible" 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : feedbackItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't submitted any feedback yet.</p>
                  <Button 
                    variant="link" 
                    onClick={() => document.querySelector('[data-value="submit"]')?.click()}
                  >
                    Submit your first feedback
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-800">{item.title}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            item.status === 'new' ? 'default' :
                            item.status === 'reviewed' ? 'info' :
                            'success'
                          }>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">
                            {item.category === 'bug' ? 'Bug Report' :
                             item.category === 'feature' ? 'Feature Request' :
                             'General Feedback'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{item.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Feedback;
