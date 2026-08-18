import { useListTopics } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Submarine } from '@/components/Submarine';
import { CheckCircle2, Lock, Sparkles } from 'lucide-react';

export default function Timeline() {
  const { data: topics, isLoading } = useListTopics();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ocean-timeline">
        <div className="text-center">
          <Submarine animated />
          <p className="mt-8 text-primary font-bold animate-pulse text-lg">Diving to coordinates...</p>
        </div>
      </div>
    );
  }

  // Group topics by depth
  const depthGroups = Array.from({ length: 10 }, (_, i) => i + 1).map(depth => ({
    depth,
    topics: topics?.filter(t => t.depthLevel === depth) || []
  }));

  return (
    <div className="min-h-screen relative ocean-timeline">
      {/* Background bubbles */}
      <div className="bubbles-container fixed">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              animationDuration: `${Math.random() * 6 + 4}s`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-300/20 to-transparent pointer-events-none z-0" />
      
      <div className="container mx-auto px-4 py-12 relative z-10 max-w-5xl">
        <div className="text-center mb-10 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
            The Ocean of History
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-6">
            Scroll down to dive deeper into the past. The deeper you go, the older the era.
          </p>
          {/* Story Generator CTA */}
          <Link href="/story-generator">
            <Button size="lg" className="gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-semibold shadow-xl shadow-yellow-900/30 border-0">
              <Sparkles size={18} />
              Generate a Story on Any Topic
            </Button>
          </Link>
        </div>
        
        {/* The Depth Line */}
        <div className="relative border-l-4 border-dashed border-primary/30 ml-4 md:ml-1/2 md:-translate-x-1/2 space-y-32 pb-32">
          
          {depthGroups.map(({ depth, topics }) => {
            if (topics.length === 0) return null;
            
            return (
              <div key={depth} className="relative">
                {/* Depth Marker */}
                <div className="absolute -left-[14px] md:-left-[14px] top-0 w-8 h-8 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.5)] z-20">
                  <span className="text-xs font-bold text-primary">{depth}</span>
                </div>
                
                <div className="ml-10 md:ml-0 md:w-full md:grid md:grid-cols-2 gap-8 -mt-2">
                  <div className="md:col-start-1 md:pr-12 text-right hidden md:block">
                    {/* Empty block for spacing on alternating sides, but let's just lay them out simply */}
                    <div className="text-muted-foreground font-mono text-sm tracking-widest uppercase opacity-50 mt-4">
                      Depth Level {depth}
                    </div>
                  </div>
                  
                  <div className="md:col-start-2 md:col-span-1 md:pl-12 flex flex-col gap-6">
                    <div className="text-muted-foreground font-mono text-sm tracking-widest uppercase opacity-50 mb-2 md:hidden">
                      Depth Level {depth}
                    </div>
                    {topics.map(topic => (
                      <Link key={topic.id} href={`/topics/${topic.id}`}>
                        <Card className="hover:border-primary cursor-pointer transition-all hover:scale-[1.02] hover:-translate-y-1 bg-card/80 backdrop-blur shadow-xl border-primary/20 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1 bg-primary/10 px-2 py-1 rounded inline-block">
                                {topic.category}
                              </div>
                              {topic.isCompleted && (
                                <CheckCircle2 className="text-primary h-5 w-5" />
                              )}
                            </div>
                            <CardTitle className="text-xl">{topic.eraName}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="line-clamp-2 text-blue-100/70">
                              {topic.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Ocean floor */}
        <div className="text-center mt-20 opacity-30">
          <Lock className="mx-auto mb-2" />
          <p className="text-sm uppercase tracking-widest">Abyssal Zone - Uncharted History</p>
        </div>
      </div>
    </div>
  );
}
