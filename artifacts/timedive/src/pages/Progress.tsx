import { useGetProgress, useGetBadges } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Submarine } from '@/components/Submarine';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, BookOpen, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function ProgressPage() {
  const { data: progress, isLoading: progressLoading } = useGetProgress();
  const { data: badges, isLoading: badgesLoading } = useGetBadges();

  if (progressLoading || badgesLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Submarine animated />
      </div>
    );
  }

  if (!progress) return null;

  const percent = Math.round((progress.completedTopics / progress.totalTopics) * 100) || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-primary flex items-center gap-3">
        <Trophy className="h-8 w-8" /> Your Explorer Log
      </h1>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card className="md:col-span-2 bg-card/60 border-primary/20 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-2xl">Overall Progress</CardTitle>
            <CardDescription className="text-lg">
              {progress.completedTopics} of {progress.totalTopics} eras explored
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percent} className="h-4 mb-3" />
            <div className="flex justify-end font-mono text-primary font-bold text-xl">
              {percent}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="flex flex-col items-center justify-center p-6 h-full text-center">
            <Medal className="h-16 w-16 text-accent mb-4" />
            <div className="text-4xl font-bold mb-1">{badges?.length || 0}</div>
            <div className="text-muted-foreground">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-2">
            <BookOpen className="text-primary" /> Category Mastery
          </h2>
          <div className="space-y-6">
            {progress.completedByCategory.map(cat => {
              const catPercent = Math.round((cat.completed / cat.total) * 100) || 0;
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold">{cat.category}</span>
                    <span className="text-muted-foreground">{cat.completed} / {cat.total}</span>
                  </div>
                  <Progress value={catPercent} className="h-2 bg-secondary/50" />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-2">
            <Trophy className="text-primary" /> Your Badges
          </h2>
          {(!badges || badges.length === 0) ? (
            <div className="text-center p-8 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground mb-4">You haven't earned any badges yet.</p>
              <Button asChild variant="outline">
                <Link href="/timeline">Start exploring to earn</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center shadow-md hover:border-primary/50 transition-colors">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="font-bold text-sm leading-tight mb-1">{badge.name}</div>
                  <div className="text-xs text-muted-foreground">{badge.category}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {progress.recentCompletions && progress.recentCompletions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-2">
            <Clock className="text-primary" /> Recent Expeditions
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {progress.recentCompletions.map(recent => (
              <Link key={recent.topicId} href={`/story/${recent.topicId}`}>
                <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{recent.eraName}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(recent.completedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
