import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

// Pick the best available voice: prefer neural/enhanced/premium voices
function pickBestVoice(voices: SpeechSynthesisVoice[], lang = 'en'): SpeechSynthesisVoice | null {
  const langVoices = voices.filter(v => v.lang.startsWith(lang));
  if (langVoices.length === 0) return voices[0] ?? null;

  // Quality tiers — higher index = lower preference
  const PREFERRED = [
    /neural/i, /premium/i, /enhanced/i, /natural/i,
    /google/i, /microsoft/i, /siri/i, /samantha/i,
  ];

  for (const pattern of PREFERRED) {
    const match = langVoices.find(v => pattern.test(v.name) || pattern.test(v.voiceURI));
    if (match) return match;
  }

  return langVoices[0] ?? null;
}

export function ReadAloud({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showVoices, setShowVoices] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!window.speechSynthesis) { setSupported(false); return; }

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
        setSelectedVoice(prev => prev ?? pickBestVoice(v));
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  if (!supported) return null;

  const speak = (rate = speed, voice = selectedVoice) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    if (voice) utterance.voice = voice;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        speak();
      }
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const cycleSpeed = () => {
    const next = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : speed === 1.5 ? 0.75 : 1;
    setSpeed(next);
    if (isPlaying) speak(next);
  };

  const handleVoiceSelect = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    setShowVoices(false);
    if (isPlaying) speak(speed, voice);
  };

  // Show only English voices + deduplicate by name
  const displayVoices = voices
    .filter(v => v.lang.startsWith('en'))
    .filter((v, i, arr) => arr.findIndex(x => x.name === v.name) === i)
    .slice(0, 12);

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur p-2 rounded-xl border border-border shadow-lg">
        <Button
          variant="default"
          size="icon"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </Button>

        <Button variant="secondary" size="icon" onClick={stop} aria-label="Stop narration">
          <Square size={18} />
        </Button>

        <Button
          variant="secondary"
          onClick={cycleSpeed}
          className="font-mono w-14 text-xs"
          aria-label={`Speed: ${speed}x`}
        >
          {speed}x
        </Button>

        {displayVoices.length > 1 && (
          <Button
            variant="secondary"
            onClick={() => setShowVoices(v => !v)}
            className="flex items-center gap-1 text-xs max-w-[140px] truncate"
            title={selectedVoice?.name ?? 'Select voice'}
          >
            <span className="truncate max-w-[100px]">{selectedVoice?.name?.split(' ')[0] ?? 'Voice'}</span>
            <ChevronDown size={12} />
          </Button>
        )}
      </div>

      {showVoices && displayVoices.length > 1 && (
        <div className="absolute top-12 left-0 z-50 bg-card border border-border rounded-xl shadow-2xl p-2 w-64 max-h-60 overflow-y-auto">
          <p className="text-xs text-muted-foreground px-2 pb-1 font-medium">Choose a voice</p>
          {displayVoices.map(voice => (
            <button
              key={voice.name}
              onClick={() => handleVoiceSelect(voice)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors flex justify-between items-center gap-2 ${
                selectedVoice?.name === voice.name ? 'bg-primary/10 text-primary font-medium' : ''
              }`}
            >
              <span className="truncate">{voice.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{voice.lang}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
