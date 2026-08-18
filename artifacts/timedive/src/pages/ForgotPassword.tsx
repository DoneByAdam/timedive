import { useState } from 'react';
import { useForgotPassword } from '@workspace/api-client-react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          toast({ title: "Reset link sent", description: "Check your email for reset instructions." });
          setLocation('/login');
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: "Something went wrong. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className="text-sm text-center">
              <Link href="/login" className="text-primary hover:underline">
                Back to log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
