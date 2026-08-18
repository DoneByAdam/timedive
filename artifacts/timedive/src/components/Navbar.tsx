import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLogout, getGetMeQueryKey } from '@workspace/api-client-react';
import { Button } from './ui/button';
import { Compass, Settings, LogOut, User } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccessibility } from '@/hooks/use-accessibility';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user } = useAuth();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { highContrast, setHighContrast, textSize, setTextSize } = useAccessibility();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation('/');
      }
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user ? "/timeline" : "/"} className="flex items-center gap-3 group">
          <img src="/logo.jpeg" alt="TimeDive" className="h-10 w-10 rounded-xl object-cover group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-bold tracking-tight text-primary font-brand">TimeDive</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Accessibility options" data-testid="button-accessibility">
                <span className="font-bold text-lg">Aa</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setHighContrast(!highContrast)}>
                {highContrast ? "Disable" : "Enable"} High Contrast
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Text Size</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTextSize('base')}>Regular</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTextSize('medium')}>Large</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTextSize('large')}>Extra Large</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              <Link href="/timeline" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <Compass size={18} /> Timeline
              </Link>
              <Link href="/progress" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <User size={18} /> Progress
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {user.displayName} <Settings size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/preferences">Preferences</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut size={16} className="mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
