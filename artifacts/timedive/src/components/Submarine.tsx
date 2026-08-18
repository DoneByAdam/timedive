export function Submarine({ className = "", animated = true }: { className?: string, animated?: boolean }) {
  return (
    <img
      src="/logo.png"
      alt="TimeDive submarine"
      className={`object-contain drop-shadow-xl ${animated ? 'animate-[bob_3s_ease-in-out_infinite]' : ''} ${className}`}
      style={animated ? { animation: 'bob 3s ease-in-out infinite' } : undefined}
    />
  );
}
