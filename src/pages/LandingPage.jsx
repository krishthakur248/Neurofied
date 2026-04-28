import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function LandingPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoOpacity, setVideoOpacity] = useState(40);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      // Start fading out 1.5 seconds before the video ends
      if (duration && duration - currentTime < 1.5) {
        setVideoOpacity(0);
      } else {
        setVideoOpacity(40);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline 
          onTimeUpdate={handleTimeUpdate}
          style={{ opacity: videoOpacity / 100 }}
          className="w-full h-full object-cover mix-blend-screen transition-opacity duration-1000 ease-in-out"
          src="/HackVideo.mp4"
        />
        {/* Gradient overlay to ensure text remains readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-900/90 to-transparent backdrop-blur-md border-b border-cyan-500/10 px-6 md:px-8 py-4 flex justify-between items-center">
        <a href="#" className="flex items-center gap-3">
          <img src="/images/LOGO.jpeg" alt="Neurofied Logo" className="w-8 h-8 object-contain rounded-md" />
          <span className="text-lg font-bold tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">NEUROFIED.AI</span>
        </a>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-400 px-4 py-2 rounded-full border border-cyan-400/30 text-sm font-semibold transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Login
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 md:px-16 lg:px-24 pt-28 md:pt-32 pb-12 min-h-screen flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 xl:gap-24">
        {/* Left Side */}
        <div className="flex-1 space-y-8 xl:space-y-10">
          {/* Badge */}
          <div className="flex items-center gap-3 w-fit px-5 py-2.5 rounded-full border border-cyan-400/30 bg-cyan-400/10">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-base font-medium text-cyan-400">AI-Powered Cognitive Healthcare</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold leading-[1.1]">
            Protect Your<br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Digital Mind.</span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-xl xl:text-2xl max-w-xl xl:max-w-2xl leading-relaxed">
            Neurofied AI predicts early signs of cognitive decline using advanced machine learning, speech analysis, and clinical memory testing. Knowledge is your best prevention.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-6 pt-6 flex-wrap">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-3 px-10 py-4 text-lg bg-cyan-400 hover:shadow-lg hover:shadow-cyan-400/50 text-slate-900 font-bold rounded-xl transition-all hover:bg-cyan-300 hover:scale-105"
            >
              Start Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 xl:gap-16 pt-8 md:pt-10 border-t border-gray-700/50">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span className="text-lg font-semibold">Early Detection</span>
              </div>
              <p className="text-base text-gray-500">94% Prediction Confidence</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span className="text-lg font-semibold">Real-time Stats</span>
              </div>
              <p className="text-base text-gray-500">Continuous tracking</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                <span className="text-lg font-semibold">3-Min Tests</span>
              </div>
              <p className="text-base text-gray-500">Clinically validated</p>
            </div>
          </div>
        </div>


      </main>
      </div>
    </div>
  );
}
