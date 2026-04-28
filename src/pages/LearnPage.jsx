import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { insforgeClient } from '../lib/insforge';
import { BookOpen, Play, FileText, Lightbulb } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const contentIcons = { video: Play, article: FileText, tip: Lightbulb };
const tabFilters = [
  { id: null, label: 'All' },
  { id: 'video', label: 'Videos' },
  { id: 'article', label: 'Articles' },
  { id: 'tip', label: 'Tips' },
];

export default function LearnPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, [activeFilter]);

  const loadResources = async () => {
    setLoading(true);
    try {
      let query = insforgeClient.from('learning_resources').select('*');
      if (activeFilter) query = query.eq('content_type', activeFilter);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error) setResources(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const colorForType = (type) => {
    if (type === 'video') return 'from-rose-500 to-pink-600';
    if (type === 'article') return 'from-blue-500 to-indigo-600';
    return 'from-amber-500 to-orange-600';
  };

  return (
    <div className="page-container">
      <PageHeader searchPlaceholder="Search resources..." />
      <div className="px-5 md:px-8 pt-6 pb-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Learn & Stay Informed</h1>
          <BookOpen className="w-5 h-5 text-white/30" />
        </div>
        <p className="text-white/40 text-sm mb-6">Learn more about brain health and cognitive wellness.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabFilters.map(tab => (
            <button
              key={tab.label}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === tab.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card h-36 shimmer rounded-2xl"></div>
            ))}
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res, i) => {
              const Icon = contentIcons[res.content_type] || FileText;
              return (
                <a
                  key={res.id}
                  href={res.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card-hover p-4 flex gap-4 items-start animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Thumbnail */}
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${colorForType(res.content_type)} flex items-center justify-center flex-shrink-0`}>
                    {res.content_type === 'video' ? (
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    ) : (
                      <Icon className="w-8 h-8 text-white/80" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{res.title}</h3>
                    <p className="text-white/40 text-xs line-clamp-2 mb-2">{res.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      {res.duration_minutes && <span>🎥 {res.duration_minutes}:{String(Math.floor(Math.random()*59)).padStart(2,'0')}</span>}
                      {res.reading_time_minutes && <span>📖 {res.reading_time_minutes} min read</span>}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-white/40 text-sm">No resources available in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
