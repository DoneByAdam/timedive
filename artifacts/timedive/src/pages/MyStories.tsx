import { useState } from 'react';
import { Link } from 'wouter';
import { useListMyStories } from '@/hooks/use-library';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReadAloud } from '@/components/ReadAloud';
import { ShareStoryButton } from '@/components/ShareStoryButton';
import { Submarine } from '@/components/Submarine';
import { BookOpen, ChevronDown, ExternalLink } from 'lucide-react';

function parseFunFacts(funFacts: string): string[] {
  return funFacts
    .split('\n')
    .filter(l => l.trim().startsWith('•'))
    .map(l => l.replace(/^•\s*/, '').trim());
}

export default function MyStories() {
  const { data: stories, isLoading } = useListMyStories();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Submarine animated />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2 text-primary flex items-center gap-3">
        <BookOpen className="h-8 w-8" /> My Stories
      </h1>
      <p className="text-muted-foreground mb-8">Every story you've generated, saved to read or listen to anytime.</p>

      {!stories || stories.length === 0 ? (
        <Card className="bg-card/60 border-primary/20">
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">You haven't generated any stories yet.</p>
            <Link href="/timeline">
              <Button>Browse Topics</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stories.map(story => {
            const isOpen = expandedId === story.id;
            return (
              <Card key={story.id} className="bg-card/80 backdrop-blur border-primary/20 overflow-hidden">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedId(isOpen ? null : story.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                    <div>
                      <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        {story.category}
                      </div>
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                      <CardDescription>
                        {new Date(story.generatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </CardHeader>
                </button>

                {isOpen && (
                  <CardContent className="space-y-4 border-t border-border pt-4">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <ReadAloud text={`${story.storyText}\n\n${story.funFacts}`} />
                      <div className="flex items-center gap-2">
                        <ShareStoryButton storyId={story.id} isShared={story.isShared} />
                        {story.topicId != null && (
                          <Link href={`/story/${story.topicId}`}>
                            <Button variant="ghost" size="sm" className="gap-1.5">
                              <ExternalLink size={14} /> Open
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-serif">
                      {story.storyText}
                    </div>

                    {parseFunFacts(story.funFacts).length > 0 && (
                      <div className="bg-accent/10 rounded-lg p-4">
                        <p className="font-bold text-accent mb-2">Fun Facts 🎉</p>
                        <ul className="space-y-1.5">
                          {parseFunFacts(story.funFacts).map((f, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <span className="text-accent font-bold shrink-0">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
