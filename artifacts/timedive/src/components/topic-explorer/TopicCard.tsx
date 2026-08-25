import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Compass, ShieldAlert } from 'lucide-react';
import { getEra, getTheme, type Topic } from '@/data/topics';
import { cn } from '@/lib/utils';

export function TopicCard({
  topic,
  explored,
  onSelect,
}: {
  topic: Topic;
  explored?: boolean;
  onSelect: (topic: Topic) => void;
}) {
  const era = getEra(topic.era);
  const primaryTheme = topic.themes[0] ? getTheme(topic.themes[0]) : undefined;

  return (
    <button
      type="button"
      onClick={() => onSelect(topic)}
      aria-label={`Explore: ${topic.title}`}
      className={cn(
        'text-left w-full rounded-xl border bg-card/80 backdrop-blur p-4 transition-all',
        'hover:border-primary hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'min-h-[44px] border-border',
        explored && 'opacity-80',
      )}
    >
      <Card className="border-0 bg-transparent shadow-none p-0">
        <CardHeader className="p-0 pb-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {era && (
                <span className="text-[11px] font-bold text-primary uppercase tracking-wide bg-primary/10 px-2 py-0.5 rounded-full">
                  {era.label}
                </span>
              )}
              {primaryTheme && (
                <span className="text-[11px] font-bold text-accent uppercase tracking-wide bg-accent/10 px-2 py-0.5 rounded-full">
                  {primaryTheme.label}
                </span>
              )}
            </div>
            {topic.spotlight && (
              <span
                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 shrink-0"
                title={topic.spotlightReason ?? undefined}
              >
                <Compass size={13} /> Hidden History
              </span>
            )}
          </div>
          <CardTitle className="text-lg leading-snug mt-1.5">{topic.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CardDescription className="text-sm leading-relaxed line-clamp-3">
            {topic.hook}
          </CardDescription>
          {topic.sensitivity !== 'light' && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-2">
              <ShieldAlert size={12} className="shrink-0" />
              {topic.sensitivity === 'mature' ? 'Covers difficult history' : 'Some mature themes'}
            </p>
          )}
          {explored && (
            <p className="text-[11px] font-bold text-primary mt-2">✓ Explored</p>
          )}
        </CardContent>
      </Card>
    </button>
  );
}
