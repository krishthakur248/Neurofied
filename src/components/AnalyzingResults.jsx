import { useState, useEffect } from 'react';

export default function AnalyzingResults() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) { clearInterval(interval); return 95; }
        return prev + Math.random() * 8 + 2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center px-6">
      <div className="text-center animate-fade-in max-w-sm">
        <div className="relative w-40 h-40 mx-auto mb-8">
          <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="text-8xl animate-float">🧠</div>
          </div>
          <div className="absolute top-2 right-6 w-2 h-2 bg-brand-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-6 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse-slow"></div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Analyzing Your Results</h2>
        <p className="text-white/50 text-sm mb-8">Our AI model is processing your cognitive signals...</p>
        <div className="w-full max-w-xs mx-auto">
          <div className="progress-bar h-2.5 mb-3">
            <div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
          <p className="text-brand-400 text-sm font-medium">{Math.round(Math.min(progress, 100))}%</p>
        </div>
      </div>
    </div>
  );
}
