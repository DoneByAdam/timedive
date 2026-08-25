import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { VerifyEmailBanner } from '@/components/VerifyEmailBanner';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Onboarding from '@/pages/Onboarding';
import Timeline from '@/pages/Timeline';
import TopicDetail from '@/pages/TopicDetail';
import StoryReader from '@/pages/StoryReader';
import Profile from '@/pages/Profile';
import Preferences from '@/pages/Preferences';
import Progress from '@/pages/Progress';
import Settings from '@/pages/Settings';
import StoryGenerator from '@/pages/StoryGenerator';
import TopicExplorer from '@/pages/TopicExplorer';
import MyStories from '@/pages/MyStories';
import SharedStory from '@/pages/SharedStory';
import Contact from '@/pages/Contact';
import VerifyEmail from '@/pages/VerifyEmail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Must be in useEffect — calling setLocation during render triggers a React warning
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="loading" className="w-16 h-16 animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading your dive...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <Component />;
}

function Router() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <VerifyEmailBanner />
      <main className="flex-1">
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password" component={ResetPassword} />
            
            <Route path="/onboarding">
              <ProtectedRoute component={Onboarding} />
            </Route>
            <Route path="/timeline">
              <ProtectedRoute component={Timeline} />
            </Route>
            <Route path="/topics/:id">
              <ProtectedRoute component={TopicDetail} />
            </Route>
            <Route path="/story/:topicId">
              <ProtectedRoute component={StoryReader} />
            </Route>
            <Route path="/profile">
              <ProtectedRoute component={Profile} />
            </Route>
            <Route path="/preferences">
              <ProtectedRoute component={Preferences} />
            </Route>
            <Route path="/progress">
              <ProtectedRoute component={Progress} />
            </Route>
            <Route path="/settings">
              <ProtectedRoute component={Settings} />
            </Route>
            <Route path="/story-generator">
              <ProtectedRoute component={StoryGenerator} />
            </Route>
            <Route path="/explore">
              <ProtectedRoute component={TopicExplorer} />
            </Route>
            <Route path="/my-stories">
              <ProtectedRoute component={MyStories} />
            </Route>
            <Route path="/shared/:token" component={SharedStory} />
            <Route path="/contact" component={Contact} />
            <Route path="/verify-email" component={VerifyEmail} />

            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
