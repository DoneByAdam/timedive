import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import type { Topic } from '@/data/topics';

export function SensitivityDialog({
  topic,
  onCancel,
  onConfirm,
}: {
  topic: Topic | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!topic} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="text-amber-500" /> A heads-up first
          </DialogTitle>
          <DialogDescription>
            {topic?.sensitivity === 'mature'
              ? "This topic covers difficult, real history. We'll tell the story thoughtfully and age-appropriately — but you may want to read it together."
              : "This topic touches on some tougher moments in history. We'll keep the story age-appropriate."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onCancel}>Choose something else</Button>
          <Button onClick={onConfirm}>Continue with "{topic?.title}"</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
