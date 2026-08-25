import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useGetDashboardSummary } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowRight, Trophy, BookOpen, Anchor, Compass, Map } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <img src="/logo.png" alt="TimeDive" className="h-16 w-16 rounded-xl object-cover animate-pulse" />
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden ocean-timeline flex flex-col items-center justify-center text-center px-4">
      {/* Background bubbles */}
      <div className="bubbles-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              animationDuration: `${Math.random() * 5 + 5}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      <div className="light-rays" />
      
      <div className="z-10 max-w-3xl mx-auto flex flex-col items-center">
        <div className="mx-auto mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40 bg-blue-400 scale-110" />
            <img src="/logo.png" alt="TimeDive" className="relative h-28 w-28 rounded-3xl object-cover shadow-2xl" />
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
          Dive Into History
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl font-light leading-relaxed">
          Explore the depths of time through personalized AI stories. Uncover ancient civilizations, middle age revolutions, and recent history like never before.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
            <Link href="/register">Start Exploring</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-blue-300 text-blue-100 hover:bg-blue-900/50" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <img src="/logo.png" alt="TimeDive" className="h-16 w-16 rounded-xl object-cover animate-pulse" />
      </div>
    );
  }

  if (!summary) return null;

  const progressPercent = Math.round((summary.completedTopics / summary.totalTopics) * 100) || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.displayName}!</h1>
          <p className="text-muted-foreground mt-2">Ready for your next historical dive?</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button asChild size="lg">
            <Link href="/timeline"><Anchor className="mr-2 h-5 w-5" /> Open Timeline</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/explore"><Map className="mr-2 h-5 w-5" /> Topic Explorer</Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>{summary.completedTopics} of {summary.totalTopics} eras explored</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="mb-2" />
            <div className="flex justify-between text-sm font-medium">
              <span>0%</span>
              <span className="text-primary">{progressPercent}%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-yellow-400" /> Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center py-4">{summary.badgeCount || 0}</div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/progress">View all</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {summary.suggestedNext && summary.suggestedNext.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Compass className="text-primary" /> Suggested Dives
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {summary.suggestedNext.map(topic => (
              <Card key={topic.id} className="hover:border-primary/50 transition-colors flex flex-col">
                <CardHeader className="pb-2">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{topic.category}</div>
                  <CardTitle className="text-lg">{topic.eraName}</CardTitle>
                  <CardDescription className="line-clamp-2">{topic.description}</CardDescription>
                </CardHeader>
                <div className="flex-grow" />
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/topics/${topic.id}`}>
                      Dive In <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {summary.recentTopics && summary.recentTopics.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-primary" /> Recent Discoveries
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {summary.recentTopics.map(recent => (
              <Card key={recent.topicId} className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">{recent.eraName}</CardTitle>
                  <CardDescription>
                    Completed {new Date(recent.completedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/story/${recent.topicId}`}>Read Story Again</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

