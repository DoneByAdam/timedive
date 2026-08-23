import { useState } from 'react';
import { Share2, Check, Link2Off } from 'lucide-react';
import { Button } from './ui/button';
import { useShareStory, useUnshareStory } from '@/hooks/use-library';
import { useToast } from '@/hooks/use-toast';

export function ShareStoryButton({ storyId, isShared: initialShared }: { storyId: number; isShared?: boolean }) {
  const [shared, setShared] = useState(!!initialShared);
  const [justCopied, setJustCopied] = useState(false);
  const share = useShareStory();
  const unshare = useUnshareStory();
  const { toast } = useToast();

  const handleShare = () => {
    share.mutate(storyId, {
      onSuccess: ({ shareToken }) => {
        const url = `${window.location.origin}/shared/${shareToken}`;
        navigator.clipboard?.writeText(url).catch(() => {});
        setShared(true);
        setJustCopied(true);
        toast({ title: 'Link copied!', description: 'Anyone with this link can read the story.' });
        setTimeout(() => setJustCopied(false), 2000);
      },
      onError: () => toast({ title: 'Could not create share link', variant: 'destructive' }),
    });
  };

  const handleUnshare = () => {
    unshare.mutate(storyId, {
      onSuccess: () => {
        setShared(false);
        toast({ title: 'Story is no longer shared' });
      },
    });
  };

  if (shared) {
    return (
      <Button variant="secondary" size="sm" className="gap-1.5" onClick={handleUnshare} disabled={unshare.isPending}>
        <Link2Off size={14} /> Stop Sharing
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare} disabled={share.isPending}>
      {justCopied ? <Check size={14} /> : <Share2 size={14} />}
      {justCopied ? 'Copied!' : 'Share'}
    </Button>
  );
}
