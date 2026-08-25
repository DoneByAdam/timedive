import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useGetProfile } from '@workspace/api-client-react';
import { useExploredTopics } from '@/hooks/use-explored-topics';
import { TopicCard } from '@/components/topic-explorer/TopicCard';
import { SensitivityDialog } from '@/components/topic-explorer/SensitivityDialog';
import { Button } from '@/components/ui/button';
import {
  ERAS,
  THEMES,
  TOPICS,
  type Topic,
  filterTopics,
  topicsByEra,
  allRegions,
  gradeBandIdForAge,
  getGradeBand,
  needsSensitivityConfirmation,
} from '@/data/topics';
import { Compass, Sparkles, GraduationCap, Map as MapIcon } from 'lucide-react';

type ViewMode = 'timeline' | 'explore' | 'grade';

export default function TopicExplorer() {
  const { user } = useAuth();
  const { data: profile } = useGetProfile();
  const [, setLocation] = useLocation();
  const { explored, markExplored } = useExploredTopics(user?.id);

  const [view, setView] = useState<ViewMode>('timeline');
  const [pendingTopic, setPendingTopic] = useState<Topic | null>(null);

  // Explore Freely filters — single-select chips per category, toggled on/off.
  const [eraId, setEraId] = useState<string | undefined>();
  const [themeId, setThemeId] = useState<string | undefined>();
  const [region, setRegion] = useState<string | undefined>();
  const [spotlightOnly, setSpotlightOnly] = useState(false);

  const age = profile?.age ?? undefined;
  const gradeBandId = age != null ? gradeBandIdForAge(age) : undefined;
  const gradeBand = gradeBandId ? getGradeBand(gradeBandId) : undefined;
  // The grade bands only cover ages 5-18 — outside that (adults, mainly),
  // there's no single band to recommend, so show everything instead.
  const outsideDefinedBands = age != null && !gradeBandId;

  const regions = useMemo(() => allRegions(), []);
  // Reversed to match Timeline's existing convention: scrolling down means
  // diving deeper, i.e. further back in time (recent eras first, ancient last).
  const eraGroups = useMemo(() => [...topicsByEra()].reverse(), []);

  const freelyFiltered = useMemo(
    () => filterTopics({ eraId, themeId, region, spotlightOnly }),
    [eraId, themeId, region, spotlightOnly],
  );

  const recommended = useMemo(() => {
    if (gradeBandId) return filterTopics({ gradeBandId });
    if (outsideDefinedBands) return TOPICS;
    return [];
  }, [gradeBandId, outsideDefinedBands]);

  const proceedToStory = (topic: Topic) => {
    markExplored(topic.id);
    setLocation(`/story-generator?topic=${encodeURIComponent(topic.title)}`);
  };

  const handleSelect = (topic: Topic) => {
    if (needsSensitivityConfirmation(topic, age)) {
      setPendingTopic(topic);
    } else {
      proceedToStory(topic);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] ocean-timeline relative">
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
              animationDelay: `${(i * 0.7) % 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-3 flex items-center justify-center gap-3">
            <Compass className="h-9 w-9" aria-hidden /> Topic Explorer
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Browse history by era, by theme, or find topics picked just for you.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist" aria-label="How to browse">
          <Button
            variant={view === 'timeline' ? 'default' : 'outline'}
            onClick={() => setView('timeline')}
            className="gap-2"
            role="tab"
            aria-selected={view === 'timeline'}
          >
            <MapIcon size={16} aria-hidden /> Timeline Path
          </Button>
          <Button
            variant={view === 'explore' ? 'default' : 'outline'}
            onClick={() => setView('explore')}
            className="gap-2"
            role="tab"
            aria-selected={view === 'explore'}
          >
            <Sparkles size={16} aria-hidden /> Explore Freely
          </Button>
          <Button
            variant={view === 'grade' ? 'default' : 'outline'}
            onClick={() => setView('grade')}
            className="gap-2"
            role="tab"
            aria-selected={view === 'grade'}
          >
            <GraduationCap size={16} aria-hidden /> For My Grade
          </Button>
        </div>

        {view === 'timeline' && (
          <div className="space-y-10">
            {eraGroups.map(({ era, topics }) => {
              if (topics.length === 0) return null;
              const exploredCount = topics.filter(t => explored.has(t.id)).length;
              return (
                <section key={era.id} aria-labelledby={`era-${era.id}`}>
                  <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
                    <div>
                      <h2 id={`era-${era.id}`} className="text-2xl font-bold text-white">{era.label}</h2>
                      <p className="text-blue-200 text-sm">{era.range}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-100 bg-white/10 px-3 py-1 rounded-full whitespace-nowrap">
                      {exploredCount} of {topics.length} explored
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topics.map(topic => (
                      <TopicCard key={topic.id} topic={topic} explored={explored.has(topic.id)} onSelect={handleSelect} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {view === 'explore' && (
          <div>
            <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-4 mb-6 space-y-4">
              <FilterRow label="Era">
                <FilterChips
                  options={ERAS.map(e => ({ id: e.id, label: e.label }))}
                  active={eraId}
                  onSelect={id => setEraId(prev => (prev === id ? undefined : id))}
                />
              </FilterRow>
              <FilterRow label="Theme">
                <FilterChips
                  options={THEMES.map(t => ({ id: t.id, label: t.label }))}
                  active={themeId}
                  onSelect={id => setThemeId(prev => (prev === id ? undefined : id))}
                />
              </FilterRow>
              <FilterRow label="Region">
                <FilterChips
                  options={regions.map(r => ({ id: r, label: r }))}
                  active={region}
                  onSelect={id => setRegion(prev => (prev === id ? undefined : id))}
                />
              </FilterRow>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant={spotlightOnly ? 'default' : 'outline'}
                  className="rounded-full gap-1.5"
                  aria-pressed={spotlightOnly}
                  onClick={() => setSpotlightOnly(v => !v)}
                >
                  <Compass size={14} aria-hidden /> Hidden Histories only
                </Button>
                {(eraId || themeId || region || spotlightOnly) && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEraId(undefined); setThemeId(undefined); setRegion(undefined); setSpotlightOnly(false); }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            <p className="text-blue-100 text-sm mb-4" role="status">
              {freelyFiltered.length} topic{freelyFiltered.length === 1 ? '' : 's'}
            </p>

            {freelyFiltered.length === 0 ? (
              <p className="text-center text-blue-200 py-12">No topics match those filters yet — try clearing one.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {freelyFiltered.map(topic => (
                  <TopicCard key={topic.id} topic={topic} explored={explored.has(topic.id)} onSelect={handleSelect} />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'grade' && (
          <div>
            {age == null ? (
              <div className="text-center bg-card/80 backdrop-blur rounded-xl border border-border p-8">
                <p className="text-lg mb-4 text-foreground">
                  Add your age on your Profile so we can recommend topics for your level.
                </p>
                <Button onClick={() => setLocation('/profile')}>Go to Profile</Button>
                <p className="text-sm text-muted-foreground mt-4 mb-1">Or just browse everything:</p>
                <Button variant="link" onClick={() => setView('explore')}>Explore Freely instead</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                  <p className="text-blue-100">
                    {outsideDefinedBands ? (
                      <>Our grade bands cover ages 5–18, so here's the full library at your reading level.</>
                    ) : (
                      <>Showing topics for <strong>{gradeBand?.label}</strong> ({gradeBand?.ages} years old)</>
                    )}
                  </p>
                  <Button variant="link" className="text-blue-200" onClick={() => setView('explore')}>
                    Browse with filters →
                  </Button>
                </div>
                {recommended.length === 0 ? (
                  <p className="text-center text-blue-200 py-12">No topics yet for this level — check back soon.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommended.map(topic => (
                      <TopicCard key={topic.id} topic={topic} explored={explored.has(topic.id)} onSelect={handleSelect} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <SensitivityDialog
        topic={pendingTopic}
        onCancel={() => setPendingTopic(null)}
        onConfirm={() => {
          const t = pendingTopic;
          setPendingTopic(null);
          if (t) proceedToStory(t);
        }}
      />
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChips({
  options,
  active,
  onSelect,
}: {
  options: { id: string; label: string }[];
  active?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          aria-pressed={active === opt.id}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors min-h-[32px] ${
            active === opt.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:border-primary hover:text-primary bg-background/50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </>
  );
}
