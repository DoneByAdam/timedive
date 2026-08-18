import { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from './ui/button';

export function ReadAloud({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  }, []);

  if (!supported) return null;

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const cycleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : speed === 2 ? 0.5 : 1;
    setSpeed(nextSpeed);
    if (isPlaying) {
      stop();
    }
  };

  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur p-2 rounded-xl border border-border shadow-lg inline-flex" data-testid="read-aloud-controls">
      <Button 
        variant="default" 
        size="icon" 
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause narration" : "Play narration"}
        data-testid={`button-${isPlaying ? 'pause' : 'play'}`}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        onClick={stop}
        aria-label="Stop narration"
        data-testid="button-stop"
      >
        <Square size={20} />
      </Button>
      
      <Button 
        variant="secondary"
        onClick={cycleSpeed}
        className="font-mono w-14"
        aria-label={`Change speed, currently ${speed}x`}
        data-testid="button-speed"
      >
        {speed}x
      </Button>
    </div>
  );
}
