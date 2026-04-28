import { useState, useEffect, useCallback } from 'react';

export default function MemoryTest({ onComplete }) {
  const TOTAL_ROUNDS = 3;
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro, showing, input, feedback
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [results, setResults] = useState([]);
  const [seqLength, setSeqLength] = useState(4);
  const [startTime, setStartTime] = useState(null);

  const generateSequence = useCallback((len) => {
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(Math.floor(Math.random() * 10));
    }
    return seq;
  }, []);

  const startRound = useCallback(() => {
    const seq = generateSequence(seqLength);
    setSequence(seq);
    setUserInput([]);
    setPhase('showing');

    // Show for 3 seconds then hide
    setTimeout(() => {
      setPhase('input');
      setStartTime(Date.now());
    }, 3000);
  }, [seqLength, generateSequence]);

  const handleDigitInput = (digit) => {
    if (phase !== 'input') return;
    const newInput = [...userInput, digit];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      const responseTime = Date.now() - startTime;
      const correct = newInput.every((d, i) => d === sequence[i]);
      const correctCount = newInput.filter((d, i) => d === sequence[i]).length;

      const roundResult = {
        sequence: [...sequence],
        userInput: [...newInput],
        correct,
        correctCount,
        totalDigits: sequence.length,
        accuracy: (correctCount / sequence.length) * 100,
        responseTimeMs: responseTime,
      };

      const newResults = [...results, roundResult];
      setResults(newResults);
      setPhase('feedback');

      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        // All rounds done
        setTimeout(() => {
          const totalCorrect = newResults.reduce((s, r) => s + r.correctCount, 0);
          const totalDigits = newResults.reduce((s, r) => s + r.totalDigits, 0);
          const avgAccuracy = newResults.reduce((s, r) => s + r.accuracy, 0) / newResults.length;
          const avgResponseTime = newResults.reduce((s, r) => s + r.responseTimeMs, 0) / newResults.length;

          onComplete({
            rounds: newResults,
            totalCorrect,
            totalDigits,
            memoryAccuracy: Math.round(avgAccuracy * 10) / 10,
            avgResponseTimeMs: Math.round(avgResponseTime),
            perfectRounds: newResults.filter(r => r.correct).length,
          });
        }, 1500);
      }
    }
  };

  const handleNextRound = () => {
    setRound(round + 1);
    // Optionally increase difficulty
    if (results[results.length - 1]?.correct) {
      setSeqLength(Math.min(seqLength + 1, 8));
    }
    startRound();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Memory Test</h2>
        <span className="text-white/40 text-sm">{Math.min(round + 1, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}</span>
      </div>

      <div className="progress-bar mb-6">
        <div className="progress-bar-fill" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}></div>
      </div>

      {/* Test Area */}
      <div className="glass-card p-6 md:p-8 min-h-[340px] flex flex-col items-center justify-center">
        {phase === 'intro' && (
          <div className="text-center animate-fade-in">
            <p className="text-white/80 text-lg font-medium mb-2">Remember the sequence</p>
            <p className="text-white/50 text-sm mb-6">
              A sequence of digits will appear. Memorize them, then enter the sequence in order.
            </p>
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

        {phase === 'showing' && (
          <div className="text-center animate-scale-in">
            <p className="text-white/50 text-sm mb-4">Remember this sequence:</p>
            <div className="flex gap-3 justify-center mb-4">
              {sequence.map((digit, i) => (
                <div
                  key={i}
                  className="w-14 h-16 md:w-16 md:h-20 bg-brand-500/20 border border-brand-500/40 rounded-xl flex items-center justify-center animate-fade-in-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <span className="text-2xl md:text-3xl font-bold text-brand-300">{digit}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <div className="w-3 h-3 border-2 border-white/30 border-t-brand-400 rounded-full animate-spin"></div>
              Memorize...
            </div>
          </div>
        )}

        {phase === 'input' && (
          <div className="text-center w-full animate-fade-in">
            <p className="text-white/60 text-sm mb-4">Now, enter the sequence</p>

            {/* Input display */}
            <div className="flex gap-2 justify-center mb-6">
              {sequence.map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 md:w-14 md:h-16 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                    userInput[i] !== undefined
                      ? 'bg-brand-500/30 border border-brand-500/50 text-white'
                      : 'bg-white/5 border border-white/10 text-white/20'
                  }`}
                >
                  {userInput[i] !== undefined ? userInput[i] : ''}
                </div>
              ))}
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDigitInput(num)}
                  disabled={userInput.length >= sequence.length}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-all duration-150 active:scale-90 disabled:opacity-30"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="text-center animate-scale-in">
            {results[results.length - 1]?.correct ? (
              <>
                <div className="text-5xl mb-3">✅</div>
                <p className="text-emerald-400 text-xl font-bold mb-1">Perfect!</p>
                <p className="text-white/50 text-sm mb-6">You remembered all {sequence.length} digits correctly.</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">❌</div>
                <p className="text-amber-400 text-xl font-bold mb-1">Not quite</p>
                <p className="text-white/50 text-sm mb-2">
                  You got {results[results.length - 1]?.correctCount} of {sequence.length} correct.
                </p>
                <p className="text-white/30 text-xs mb-6">
                  Correct: {sequence.join(' ')} · Yours: {userInput.join(' ')}
                </p>
              </>
            )}
            {round + 1 < TOTAL_ROUNDS ? (
              <button 
                onClick={handleNextRound} 
                className="mt-6 relative overflow-hidden px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-[0_8px_25px_rgba(6,182,212,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(6,182,212,0.6)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Next Round <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Preparing results...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
