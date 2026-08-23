import { useRoute, Link } from 'wouter';
import { useGetPublicStory } from '@/hooks/use-library';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReadAloud } from '@/components/ReadAloud';
import { Submarine } from '@/components/Submarine';
import { Compass } from 'lucide-react';

function parseFunFacts(funFacts: string): string[] {
  return funFacts
    .split('\n')
    .filter(l => l.trim().startsWith('•'))
    .map(l => l.replace(/^•\s*/, '').trim());
}

export default function SharedStory() {
  const [, params] = useRoute('/shared/:token');
  const { data: story, isLoading, error } = useGetPublicStory(params?.token);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Submarine animated />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-bold">This story isn't available</h1>
        <p className="text-muted-foreground">The link may be wrong, or the author has stopped sharing it.</p>
        <Link href="/"><Button>Go to TimeDive</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">Shared from TimeDive</p>
        <Link href="/register">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Compass size={14} /> Explore TimeDive
          </Button>
        </Link>
      </div>

      <Card className="bg-card/95 backdrop-blur border-primary/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{story.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ReadAloud text={`${story.storyText}\n\n${story.funFacts}`} />
          <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 font-serif">
            {story.storyText}
          </div>
        </CardContent>
      </Card>

      {parseFunFacts(story.funFacts).length > 0 && (
        <Card className="mt-6 bg-accent/10 border-accent/20">
          <CardHeader>
            <CardTitle className="text-lg">Fun Facts 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parseFunFacts(story.funFacts).map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
