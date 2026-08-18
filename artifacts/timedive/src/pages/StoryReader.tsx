import { useState, useEffect } from 'react';
import { useGetStory, useGenerateStory, useCompleteTopic, getGetProgressQueryKey, getGetDashboardSummaryQueryKey, getGetStoryQueryKey } from '@workspace/api-client-react';
import { stripMarkdown } from '@/lib/strip-markdown';
import { useRoute, Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Submarine } from '@/components/Submarine';
import { ReadAloud } from '@/components/ReadAloud';
import { ArrowLeft, Sparkles, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StoryReader() {
  const [, params] = useRoute('/story/:topicId');
  const topicId = params?.topicId ? parseInt(params.topicId, 10) : 0;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const { data: story, isLoading, error, refetch } = useGetStory(topicId, { 
    query: { enabled: !!topicId, retry: false, queryKey: getGetStoryQueryKey(topicId) } 
  });
  
  const generateStory = useGenerateStory();
  const completeTopic = useCompleteTopic();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Auto-generate if no story exists (404 error from getStory usually means doesn't exist)
  useEffect(() => {
    if (error && !isGenerating && !story) {
      handleGenerate(false);
    }
  }, [error]);

  const handleGenerate = (forceRegenerate: boolean) => {
    setIsGenerating(true);
    generateStory.mutate(
      { topicId, data: { forceRegenerate } },
      {
        onSuccess: () => {
          refetch();
          setIsGenerating(false);
          toast({ title: forceRegenerate ? "New story generated!" : "Story ready!" });
        },
        onError: () => {
          setIsGenerating(false);
          toast({ title: "Failed to generate story", variant: "destructive" });
        }
      }
    );
  };

  const handleComplete = () => {
    completeTopic.mutate(
      { data: { topicId } },
      {
        onSuccess: (res) => {
          setCompleted(true);
          queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          
          if (res.newBadges && res.newBadges.length > 0) {
            toast({ 
              title: "New Badge Earned!", 
              description: `You earned: ${res.newBadges[0].name} ${res.newBadges[0].icon}`,
              duration: 5000
            });
          } else {
            toast({ title: "Topic marked as complete!" });
          }
          
          setTimeout(() => setLocation('/timeline'), 2000);
        },
        onError: () => {
          toast({ title: "Error completing topic", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center ocean-timeline">
        <Submarine className="w-32 h-24 mb-8" animated />
        <h2 className="text-2xl font-bold text-white mb-2">Weaving your historical tale...</h2>
        <p className="text-blue-200">The AI is personalizing the story to your interests.</p>
      </div>
    );
  }

  if (!story) return null;

  // Strip markdown so asterisks and other formatting symbols don't appear in text or get read aloud
  const cleanStory = stripMarkdown(story.storyText);
  const cleanFacts = stripMarkdown(story.funFacts);
  const contentToRead = `${cleanStory}\n\n${cleanFacts}`;

  // Parse fun facts into a bullet list
  const factLines = cleanFacts
    .split('\n')
    .filter(l => l.trim().startsWith('•'))
    .map(l => l.replace(/^•\s*/, '').trim());

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-8 sticky top-20 z-40 bg-background/95 backdrop-blur py-4 -mt-4 border-b border-border">
          <Button variant="ghost" asChild>
            <Link href={`/topics/${topicId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
          <ReadAloud text={contentToRead} />
        </div>

        <article className="prose prose-invert prose-lg md:prose-xl max-w-none mb-12 prose-p:leading-relaxed prose-headings:text-primary">
          <div className="whitespace-pre-wrap text-foreground/90 font-serif">
            {cleanStory}
          </div>
        </article>

        <Card className="mb-12 bg-accent/10 border-accent/20">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-accent mb-4 flex items-center gap-2">
              <Sparkles /> Fun Facts 🎉
            </h3>
            {factLines.length > 0 ? (
              <ul className="space-y-2">
                {factLines.map((f, i) => (
                  <li key={i} className="flex gap-2 text-lg leading-relaxed">
                    <span className="text-accent font-bold shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg leading-relaxed">{cleanFacts}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-12 border-t border-border pt-8">
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => handleGenerate(true)}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Generate New Version
          </Button>
          
          <Button 
            size="lg" 
            onClick={handleComplete} 
            disabled={completed}
            className={`w-full sm:w-auto min-w-[200px] ${completed ? 'bg-green-600 text-white' : ''}`}
          >
            {completed ? (
              <><Check className="mr-2 h-5 w-5" /> Completed</>
            ) : (
              "Mark as Complete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
