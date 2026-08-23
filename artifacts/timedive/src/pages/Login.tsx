import { useEffect, useState } from 'react';
import { useLogin, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Submarine } from '@/components/Submarine';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Already logged in (e.g. back button, stale link) — bounce to the dashboard
  // instead of showing the form again.
  useEffect(() => {
    if (user) setLocation('/');
  }, [user, setLocation]);

  if (user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { data: { email, password } },
      {
        onSuccess: async (user) => {
          // Cancel any in-flight /api/auth/me (fired on page load, before the
          // session cookie existed) so its stale 401 can't land after this and
          // clobber the fresh user we're about to seed.
          await queryClient.cancelQueries({ queryKey: getGetMeQueryKey() });
          queryClient.setQueryData(getGetMeQueryKey(), user);
          toast({ title: `Welcome back, ${user.displayName}!` });
          if (!user.onboardingComplete) {
            setLocation('/onboarding');
          } else {
            setLocation('/timeline');
          }
        },
        onError: (err) => {
          toast({
            title: "Login failed",
            description: (err as any)?.error?.error || (err as any)?.error || "Please check your credentials",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden ocean-timeline">
      <div className="bubbles-container">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${(i * 11 + 5) % 100}%`,
              width: `${(i % 3) * 8 + 10}px`,
              height: `${(i % 3) * 8 + 10}px`,
              animationDuration: `${(i % 4) + 4}s`,
              animationDelay: `${(i * 0.7) % 5}s`
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md z-10 shadow-2xl bg-card/95 backdrop-blur border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Submarine animated={false} className="w-20 h-20" />
          </div>
          <CardTitle className="text-3xl">Log In</CardTitle>
          <CardDescription>Continue your historical journey</CardDescription>
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
                placeholder="diver@example.com"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={login.isPending} data-testid="button-login">
              {login.isPending ? "Logging in..." : "Log In"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              New explorer?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
