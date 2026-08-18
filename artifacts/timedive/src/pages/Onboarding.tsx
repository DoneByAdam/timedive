import { useState } from 'react';
import { useUpdateProfile, useUpdatePreferences, getGetMeQueryKey, ProfileUpdateAgeMode } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Submarine } from '@/components/Submarine';
import { useToast } from '@/hooks/use-toast';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [ageMode, setAgeMode] = useState<ProfileUpdateAgeMode | ''>('');
  const [interests, setInterests] = useState<string[]>([]);
  
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleNext = async () => {
    if (step === 1) {
      if (!ageMode) {
        toast({ title: "Please select an age group", variant: "destructive" });
        return;
      }
      setStep(2);
    } else {
      // Complete onboarding
      try {
        await updatePreferences.mutateAsync({
          data: {
            hobbies: interests // mapping interests generically to hobbies for now
          }
        });
        
        await updateProfile.mutateAsync({
          data: {
            ageMode: ageMode as ProfileUpdateAgeMode,
            onboardingComplete: true
          }
        });
        
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation('/timeline');
      } catch (err) {
        toast({ title: "Something went wrong", variant: "destructive" });
      }
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const commonInterests = ["Sports", "Video Games", "Movies", "Reading", "Science", "Art", "Music", "Animals"];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 ocean-timeline opacity-50 pointer-events-none" />
      
      <Card className="w-full max-w-lg z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Submarine />
          </div>
          <CardTitle>Welcome aboard!</CardTitle>
          <CardDescription>
            {step === 1 ? "Let's calibrate your learning experience." : "What topics interest you?"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 1 ? (
            <div className="space-y-4">
              <Label className="text-base mb-2 block">I am a...</Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'kid', label: 'Kid (Exploratory & Fun)' },
                  { id: 'teen', label: 'Teen (Detailed & Engaging)' },
                  { id: 'adult', label: 'Adult (In-depth & Academic)' }
                ].map(mode => (
                  <Button
                    key={mode.id}
                    type="button"
                    variant={ageMode === mode.id ? 'default' : 'outline'}
                    className={`h-auto py-4 justify-start px-6 ${ageMode === mode.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                    onClick={() => setAgeMode(mode.id as ProfileUpdateAgeMode)}
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="text-base mb-2 block">Select a few interests to customize your stories:</Label>
              <div className="flex flex-wrap gap-2">
                {commonInterests.map(interest => (
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
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
          )}
          <Button 
            className={step === 1 ? "w-full" : "ml-auto"} 
            onClick={handleNext}
            disabled={updateProfile.isPending || updatePreferences.isPending}
          >
            {step === 1 ? "Continue" : (updateProfile.isPending ? "Saving..." : "Start Exploring")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
