import { useEffect, useState } from 'react';
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey, getGetMeQueryKey, ProfileUpdateAgeMode } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Submarine } from '@/components/Submarine';

export default function Profile() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [ageMode, setAgeMode] = useState<ProfileUpdateAgeMode | ''>('');
  const [recapEmailOptIn, setRecapEmailOptIn] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setAgeMode(profile.ageMode || '');
      setRecapEmailOptIn(profile.recapEmailOptIn || false);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { 
        data: { 
          displayName, 
          ageMode: ageMode as ProfileUpdateAgeMode,
          recapEmailOptIn 
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
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
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
