import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { getGetMeQueryKey } from '@workspace/api-client-react';
import { useVerifyEmail } from '@/hooks/use-library';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Submarine } from '@/components/Submarine';

export default function VerifyEmail() {
  const verifyEmail = useVerifyEmail();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    verifyEmail.mutate(token, {
      onSuccess: () => {
        setStatus('success');
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: () => setStatus('error'),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl bg-card/95 backdrop-blur border-primary/20">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Submarine animated={status === 'verifying'} className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl">
            {status === 'verifying' && 'Verifying your email…'}
            {status === 'success' && 'Email verified!'}
            {status === 'error' && 'Link expired or invalid'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && <p className="text-muted-foreground">You're all set.</p>}
          {status === 'error' && (
            <p className="text-muted-foreground">
              This verification link is no longer valid. You can request a new one from your profile page.
            </p>
          )}
          {status !== 'verifying' && (
            <Link href="/"><Button className="w-full">Continue to TimeDive</Button></Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
