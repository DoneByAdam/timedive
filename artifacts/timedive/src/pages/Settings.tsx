import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings as SettingsIcon, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="text-primary" /> Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-bold">{user?.displayName}</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <p className="text-xs uppercase mt-1 bg-muted inline-block px-2 rounded-sm font-bold tracking-widest">{user?.ageMode} Mode</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="text-primary" /> Story Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-muted-foreground text-sm max-w-sm">
              Manage the interests and hobbies used to personalize your historical stories.
            </p>
            <Button asChild variant="outline">
              <Link href="/preferences">Edit Preferences</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="text-muted-foreground" /> System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              TimeDive version 1.0.0<br/>
              Connected to API
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
