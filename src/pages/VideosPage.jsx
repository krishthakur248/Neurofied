import { Play } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const videos = [
  {
    id: '1',
    title: "Early Signs of Alzheimer's",
    channel: "Brain Health",
    videoId: "7_kO6c2NfmE",
    duration: "8:24"
  },
  {
    id: '2',
    title: "Understanding Cognitive Decline",
    channel: "MedExplained",
    videoId: "a7NMro040zI",
    duration: "12:01"
  },
  {
    id: '3',
    title: "Brain Foods That Boost Memory",
    channel: "Wellness Daily",
    videoId: "v_K1O1z9_pA",
    duration: "6:45"
  },
  {
    id: '4',
    title: "How Sleep Affects Your Brain",
    channel: "NeuroLab",
    videoId: "pwaWilO_Pig",
    duration: "10:32"
  },
  {
    id: '5',
    title: "Mindfulness for Mental Clarity",
    channel: "Calm Mind",
    videoId: "vzKryaN44ss",
    duration: "7:18"
  },
  {
    id: '6',
    title: "Exercise & Cognitive Health",
    channel: "Active Brain",
    videoId: "BHY0FxzoKZE",
    duration: "9:50"
  }
];

export default function VideosPage() {
  return (
    <div className="flex-1 flex flex-col md:ml-64 ml-0 overflow-hidden pb-24 md:pb-0 bg-background min-h-screen">
      {/* Shared Page Header with profile — desktop */}
      <div className="hidden md:block">
        <PageHeader searchPlaceholder="Search videos..." />
      </div>

      {/* Mobile App Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-outline-variant px-4 py-4">
        <h1 className="text-xl font-bold text-on-surface">Brain Health Library</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 hidden md:block">
            <h2 className="text-3xl font-bold text-on-surface mb-2">Brain Health Library</h2>
            <p className="text-on-surface-variant text-base">Curated videos to learn and protect your mind</p>
          </div>
          
          <div className="md:hidden mb-6">
            <p className="text-on-surface-variant text-sm">Curated videos to learn and protect your mind</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative aspect-video bg-surface-container-high w-full overflow-hidden">
                  <iframe 
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`} 
                    title={video.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-on-surface text-base mb-1 line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm">
                    {video.channel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
