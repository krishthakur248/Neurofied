import { useState, useEffect, useCallback, useRef } from 'react';

const SYMBOLS = ['🎯', '⭐', '🔶', '🟢', '🔺', '❌'];
const TARGET_SYMBOL = '🎯';
const TOTAL_TRIALS = 15;
const SHOW_DURATION = 1500; // ms to show each stimulus

export default function AttentionTest({ onComplete }) {
  const [phase, setPhase] = useState('intro'); // intro, active, between, done
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentSymbol, setCurrentSymbol] = useState(null);
  const [trials, setTrials] = useState([]);
  const [responded, setResponded] = useState(false);
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'commission', 'omission'
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  const generateTrials = useCallback(() => {
    const t = [];
    // Ensure roughly 60% are targets
    for (let i = 0; i < TOTAL_TRIALS; i++) {
      const isTarget = Math.random() < 0.6;
      const symbol = isTarget ? TARGET_SYMBOL : SYMBOLS[1 + Math.floor(Math.random() * (SYMBOLS.length - 1))];
      t.push({ symbol, isTarget });
    }
    return t;
  }, []);

  const showNextTrial = useCallback((trialList, index) => {
    if (index >= trialList.length) {
      setPhase('done');
      return;
    }
    setCurrentSymbol(trialList[index].symbol);
    setResponded(false);
    setFeedback(null);
    startTimeRef.current = Date.now();

    // Auto-advance after SHOW_DURATION
    timerRef.current = setTimeout(() => {
      if (!responded) {
        // Check if it was a target (omission error)
        const trial = trialList[index];
        if (trial.isTarget) {
          setFeedback('omission');
          trial.result = 'omission';
          trial.responseTime = null;
        } else {
          setFeedback('correct');
          trial.result = 'correctRejection';
          trial.responseTime = null;
        }
      }
      setPhase('between');
      setTimeout(() => {
        setTrialIndex(index + 1);
        if (index + 1 < trialList.length) {
          setPhase('active');
          showNextTrial(trialList, index + 1);
        } else {
          setPhase('done');
        }
      }, 600);
    }, SHOW_DURATION);
  }, []);

  const startTest = useCallback(() => {
    const trialList = generateTrials();
    setTrials(trialList);
    setTrialIndex(0);
    setPhase('active');
    showNextTrial(trialList, 0);
  }, [generateTrials, showNextTrial]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'done' && trials.length > 0) {
      // Calculate results
      const completed = trials.filter(t => t.result);
      const hits = completed.filter(t => t.result === 'hit');
      const commissions = completed.filter(t => t.result === 'commission');
      const omissions = completed.filter(t => t.result === 'omission');
      const correctRejections = completed.filter(t => t.result === 'correctRejection');
      const totalTargets = trials.filter(t => t.isTarget).length;
      const totalDistractors = trials.filter(t => !t.isTarget).length;
      const responseTimes = hits.map(t => t.responseTime).filter(Boolean);
      const avgRT = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

      setTimeout(() => {
        onComplete({
          totalTrials: TOTAL_TRIALS,
          hits: hits.length,
          commissionErrors: commissions.length,
          omissionErrors: omissions.length,
          correctRejections: correctRejections.length,
          totalTargets,
          totalDistractors,
          hitRate: totalTargets > 0 ? Math.round((hits.length / totalTargets) * 100) : 0,
          commissionRate: totalDistractors > 0 ? Math.round((commissions.length / totalDistractors) * 100) : 0,
          avgResponseTimeMs: Math.round(avgRT),
          responseTimes,
        });
      }, 800);
    }
  }, [phase, trials, onComplete]);

  const handleTap = () => {
    if (phase !== 'active' || responded) return;
    setResponded(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    const rt = Date.now() - startTimeRef.current;
    const trial = trials[trialIndex];

    if (trial.isTarget) {
      trial.result = 'hit';
      trial.responseTime = rt;
      setFeedback('correct');
    } else {
      trial.result = 'commission';
      trial.responseTime = rt;
      setFeedback('commission');
    }

    // Move to next after brief feedback
    setTimeout(() => {
      const nextIndex = trialIndex + 1;
      setTrialIndex(nextIndex);
      if (nextIndex < trials.length) {
        showNextTrial(trials, nextIndex);
      } else {
        setPhase('done');
      }
    }, 500);
  };

  const getProgress = () => (trialIndex / TOTAL_TRIALS) * 100;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Attention Test</h2>
        <span className="text-white/40 text-sm">{Math.min(trialIndex + 1, TOTAL_TRIALS)} / {TOTAL_TRIALS}</span>
      </div>

      <div className="progress-bar mb-6">
        <div className="progress-bar-fill" style={{ width: `${getProgress()}%` }}></div>
      </div>

      <div
        onClick={phase === 'active' ? handleTap : undefined}
        className={`glass-card p-6 md:p-8 min-h-[340px] flex flex-col items-center justify-center transition-all duration-200 ${
          phase === 'active' ? 'cursor-pointer active:scale-[0.98]' : ''
        } ${feedback === 'correct' ? 'border-emerald-500/30' : feedback === 'commission' ? 'border-red-500/30' : ''}`}
      >
        {phase === 'intro' && (
          <div className="text-center animate-fade-in">
            <p className="text-white/80 text-lg font-medium mb-2">Test your focus</p>
            <p className="text-white/50 text-sm mb-3">
              Tap the screen <strong className="text-white">only</strong> when you see the target:
            </p>
            <div className="text-6xl mb-3">{TARGET_SYMBOL}</div>
            <p className="text-white/40 text-xs mb-6">
              Do NOT tap for any other symbol. Be quick but accurate!
            </p>
            <button 
              onClick={startTest} 
              className="mt-4 relative overflow-hidden px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-[0_8px_25px_rgba(6,182,212,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(6,182,212,0.6)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Begin Test
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </span>
            </button>
          </div>
        )}

        {(phase === 'active' || phase === 'between') && (
          <div className="text-center">
            <div className={`text-7xl md:text-8xl mb-4 transition-all duration-200 ${
              feedback === 'correct' ? 'scale-110' : feedback === 'commission' ? 'scale-90 opacity-50' : ''
            }`}>
              {currentSymbol}
            </div>
            {phase === 'active' && !responded && (
              <p className="text-white/40 text-xs">
                {trials[trialIndex]?.isTarget ? 'Tap! It\'s the target!' : ''}
              </p>
            )}
            {feedback === 'correct' && (
              <p className="text-emerald-400 text-sm font-medium animate-fade-in">✓ Correct!</p>
            )}
            {feedback === 'commission' && (
              <p className="text-red-400 text-sm font-medium animate-fade-in">✗ Not the target!</p>
            )}
            {feedback === 'omission' && (
              <p className="text-amber-400 text-sm font-medium animate-fade-in">Missed! That was the target.</p>
            )}
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center animate-scale-in">
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Test complete. Preparing results...</span>
            </div>
          </div>
        )}
      </div>

      {phase !== 'intro' && phase !== 'done' && (
        <p className="text-center text-white/30 text-xs mt-4">
          Tap only for {TARGET_SYMBOL} · Ignore all other symbols
        </p>
      )}
    </div>
  );
}
