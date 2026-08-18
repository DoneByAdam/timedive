import { useEffect, useState } from 'react';
import { useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Submarine } from '@/components/Submarine';

const COMMON_INTERESTS = [
  "Sports", "Video Games", "Movies", "Reading", 
  "Science", "Art", "Music", "Animals", 
  "Technology", "Nature", "Space", "Cooking"
];

export default function Preferences() {
  const { data: prefs, isLoading } = useGetPreferences();
  const updatePrefs = useUpdatePreferences();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (prefs) {
      // API schema separates hobbies, sports, etc. We'll flatten them into 'hobbies' for simplicity in UI, 
      // or just edit 'hobbies' array to hold all interests.
      setInterests(prefs.hobbies || []);
    }
  }, [prefs]);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrefs.mutate(
      { 
        data: { 
          hobbies: interests
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
          toast({ title: "Preferences saved", description: "Your future stories will reflect these interests." });
        },
        onError: () => {
          toast({ title: "Failed to update preferences", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Submarine animated /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Personalize Your Stories</CardTitle>
          <CardDescription>
            Select topics you love. The AI will weave these into your historical adventures to make them more engaging.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <Label className="text-base mb-2 block">Interests</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_INTERESTS.map(interest => (
                  <Button
                    key={interest}
                    type="button"
                    variant={interests.includes(interest) ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={updatePrefs.isPending}>
              {updatePrefs.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
