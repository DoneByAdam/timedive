import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useResendVerification } from '@/hooks/use-library';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Mail, X } from 'lucide-react';

export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const resend = useResendVerification();
  const { toast } = useToast();

  if (!user || user.emailVerified !== false || dismissed) return null;

  const handleResend = () => {
    resend.mutate(undefined, {
      onSuccess: () => toast({ title: 'Verification email sent', description: 'Check your inbox.' }),
      onError: () => toast({ title: 'Could not send email', variant: 'destructive' }),
    });
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 text-sm flex items-center justify-center gap-3 flex-wrap">
      <span className="flex items-center gap-2 text-foreground/90">
        <Mail size={14} className="shrink-0" /> Please verify your email address.
      </span>
      <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={handleResend} disabled={resend.isPending}>
        {resend.isPending ? 'Sending…' : 'Resend email'}
      </Button>
      <button
        aria-label="Dismiss"
        className="text-muted-foreground hover:text-foreground ml-1"
        onClick={() => setDismissed(true)}
      >
        <X size={14} />
      </button>
    </div>
  );
}
