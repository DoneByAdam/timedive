import { useEffect, useState } from 'react';
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey, getGetMeQueryKey, ProfileUpdateAgeMode } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Submarine } from '@/components/Submarine';
import { AVATAR_OPTIONS } from '@/lib/avatars';

export default function Profile() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [ageMode, setAgeMode] = useState<ProfileUpdateAgeMode | ''>('');
  const [recapEmailOptIn, setRecapEmailOptIn] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setAge(profile.age != null ? String(profile.age) : '');
      setAgeMode(profile.ageMode || '');
      setRecapEmailOptIn(profile.recapEmailOptIn || false);
      setAvatar(profile.avatar ?? null);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = age.trim() ? parseInt(age, 10) : null;
    updateProfile.mutate(
      {
        data: {
          displayName,
          age: ageNum != null && !isNaN(ageNum) ? ageNum : null,
          ageMode: ageMode as ProfileUpdateAgeMode,
          recapEmailOptIn,
          avatar,
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "Profile updated successfully" });
        },
        onError: () => {
          toast({ title: "Failed to update profile", variant: "destructive" });
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
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                disabled
                value={profile?.email || ''}
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            
            <div className="space-y-3">
              <Label>Avatar</Label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`aspect-square rounded-lg text-2xl flex items-center justify-center border-2 transition-colors ${
                      avatar === emoji ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/50 hover:border-primary/50'
                    }`}
                    aria-label={`Choose ${emoji} avatar`}
                    aria-pressed={avatar === emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={4}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 12"
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Used to recommend age-appropriate topics in the Topic Explorer.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Age Mode (Reading Level)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'kid', label: 'Kid' },
                  { id: 'teen', label: 'Teen' },
                  { id: 'adult', label: 'Adult' }
                ].map(mode => (
                  <Button
                    key={mode.id}
                    type="button"
                    variant={ageMode === mode.id ? 'default' : 'outline'}
                    onClick={() => setAgeMode(mode.id as ProfileUpdateAgeMode)}
                    className="w-full"
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="recapEmailOptIn"
                checked={recapEmailOptIn}
                onChange={(e) => setRecapEmailOptIn(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary min-w-[24px] min-h-[24px]"
              />
              <Label htmlFor="recapEmailOptIn" className="text-sm font-normal">
                Receive weekly recap emails of your historical dives
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
