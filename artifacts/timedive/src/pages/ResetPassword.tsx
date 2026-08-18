import { useState } from 'react';
import { useResetPassword } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const resetPassword = useResetPassword();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Extract token from URL /reset-password?token=XYZ
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: "Invalid token", description: "No reset token provided.", variant: "destructive" });
      return;
    }
    
    resetPassword.mutate(
      { data: { token, password } },
      {
        onSuccess: () => {
          toast({ title: "Password updated", description: "You can now log in with your new password." });
          setLocation('/login');
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: (err as any)?.error?.error || (err as any)?.error || "Failed to reset password.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>This password reset link is invalid or expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Choose New Password</CardTitle>
          <CardDescription>Enter a new password for your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
