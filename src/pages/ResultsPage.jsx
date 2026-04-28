import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { insforgeClient } from '../lib/insforge';
import PageHeader from '../components/PageHeader';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    loadResults();
  }, [user]);

  const loadResults = async () => {
    if (!user) {
      console.log('⏳ Waiting for user to be loaded...');
      return;
    }

    try {
      console.log('📊 Loading test results for user:', user.id);

      const { data, error } = await insforgeClient
        .from('test_results')
        .select('*, tests:test_id(name, slug, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading test results:', error);
        setResults([]);
      } else if (data) {
        console.log('✅ Successfully loaded', data.length, 'test results');
        setResults(data);
        if (data.length > 0) setSelectedResult(data[0]);
      }
    } catch (e) {
      console.error('❌ Exception while loading results:', e);
      setResults([]);
    }
    setLoading(false);
  };

  // Group results by session
  const sessions = [];
  const seen = new Set();
  results.forEach(r => {
    const key = new Date(r.created_at).toISOString().slice(0, 16);
    if (!seen.has(key)) {
      seen.add(key);
      const sessionResults = results.filter(x => new Date(x.created_at).toISOString().slice(0, 16) === key);
      const avgScore = Math.round(sessionResults.reduce((s, x) => s + x.score, 0) / sessionResults.length);
      sessions.push({ date: r.created_at, results: sessionResults, avgScore, riskLevel: r.risk_level });
    }
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background md:ml-64 ml-0 pb-24 md:pb-0">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:ml-64 ml-0 overflow-hidden pb-24 md:pb-0">
      {/* Page Header with Search, Notifications, and Profile */}
      <PageHeader searchPlaceholder="Search your results..." />

      {/* Title Section */}
      <div className="sticky top-[68px] z-30 bg-white/95 backdrop-blur-sm border-b border-outline-variant shadow-sm px-8 py-4 flex items-center justify-between">
        <h2 className="font-h2 text-h2 text-on-surface">Your Results</h2>
        <button
          onClick={() => navigate('/test')}
          className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg transition-colors hover:bg-primary/90"
        >
          Take Another Test
        </button>
      </div>

      {/* Results Summary Section */}
      <main className="flex-1 overflow-y-auto p-margin-desktop bg-background">
        <div className="max-w-container-max mx-auto space-y-gutter">
          {results.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant text-center">
              <span className="text-6xl block mb-4">📊</span>
              <h3 className="font-h3 text-h3 text-on-surface mb-2">No results yet</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Complete a cognitive assessment to see your progress.</p>
              <button
                onClick={() => navigate('/test')}
                className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-lg transition-colors hover:bg-primary/90"
              >
                Start Assessment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
              {/* Statistics Cards */}
              <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant shadow-[0_4px_20px_rgba(37,99,235,0.03)]">
                <p className="font-caption text-caption text-on-surface-variant mb-2">Latest Score</p>
                <p className="font-h1 text-h1 text-on-surface">{sessions[0]?.avgScore || 0}</p>
                <p className="font-caption text-caption text-on-surface-variant mt-2">
                  {new Date(sessions[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant shadow-[0_4px_20px_rgba(37,99,235,0.03)]">
                <p className="font-caption text-caption text-on-surface-variant mb-2">Average Score</p>
                <p className="font-h1 text-h1 text-on-surface">
                  {sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.avgScore, 0) / sessions.length) : 0}
                </p>
                <p className="font-caption text-caption text-on-surface-variant mt-2">{sessions.length} sessions</p>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant shadow-[0_4px_20px_rgba(37,99,235,0.03)]">
                <p className="font-caption text-caption text-on-surface-variant mb-2">Highest Score</p>
                <p className="font-h1 text-h1 text-on-surface">
                  {sessions.length > 0 ? Math.max(...sessions.map(s => s.avgScore)) : 0}
                </p>
                <p className="font-caption text-caption text-on-surface-variant mt-2">All time best</p>
              </div>
            </div>
          )}

          {/* Results List and Details */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
              {/* Sessions List */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(37,99,235,0.03)] overflow-hidden flex flex-col">
                <div className="p-stack-lg border-b border-outline-variant">
                  <h3 className="font-h3 text-h3 text-on-surface">Test Sessions</h3>
                </div>

                <div className="divide-y divide-outline-variant flex-1 overflow-y-auto">
                  {sessions.map((session, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedResult(session.results[0])}
                      className={`w-full p-stack-md text-left hover:bg-surface-container-low transition ${
                        selectedResult?.created_at === session.results[0]?.created_at ? 'bg-surface-container-low' : ''
                      }`}
                    >
                      <p className="font-label-md text-label-md text-on-surface">
                        {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant mt-1">{session.results.length} test(s)</p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="font-label-md text-label-md text-on-surface">{session.avgScore}/100</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption ${
                          session.riskLevel === 'low' ? 'bg-secondary-container text-on-secondary-container' :
                          session.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-900' : 'bg-error-container text-on-error-container'
                        }`}>
                          {session.riskLevel.charAt(0).toUpperCase() + session.riskLevel.slice(1)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Result Details */}
              {selectedResult && (
                <div className="lg:col-span-2 space-y-gutter">
                  {/* Score Overview */}
                  <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant shadow-[0_4px_20px_rgba(37,99,235,0.03)] text-center">
                    <p className="font-caption text-caption text-on-surface-variant mb-3">
                      Test Result from {new Date(selectedResult.created_at).toLocaleDateString()}
                    </p>
                    <div className="font-h1 text-h1 text-on-surface mb-4">{selectedResult.score}</div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-label-md font-label-md ${
                      selectedResult.risk_level === 'low' ? 'bg-secondary-container text-on-secondary-container' :
                      selectedResult.risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-900' : 'bg-error-container text-on-error-container'
                    }`}>
                      <span className="material-symbols-outlined text-[18px] mr-1">
                        {selectedResult.risk_level === 'low' ? 'check_circle' : selectedResult.risk_level === 'moderate' ? 'warning' : 'dangerous'}
                      </span>
                      {selectedResult.risk_level.charAt(0).toUpperCase() + selectedResult.risk_level.slice(1)} Risk
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant shadow-[0_4px_20px_rgba(37,99,235,0.03)]">
                    <h3 className="font-h3 text-h3 text-on-surface mb-4">AI Analysis</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {selectedResult.ai_insights?.interpretation || 'No analysis available.'}
                    </p>
                  </div>

                  {/* Recommendations */}
                  {selectedResult.ai_insights?.recommendations?.length > 0 && (
                    <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant shadow-[0_4px_20px_rgba(37,99,235,0.03)]">
                      <h3 className="font-h3 text-h3 text-on-surface mb-4">Recommendations</h3>
                      <div className="space-y-3">
                        {selectedResult.ai_insights.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-3 p-stack-md bg-surface-container-high rounded-lg">
                            <span className="material-symbols-outlined text-secondary flex-shrink-0 mt-0.5">check_circle</span>
                            <p className="font-body-md text-body-md text-on-surface-variant">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant">
                    <p className="font-caption text-caption text-on-surface-variant">
                      ⚠️ <strong>Disclaimer:</strong> This assessment is not a medical diagnosis. Please consult a healthcare professional for clinical advice.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
