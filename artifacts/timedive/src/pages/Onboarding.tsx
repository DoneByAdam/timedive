import { useState } from 'react';
import { useUpdateProfile, useUpdatePreferences, getGetMeQueryKey } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Submarine } from '@/components/Submarine';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

const HOBBY_CHIPS = [
  "Sports", "Gaming", "Music", "Science", "Art", "Reading",
  "Cooking", "Travel", "Technology", "Animals", "Movies", "Photography",
];

const TOPIC_SUGGESTIONS = [
  "Ancient Egypt", "The Roman Empire", "The Islamic Golden Age",
  "The Vikings", "The Renaissance", "World War II",
  "The Space Race", "Ancient China", "The Ottoman Empire",
  "The American Revolution", "Ibn Battuta", "Al-Andalus",
];

function ageModeFromAge(age: number): "kid" | "teen" | "adult" {
  if (age <= 12) return "kid";
  if (age <= 17) return "teen";
  return "adult";
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  // Step 1 — Age
  const [age, setAge] = useState('');

  // Step 2 — Hobbies / Interests
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState('');

  // Step 3 — Historical topic
  const [historicalTopic, setHistoricalTopic] = useState('');

  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const toggleHobby = (h: string) => {
    setSelectedHobbies(prev =>
      prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]
    );
  };

  const addCustomHobby = () => {
    const trimmed = customHobby.trim();
    if (!trimmed || selectedHobbies.includes(trimmed)) { setCustomHobby(''); return; }
    setSelectedHobbies(prev => [...prev, trimmed]);
    setCustomHobby('');
  };

  const removeHobby = (h: string) => setSelectedHobbies(prev => prev.filter(x => x !== h));

  const handleNext = async () => {
    if (step === 1) {
      const n = parseInt(age, 10);
      if (!age || isNaN(n) || n < 4 || n > 120) {
        toast({ title: "Please enter a valid age (4–120)", variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Final step — save everything
      const ageNum = parseInt(age, 10);
      const ageMode = ageModeFromAge(ageNum);
      const allHobbies = [...selectedHobbies];
      if (historicalTopic.trim()) allHobbies.push(`History interest: ${historicalTopic.trim()}`);

      try {
        await updatePreferences.mutateAsync({ data: { hobbies: allHobbies } });
        await updateProfile.mutateAsync({
          data: { ageMode, age: ageNum, onboardingComplete: true }
        });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });

        if (historicalTopic.trim()) {
          // Go straight to story generator with their chosen topic
          const encoded = encodeURIComponent(historicalTopic.trim());
          setLocation(`/story-generator?topic=${encoded}`);
        } else {
          setLocation('/timeline');
        }
      } catch {
        toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      }
    }
  };

  const handleBack = () => setStep(s => s - 1);

  const isPending = updateProfile.isPending || updatePreferences.isPending;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 ocean-timeline opacity-50 pointer-events-none" />

      <Card className="w-full max-w-lg z-10 shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-t-lg overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <CardHeader className="text-center pt-6">
          <div className="flex justify-center mb-3">
            <Submarine className="w-20 h-20" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Step {step} of {TOTAL_STEPS}</p>
          <CardTitle className="text-2xl">
            {step === 1 && "How old are you?"}
            {step === 2 && "What are your interests?"}
            {step === 3 && "What part of history excites you?"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "We'll tailor stories to your level — simple and fun, or deep and detailed."}
            {step === 2 && "Pick hobbies you love. We'll weave them into your history stories!"}
            {step === 3 && "Type any topic, era, or historical figure. We'll generate a story just for you."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* STEP 1 — Age */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <Input
                  type="number"
                  min={4}
                  max={120}
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  placeholder="Enter your age"
                  className="text-center text-3xl h-16 w-40 font-bold"
                  autoFocus
                />
                {age && !isNaN(parseInt(age, 10)) && parseInt(age, 10) >= 4 && (
                  <p className="text-sm text-muted-foreground">
                    {ageModeFromAge(parseInt(age, 10)) === 'kid' && "🐠 You'll get fun, adventurous stories!"}
                    {ageModeFromAge(parseInt(age, 10)) === 'teen' && "🌊 You'll get engaging, detailed stories!"}
                    {ageModeFromAge(parseInt(age, 10)) === 'adult' && "🔬 You'll get rich, in-depth narratives!"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Hobbies */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {HOBBY_CHIPS.map(h => (
                  <Button
                    key={h}
                    type="button"
                    size="sm"
                    variant={selectedHobbies.includes(h) ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => toggleHobby(h)}
                  >
                    {h}
                  </Button>
                ))}
              </div>

              {/* Custom hobby input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a custom hobby..."
                  value={customHobby}
                  onChange={e => setCustomHobby(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomHobby())}
                  className="flex-1"
                />
                <Button type="button" size="icon" variant="secondary" onClick={addCustomHobby}>
                  <Plus size={16} />
                </Button>
              </div>

              {/* Selected hobbies as removable tags */}
              {selectedHobbies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedHobbies.map(h => (
                    <span
                      key={h}
                      className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full"
                    >
                      {h}
                      <button onClick={() => removeHobby(h)} className="hover:text-destructive">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {selectedHobbies.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">Select at least one interest, or skip to continue.</p>
              )}
            </div>
          )}

          {/* STEP 3 — Historical Topic */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="e.g. Ancient Egypt, Ibn Sina, World War II..."
                  value={historicalTopic}
                  onChange={e => setHistoricalTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  className="text-base"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Or pick a suggestion:</Label>
                <div className="flex flex-wrap gap-1.5">
                  {TOPIC_SUGGESTIONS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setHistoricalTopic(t)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        historicalTopic === t
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:border-primary hover:text-primary'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {historicalTopic.trim()
                  ? `✨ We'll generate a personalized "${historicalTopic}" story for you right after setup!`
                  : "Skip this to browse all topics from the timeline."}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack} disabled={isPending}>
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleNext}
            disabled={isPending}
          >
            {isPending
              ? "Saving..."
              : step === TOTAL_STEPS
              ? historicalTopic.trim()
                ? "Generate My Story! 🚀"
                : "Start Exploring"
              : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
