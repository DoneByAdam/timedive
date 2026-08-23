import { useState } from 'react';
import { useSubmitContact } from '@/hooks/use-library';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Submarine } from '@/components/Submarine';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

export default function Contact() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const submitContact = useSubmitContact();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate(
      { name, email, message },
      {
        onSuccess: () => {
          setSent(true);
          setMessage('');
        },
        onError: (err: any) => {
          toast({
            title: 'Could not send message',
            description: err?.data?.error || 'Please try again in a moment.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl bg-card/95 backdrop-blur border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Submarine animated={false} className="w-16 h-16" />
          </div>
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Mail className="h-7 w-7" /> Contact Us
          </CardTitle>
          <CardDescription>Questions, suggestions, or something not working? Let us know.</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-lg font-semibold text-primary">Message sent!</p>
              <p className="text-muted-foreground">Thanks for reaching out — we'll get back to you soon.</p>
              <Button variant="outline" onClick={() => setSent(false)}>Send another message</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  minLength={5}
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitContact.isPending}>
                {submitContact.isPending ? 'Sending…' : 'Send Message'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
