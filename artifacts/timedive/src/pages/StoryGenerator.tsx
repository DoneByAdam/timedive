import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReadAloud } from '@/components/ReadAloud';
import { useAuth } from '@/hooks/use-auth';
import { Sparkles, ArrowLeft, RefreshCw, BookOpen } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function generateCustomStory(customTopic: string): Promise<{ storyText: string; funFacts: string }> {
  const res = await fetch(`${BASE}/api/stories/custom`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customTopic }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Story generation failed');
  }
  return res.json();
}

const TOPIC_SUGGESTIONS = [
  "Ancient Egypt", "The Roman Empire", "The Islamic Golden Age",
  "The Vikings", "The Renaissance", "World War II",
  "The Space Race", "Ibn Battuta", "Al-Andalus",
  "The Ottoman Empire", "The Silk Road", "Ancient China",
];

function parseFunFacts(funFacts: string): string[] {
  return funFacts
    .split('\n')
    .filter(l => l.trim().startsWith('•'))
    .map(l => l.replace(/^•\s*/, '').trim());
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; story: string; funFacts: string; topic: string }
  | { status: 'error'; message: string };

export default function StoryGenerator() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [topic, setTopic] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });

  // Pre-fill topic from query string (set by onboarding)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('topic');
    if (t) {
      setTopic(t);
      // Auto-generate if we came from onboarding
      handleGenerate(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (overrideTopic?: string) => {
    const t = (overrideTopic ?? topic).trim();
    if (!t) return;
    setState({ status: 'loading' });
    try {
      const result = await generateCustomStory(t);
      setState({ status: 'done', story: result.storyText, funFacts: result.funFacts, topic: t });
    } catch (err: any) {
      setState({ status: 'error', message: err.message || 'Failed to generate story' });
    }
  };

  const isLoading = state.status === 'loading';
  const isDone = state.status === 'done';

  return (
    <div className="min-h-[calc(100vh-4rem)] ocean-timeline relative">
      <div className="bubbles-container pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${(i * 13 + 7) % 100}%`,
              width: `${(i % 3) * 8 + 12}px`,
              height: `${(i % 3) * 8 + 12}px`,
              animationDuration: `${(i % 3) + 5}s`,
              animationDelay: `${(i * 0.8) % 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/timeline">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles size={22} className="text-yellow-300" />
              Story Generator
            </h1>
            <p className="text-white/70 text-sm">
              Type any historical topic, era, or figure — get a personalized story
              {user ? ` tailored for you, ${user.displayName}` : ''}.
            </p>
          </div>
        </div>

        {/* Input card */}
        <Card className="bg-card/90 backdrop-blur border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Ibn Sina, The Fall of Rome, The Silk Road..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isLoading && handleGenerate()}
                className="flex-1 text-base"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleGenerate()}
                disabled={isLoading || !topic.trim()}
                className="gap-2 shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Writing…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {/* Suggestions */}
            {!isDone && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick picks:</p>
                <div className="flex flex-wrap gap-1.5">
                  {TOPIC_SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setTopic(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        topic === s
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:border-primary hover:text-primary bg-background/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading skeleton */}
        {isLoading && (
          <Card className="bg-card/90 backdrop-blur border-primary/20 animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-1/3 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[100, 90, 95, 80, 88].map((w, i) => (
                <div key={i} className="h-4 bg-muted rounded" style={{ width: `${w}%` }} />
              ))}
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="text-destructive font-medium">{state.message}</p>
              <Button variant="outline" onClick={() => handleGenerate()}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* Story result */}
        {isDone && (
          <div className="space-y-4">
            <Card className="bg-card/95 backdrop-blur border-primary/20 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BookOpen size={18} className="text-primary" />
                      {state.topic}
                    </CardTitle>
                    <CardDescription className="mt-1">AI-generated · historically grounded</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 shrink-0 text-muted-foreground"
                    onClick={() => handleGenerate(state.topic)}
                    title="Regenerate story"
                  >
                    <RefreshCw size={14} />
                    Regenerate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Narration controls */}
                <ReadAloud text={`${state.story}\n\n${state.funFacts}`} />

                {/* Story text */}
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap text-card-foreground">
                  {state.story}
                </div>
              </CardContent>
            </Card>

            {/* Fun Facts */}
            {state.funFacts && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {state.funFacts.split('\n')[0]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parseFunFacts(state.funFacts).map((fact, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-primary font-bold shrink-0">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* CTA — try another */}
            <div className="flex gap-3 justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => { setState({ status: 'idle' }); setTopic(''); }}
                className="gap-2"
              >
                <Sparkles size={15} />
                Try Another Topic
              </Button>
              <Link href="/timeline">
                <Button variant="ghost" className="gap-2">
                  <BookOpen size={15} />
                  Browse All Topics
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
