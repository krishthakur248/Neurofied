import { useState, useEffect, useCallback } from 'react';

export default function ReactionTimeTest({ onComplete }) {
  const TOTAL_ROUNDS = 5;
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('waiting'); // waiting, ready, go, tooSoon, result
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [currentRT, setCurrentRT] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (phase === 'ready') {
      const delay = 2000 + Math.random() * 3000; // 2-5 seconds
      const id = setTimeout(() => {
        setPhase('go');
        setStartTime(Date.now());
      }, delay);
      setTimeoutId(id);
      return () => clearTimeout(id);
    }
  }, [phase]);

  const startRound = useCallback(() => {
    setPhase('ready');
    setCurrentRT(null);
  }, []);

  const handleTap = () => {
    if (phase === 'ready') {
      // Tapped too soon
      if (timeoutId) clearTimeout(timeoutId);
      setPhase('tooSoon');
    } else if (phase === 'go') {
      const rt = Date.now() - startTime;
      setCurrentRT(rt);
      const newTimes = [...reactionTimes, rt];
      setReactionTimes(newTimes);
      setRound(round + 1);

      if (round + 1 >= TOTAL_ROUNDS) {
        // All rounds done
        setTimeout(() => {
          const mean = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
          const variance = newTimes.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / newTimes.length;
          const stdDev = Math.sqrt(variance);
          const cv = (stdDev / mean) * 100;

          onComplete({
            reactionTimes: newTimes,
            meanRT: Math.round(mean),
            varianceRT: Math.round(variance),
            stdDevRT: Math.round(stdDev),
            cvRT: Math.round(cv * 10) / 10,
            minRT: Math.min(...newTimes),
            maxRT: Math.max(...newTimes),
          });
        }, 1200);
      }
      setPhase('result');
    }
  };

  const getPhaseStyles = () => {
    switch (phase) {
      case 'waiting': return 'bg-dark-100';
      case 'ready': return 'bg-gradient-to-br from-red-600 to-rose-700 cursor-pointer';
      case 'go': return 'bg-gradient-to-br from-emerald-500 to-green-600 cursor-pointer';
      case 'tooSoon': return 'bg-gradient-to-br from-amber-600 to-orange-700';
      case 'result': return 'bg-dark-100';
      default: return 'bg-dark-100';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Reaction Time</h2>
        <span className="text-white/40 text-sm">{Math.min(round + 1, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}</span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-6">
        <div className="progress-bar-fill" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}></div>
      </div>

      {/* Test Area */}
      <div
        onClick={phase === 'ready' || phase === 'go' ? handleTap : undefined}
        className={`relative w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center transition-all duration-300 select-none ${getPhaseStyles()}`}
      >
        {phase === 'waiting' && (
          <div className="text-center px-6 animate-fade-in">
            <p className="text-white/80 text-lg font-medium mb-2">Test your reflexes.</p>
            <p className="text-white/50 text-sm mb-6">Wait for the screen to turn <span className="text-emerald-400 font-semibold">GREEN</span>, then tap as fast as you can.</p>
            <button 
              onClick={startRound} 
              className="mt-4 relative overflow-hidden px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-[0_8px_25px_rgba(6,182,212,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(6,182,212,0.6)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Round {round + 1}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </span>
            </button>
          </div>
        )}

        {phase === 'ready' && (
          <div className="text-center animate-fade-in">
            <p className="text-white text-2xl font-bold mb-2">Wait...</p>
            <p className="text-white/70 text-sm">Tap when the color changes to green</p>
          </div>
        )}

        {phase === 'go' && (
          <div className="text-center animate-scale-in">
            <p className="text-white text-3xl font-bold mb-2">TAP NOW!</p>
            <p className="text-white/80 text-sm">Tap as fast as you can!</p>
          </div>
        )}

        {phase === 'tooSoon' && (
          <div className="text-center animate-fade-in px-6">
            <p className="text-white text-2xl font-bold mb-2">Too Soon! ⚡</p>
            <p className="text-white/70 text-sm mb-6">Wait for the screen to turn green before tapping.</p>
            <button 
              onClick={startRound} 
              className="mt-4 relative overflow-hidden px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-2xl shadow-[0_8px_25px_rgba(245,158,11,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(245,158,11,0.6)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Try Again
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
              </span>
            </button>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center animate-scale-in">
            <p className="text-brand-400 text-5xl font-bold mb-2">{currentRT} ms</p>
            <p className="text-white/50 text-sm mb-6">
              {currentRT < 200 ? 'Excellent!' : currentRT < 300 ? 'Good!' : currentRT < 400 ? 'Average' : 'Keep practicing!'}
            </p>
            {round < TOTAL_ROUNDS && (
              <button 
                onClick={startRound} 
                className="mt-6 relative overflow-hidden px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-[0_8px_25px_rgba(6,182,212,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(6,182,212,0.6)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Next Round <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </span>
              </button>
            )}
            {round >= TOTAL_ROUNDS && (
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Preparing results...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reaction time display */}
      {phase !== 'waiting' && (
        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            {reactionTimes.length > 0 && `Best: ${Math.min(...reactionTimes)}ms · Avg: ${Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length)}ms`}
          </p>
        </div>
      )}
    </div>
  );
}
