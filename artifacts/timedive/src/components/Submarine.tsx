export function Submarine({ className = "", animated = true }: { className?: string, animated?: boolean }) {
  return (
    <div className={`relative w-20 h-16 ${animated ? 'animate-bounce' : ''} ${className}`} style={{ animationDuration: '3s' }}>
      {/* Periscope */}
      <div className="absolute top-0 left-8 w-2 h-4 bg-yellow-500 border-2 border-yellow-700"></div>
      <div className="absolute top-0 left-8 w-5 h-2 bg-yellow-500 border-2 border-yellow-700 rounded-r-md"></div>
      
      {/* Top cabin */}
      <div className="absolute top-4 left-6 w-8 h-4 bg-yellow-400 border-2 border-b-0 border-yellow-600 rounded-t-lg"></div>
      
      {/* Main Body */}
      <div className="absolute bottom-1 w-20 h-10 bg-yellow-400 rounded-full border-2 border-yellow-600 shadow-[inset_0_-4px_0_rgba(202,138,4,0.5)]"></div>
      
      {/* Porthole */}
      <div className="absolute bottom-3 left-8 w-5 h-5 bg-cyan-200 rounded-full border-2 border-yellow-700 shadow-[inset_0_2px_4px_rgba(0,100,200,0.5)]"></div>
      <div className="absolute bottom-[14px] left-[34px] w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
      
      {/* Propeller */}
      <div className={`absolute bottom-4 -right-1 w-2 h-5 bg-slate-400 rounded-full ${animated ? 'animate-spin' : ''}`} style={{ animationDuration: '0.2s' }}></div>
      <div className="absolute bottom-5 -right-2 w-3 h-2 bg-yellow-600 rounded-sm"></div>
    </div>
  );
}
