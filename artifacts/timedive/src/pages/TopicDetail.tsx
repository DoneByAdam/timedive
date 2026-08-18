import { useGetTopic, getGetTopicQueryKey } from '@workspace/api-client-react';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Submarine } from '@/components/Submarine';
import { ReadAloud } from '@/components/ReadAloud';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';

export default function TopicDetail() {
  const [, params] = useRoute('/topics/:id');
  const topicId = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: topic, isLoading } = useGetTopic(topicId, { 
    query: { enabled: !!topicId, queryKey: getGetTopicQueryKey(topicId) } 
  });

  if (isLoading || !topic) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Submarine animated />
      </div>
    );
  }

  const contentToRead = `${topic.eraName}. ${topic.description}. Core facts: ${topic.coreFacts.join('. ')}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6 -ml-4">
        <Link href="/timeline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Timeline</Link>
      </Button>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                  Depth Level {topic.depthLevel}
                </span>
                <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent/10 px-3 py-1 rounded-full">
                  {topic.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{topic.eraName}</h1>
            </div>
            <div className="hidden sm:block">
              <ReadAloud text={contentToRead} />
            </div>
          </div>
          
          <div className="sm:hidden mb-4">
            <ReadAloud text={contentToRead} />
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {topic.description}
          </p>

          <Card className="bg-muted/30 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="text-primary" /> Core Facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {topic.coreFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-80 shrink-0 sticky top-24">
          <Card className="border-primary/50 shadow-[0_0_30px_rgba(0,255,255,0.1)] bg-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-2xl">Your Dive</CardTitle>
              <CardDescription>Ready to explore this era?</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Submarine className="w-24 h-20" animated={!topic.hasStory} />
            </CardContent>
            <div className="p-6 pt-0">
              <Button size="lg" className="w-full h-14 text-lg gap-2" asChild>
                <Link href={`/story/${topic.id}`}>
                  {topic.hasStory ? (
                    <>Read Your Story <BookOpen size={20} /></>
                  ) : (
                    <>Generate My Story <Sparkles size={20} /></>
                  )}
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
