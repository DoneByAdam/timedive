import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReadAloud } from '@/components/ReadAloud';
import { useAuth } from '@/hooks/use-auth';
import { stripMarkdown } from '@/lib/strip-markdown';
import { Sparkles, ArrowLeft, RefreshCw, BookOpen, Plus, X } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function generateCustomStory(payload: {
  customTopic: string;
  age?: number;
  hobbies?: string[];
}): Promise<{ storyText: string; funFacts: string }> {
  const res = await fetch(`${BASE}/api/stories/custom`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Story generation failed');
  }
  return res.json();
}

// ─── Constants ───────────────────────────────────────────────────────────────
const TOPIC_SUGGESTIONS = [
  'Ancient Egypt', 'The Roman Empire', 'The Islamic Golden Age',
  'The Vikings', 'The Renaissance', 'World War II',
  'The Space Race', 'Ibn Battuta', 'Al-Andalus',
  'The Ottoman Empire', 'The Silk Road', 'Ancient China',
];

const HOBBY_CHIPS = [
  'Sports', 'Gaming', 'Music', 'Science', 'Art', 'Reading',
  'Cooking', 'Travel', 'Technology', 'Animals', 'Movies', 'Photography',
];

function parseFunFacts(funFacts: string): string[] {
  return funFacts
    .split('\n')
    .filter(l => l.trim().startsWith('•'))
    .map(l => l.replace(/^•\s*/, '').trim());
}

type GenState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; story: string; funFacts: string; topic: string }
  | { status: 'error'; message: string };

// ─── Component ───────────────────────────────────────────────────────────────
export default function StoryGenerator() {
  const { user } = useAuth();

  // Form state
  const [age, setAge] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState('');

  const [genState, setGenState] = useState<GenState>({ status: 'idle' });
  const resultRef = useRef<HTMLDivElement>(null);

  // Pre-fill topic from ?topic= query param (onboarding hand-off)
  const autoGenTriggered = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('topic');
    if (t && !autoGenTriggered.current) {
      autoGenTriggered.current = true;
      setTopic(t);
      handleGenerate({ overrideTopic: t });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleHobby = (h: string) =>
    setSelectedHobbies(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);

  const addCustomHobby = () => {
    const t = customHobby.trim();
    if (!t || selectedHobbies.includes(t)) { setCustomHobby(''); return; }
    setSelectedHobbies(prev => [...prev, t]);
    setCustomHobby('');
  };

  const removeHobby = (h: string) => setSelectedHobbies(prev => prev.filter(x => x !== h));

  const handleGenerate = async (opts?: { overrideTopic?: string }) => {
    const t = (opts?.overrideTopic ?? topic).trim();
    if (!t) return;

    setGenState({ status: 'loading' });
    try {
      const ageNum = age ? parseInt(age, 10) : undefined;
      const result = await generateCustomStory({
        customTopic: t,
        age: ageNum && !isNaN(ageNum) ? ageNum : undefined,
        hobbies: selectedHobbies.length > 0 ? selectedHobbies : undefined,
      });

      // Strip markdown before storing
      const cleanStory = stripMarkdown(result.storyText);
      const cleanFacts = stripMarkdown(result.funFacts);

      setGenState({ status: 'done', story: cleanStory, funFacts: cleanFacts, topic: t });
      // Scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: any) {
      setGenState({ status: 'error', message: err.message || 'Failed to generate story' });
    }
  };

  const isLoading = genState.status === 'loading';
  const isDone = genState.status === 'done';

  const canGenerate = topic.trim().length > 0 && !isLoading;

  return (
    <div className="min-h-[calc(100vh-4rem)] ocean-timeline relative">
      {/* Bubbles */}
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 space-y-6">
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
              Tell us about yourself — we'll write a personalized history story just for you.
            </p>
          </div>
        </div>

        {/* ── Form card ── */}
        <Card className="bg-card/90 backdrop-blur border-primary/20">
          <CardContent className="pt-6 space-y-6">

            {/* Age */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Your age <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                type="number"
                min={4}
                max={120}
                placeholder="e.g. 14"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-32"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Helps us match the vocabulary and depth of the story to you.
              </p>
            </div>

            {/* Historical topic */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Historical topic <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Ibn Sina, The Fall of Rome, The Silk Road…"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canGenerate && handleGenerate()}
                className="text-base"
                disabled={isLoading}
                autoFocus
              />
              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TOPIC_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTopic(s)}
                    disabled={isLoading}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
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

            {/* Hobbies */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Your hobbies <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <p className="text-xs text-muted-foreground">
                We'll weave them into the story as modern parallels or comparisons.
              </p>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-1.5">
                {HOBBY_CHIPS.map(h => (
                  <Button
                    key={h}
                    type="button"
                    size="sm"
                    variant={selectedHobbies.includes(h) ? 'default' : 'outline'}
                    className="rounded-full h-7 text-xs px-3"
                    onClick={() => toggleHobby(h)}
                    disabled={isLoading}
                  >
                    {h}
                  </Button>
                ))}
              </div>

              {/* Custom hobby input */}
              <div className="flex gap-2 pt-1">
                <Input
                  placeholder="Add your own hobby…"
                  value={customHobby}
                  onChange={e => setCustomHobby(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomHobby(); } }}
                  className="flex-1 h-8 text-sm"
                  disabled={isLoading}
                />
                <Button type="button" size="icon" variant="secondary" className="h-8 w-8" onClick={addCustomHobby} disabled={isLoading}>
                  <Plus size={14} />
                </Button>
              </div>

              {/* Selected hobbies as tags */}
              {selectedHobbies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedHobbies.map(h => (
                    <span key={h} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                      {h}
                      <button onClick={() => removeHobby(h)} className="hover:text-destructive" disabled={isLoading}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Generate button */}
            <Button
              onClick={() => handleGenerate()}
              disabled={!canGenerate}
              className="w-full gap-2 text-base py-5"
              size="lg"
            >
              {isLoading ? (
                <><RefreshCw size={18} className="animate-spin" /> Writing your story…</>
              ) : (
                <><Sparkles size={18} /> Generate My Story</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading skeleton */}
        {isLoading && (
          <Card className="bg-card/90 backdrop-blur border-primary/20 animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-1/3 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[100, 90, 95, 80, 88, 75].map((w, i) => (
                <div key={i} className="h-4 bg-muted rounded" style={{ width: `${w}%` }} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {genState.status === 'error' && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="text-destructive font-medium">{genState.message}</p>
              <Button variant="outline" onClick={() => handleGenerate()}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* ── Story result ── */}
        {isDone && (
          <div className="space-y-4" ref={resultRef}>
            <Card className="bg-card/95 backdrop-blur border-primary/20 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BookOpen size={18} className="text-primary" />
                      {genState.topic}
                    </CardTitle>
                    <CardDescription className="mt-1">AI-generated · historically grounded</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground shrink-0"
                    onClick={() => handleGenerate({ overrideTopic: genState.topic })}
                  >
                    <RefreshCw size={14} />
                    Regenerate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Voice narration — receives clean plain text */}
                <ReadAloud text={`${genState.story}\n\n${genState.funFacts}`} />

                {/* Story text (markdown already stripped) */}
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap text-card-foreground">
                  {genState.story}
                </div>
              </CardContent>
            </Card>

            {/* Fun Facts */}
            {genState.funFacts && parseFunFacts(genState.funFacts).length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Fun Facts 🎉</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parseFunFacts(genState.funFacts).map((fact, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-primary font-bold shrink-0">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* CTAs */}
            <div className="flex gap-3 justify-center flex-wrap pt-2">
              <Button
                variant="outline"
                onClick={() => { setGenState({ status: 'idle' }); setTopic(''); }}
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
