import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { insforgeClient } from '../lib/insforge';
import { LogOut, Bell, Lock } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tests: 0, healthy: 0, express: 0 });
  const [pastResults, setPastResults] = useState([]);

  // Resolve display name and avatar
  const displayName =
    user?.profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';
  const initial = (displayName[0] || 'U').toUpperCase();
  const avatarUrl =
    user?.profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    null;

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // 1. Fetch user_progress for total tests completed
      const { data: progressData } = await insforgeClient
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // 2. Fetch all test results with test info
      const { data: resultsData, error: resultsError } = await insforgeClient
        .from('test_results')
        .select('id, score, risk_level, completed_at, created_at, tests(id, name, slug, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (resultsError) console.error('Error loading results:', resultsError);

      const results = resultsData || [];

      // Calculate stats
      const totalTests = progressData?.total_tests_completed ?? results.length;
      const healthyCount = results.filter(r => r.score != null && r.score >= 60).length;

      setStats({
        tests: totalTests,
        healthy: healthyCount,
        express: 0, // Express sessions – placeholder until table exists
      });

      // Map results for past results section
      const mapped = results.slice(0, 20).map(r => ({
        id: r.id,
        testName: r.tests?.name || 'Cognitive Test',
        category: r.tests?.category || 'general',
        slug: r.tests?.slug || '',
        score: r.score ?? null,
        riskLevel: r.risk_level || 'unknown',
        date: r.completed_at || r.created_at,
      }));

      setPastResults(mapped);
    } catch (err) {
      console.error('Profile data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await insforgeClient.auth.signOut();
    setUser(null);
    navigate('/landing');
  };

  // Risk level helpers
  const riskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'moderate': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-on-surface-variant bg-surface-container';
    }
  };

  const scoreColor = (score) => {
    if (score == null) return '#94a3b8';
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const categoryIcon = (cat) => {
    switch (cat) {
      case 'reaction': return 'timer';
      case 'memory': return 'psychology';
      case 'attention': return 'visibility';
      default: return 'neurology';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="page-container md:ml-64 ml-0 pb-24 md:pb-0">
      <div className="px-4 md:px-8 pt-6 pb-24 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-primary">Profile</h1>

        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shadow"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/30 shadow">
                  {initial}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-on-surface font-bold text-lg truncate">{displayName}</h2>
              <p className="text-on-surface-variant text-sm truncate">{user?.email}</p>
              {user?.created_at && (
                <p className="text-on-surface-variant/60 text-xs mt-0.5">
                  Member since {formatDate(user.created_at)}
                </p>
              )}
            </div>

            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all text-center">
              {loading ? (
                <div className="w-10 h-8 bg-surface-container-low rounded animate-pulse mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold text-primary mb-1">{stats.tests}</div>
              )}
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">TESTS</div>
            </div>
            <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all text-center">
              {loading ? (
                <div className="w-10 h-8 bg-surface-container-low rounded animate-pulse mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.healthy}</div>
              )}
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">HEALTHY</div>
            </div>
            <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all text-center">
              {loading ? (
                <div className="w-10 h-8 bg-surface-container-low rounded animate-pulse mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.express}</div>
              )}
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">EXPRESS</div>
            </div>
          </div>
        </div>

        {/* Settings Items */}
        <div className="space-y-3 mb-6">
          <button className="w-full bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <Bell size={20} />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-on-surface">Reminders</div>
              <div className="text-sm text-on-surface-variant">Get notified about your health</div>
            </div>
            <span className="text-on-surface-variant">›</span>
          </button>

          <button className="w-full bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <Lock size={20} />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-on-surface">Privacy</div>
              <div className="text-sm text-on-surface-variant">Control your data</div>
            </div>
            <span className="text-on-surface-variant">›</span>
          </button>
        </div>

        {/* Past Results Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-on-surface">Past results</h3>
            {pastResults.length > 0 && (
              <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
                {pastResults.length} {pastResults.length === 1 ? 'result' : 'results'}
              </span>
            )}
          </div>

          {loading ? (
            // Skeleton loaders
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm animate-pulse flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-surface-container flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container rounded w-2/3" />
                    <div className="h-3 bg-surface-container rounded w-1/3" />
                  </div>
                  <div className="h-8 w-12 bg-surface-container rounded-lg" />
                </div>
              ))}
            </div>
          ) : pastResults.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 block mb-3">
                neurology
              </span>
              <p className="text-on-surface-variant font-medium">No results yet.</p>
              <p className="text-on-surface-variant/70 text-sm mt-1">
                Take a test to start tracking your cognitive health.
              </p>
              <button
                onClick={() => navigate('/test')}
                className="mt-4 px-5 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Take a Test
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pastResults.map((result) => (
                <div
                  key={result.id}
                  className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4"
                >
                  {/* Category Icon */}
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      {categoryIcon(result.category)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm truncate">{result.testName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-on-surface-variant">{formatDate(result.date)}</span>
                      {result.riskLevel && result.riskLevel !== 'unknown' && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${riskColor(result.riskLevel)}`}>
                          {result.riskLevel} risk
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    {result.score != null ? (
                      <div
                        className="text-xl font-black leading-none"
                        style={{ color: scoreColor(result.score) }}
                      >
                        {result.score}
                        <span className="text-xs font-medium text-on-surface-variant ml-0.5">/100</span>
                      </div>
                    ) : (
                      <span className="text-on-surface-variant/50 text-sm">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 px-4 bg-error-container hover:bg-error-container/90 active:bg-error-container/80 rounded-xl text-error font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>

        <p className="text-center text-on-surface-variant/60 text-xs mt-8">
          Neurofied.ai v1.0 · Wellness tool, not a medical device.
        </p>
      </div>
    </div>
  );
}
