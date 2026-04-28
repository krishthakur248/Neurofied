import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { insforgeClient } from '../lib/insforge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FloatingChatButton from '../components/FloatingChatButton';
import PageHeader from '../components/PageHeader';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    reactionTime: null,
    workingMemory: null,
    sustainedAttention: null,
  });

  useEffect(() => {
    loadData();
  }, [user, timeRange]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('📊 Loading home dashboard data for user:', user.id);

      // Load user progress
      const { data: progressData, error: progressError } = await insforgeClient
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('❌ Error loading progress:', progressError);
      } else if (progressData) {
        console.log('✅ Loaded user progress:', progressData);
        setUserProgress(progressData);
      }

      // Load test results for trend and metrics
      const { data: resultsData, error: resultsError } = await insforgeClient
        .from('test_results')
        .select('id, score, created_at, tests(id, name, slug)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (resultsError) {
        console.error('❌ Error loading results:', resultsError);
      } else if (resultsData && resultsData.length > 0) {
        // Get latest metrics by test type
        const metricsMap = {};
        resultsData.forEach(result => {
          const testName = result.tests?.slug || result.tests?.name || '';
          if (!metricsMap[testName]) {
            metricsMap[testName] = result; // Store latest result for each test type
          }
        });

        // Update metrics based on test type
        const newMetrics = { ...metrics };
        Object.entries(metricsMap).forEach(([testSlug, result]) => {
          if (testSlug.includes('reaction')) {
            newMetrics.reactionTime = result.score; // Assuming score is in ms
          } else if (testSlug.includes('memory')) {
            newMetrics.workingMemory = result.score; // Assuming score is percentage
          } else if (testSlug.includes('attention')) {
            newMetrics.sustainedAttention = result.score; // Assuming score is percentage
          }
        });
        setMetrics(newMetrics);
        console.log('✅ Loaded metrics:', newMetrics);

        // Process data based on time range for trend chart
        const now = new Date();
        const daysAgo = parseInt(timeRange);
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        // Group by date and calculate daily average
        const grouped = {};
        resultsData
          .filter(r => new Date(r.created_at) >= cutoffDate)
          .forEach(r => {
            const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!grouped[date]) {
              grouped[date] = [];
            }
            grouped[date].push(r.score);
          });

        // Convert to chart data
        const chartData = Object.entries(grouped).map(([date, scores]) => ({
          date,
          score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          fullDate: date,
        }));

        console.log('✅ Loaded trend data:', chartData);
        setTrendData(chartData);
      }
    } catch (err) {
      console.error('❌ Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasTakenTest = userProgress && userProgress.total_tests_completed > 0;
  const latestScore = hasTakenTest ? (userProgress.average_score || 0) : 0;
  
  let performanceLevel = null;
  let scoreColor = '#e0e7ff';
  let scoreIcon = 'info';
  let badgeColorClass = 'bg-surface-container text-on-surface-variant';

  if (hasTakenTest) {
    if (latestScore >= 80) {
      performanceLevel = 'Excellent';
      scoreColor = '#006c49';
      scoreIcon = 'stars';
      badgeColorClass = 'bg-secondary-container text-on-secondary-container';
    } else if (latestScore >= 50) {
      performanceLevel = 'Good';
      scoreColor = '#f59e0b';
      scoreIcon = 'thumb_up';
      badgeColorClass = 'bg-yellow-100 text-yellow-900';
    } else {
      performanceLevel = 'Needs Focus';
      scoreColor = '#ef4444';
      scoreIcon = 'trending_down';
      badgeColorClass = 'bg-error-container text-on-error-container';
    }
  }

  return (
    <div className="flex-1 flex flex-col md:ml-64 ml-0 overflow-hidden pb-24 md:pb-0">
      {/* Page Header with Search, Notifications, and Profile */}
      <PageHeader searchPlaceholder="Search insights..." />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-margin-desktop bg-background">
        <div className="max-w-container-max mx-auto space-y-gutter">
          {/* Welcome & CTA Banner */}
          <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant shadow-[0_8px_30px_rgba(37,99,235,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-stack-md">
            <div>
              <h2 className="font-h2 text-h2 text-on-surface mb-2">Welcome back, {user?.profile?.name || 'Guest'}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                {userProgress?.total_tests_completed || 0} cognitive assessments completed. Keep tracking your progress!
              </p>
            </div>
            <button
              onClick={() => navigate('/test')}
              className="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md px-6 py-3 rounded-full shadow-sm transition-all flex items-center gap-2 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">play_arrow</span>
              Take Assessment
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Cognitive Score Card */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant shadow-[0_4px_20px_rgba(37,99,235,0.03)] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-h3 text-h3 text-on-surface">Cognitive Score</h3>
                <button className="text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="relative w-48 h-28 flex items-center justify-center mb-4">
                  <svg className="w-full h-full" viewBox="0 0 120 70" preserveAspectRatio="xMidYMid meet">
                    {/* Background Semi-Circle */}
                    <path d="M 20 60 A 40 40 0 0 1 100 60" fill="none" stroke="#e0e7ff" strokeLinecap="round" strokeWidth="10"></path>
                    {/* Progress Semi-Circle */}
                    <path
                      d="M 20 60 A 40 40 0 0 1 100 60"
                      fill="none"
                      stroke={scoreColor}
                      strokeLinecap="round"
                      strokeWidth="10"
                      strokeDasharray={`${hasTakenTest ? (latestScore / 100) * 125.6 : 0} 125.6`}
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    ></path>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                    <span className="font-h2 text-h2 text-on-surface leading-none">{hasTakenTest ? latestScore : '--'}</span>
                  </div>
                </div>
                {hasTakenTest ? (
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-label-md text-label-md mt-2 ${badgeColorClass}`}>
                    <span className="material-symbols-outlined text-[16px]">{scoreIcon}</span>
                    {performanceLevel}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-label-md text-label-md mt-2 bg-surface-container text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    No Data Yet
                  </div>
                )}
                <p className="font-caption text-caption text-on-surface-variant mt-4 text-center">
                  Based on aggregate data from recent Brain Games.
                </p>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant shadow-[0_4px_20px_rgba(37,99,235,0.03)] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-h3 text-h3 text-on-surface">Performance Trend</h3>
                  <p className="font-caption text-caption text-on-surface-variant mt-1">Last {timeRange} Days Aggregate</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimeRange('30')}
                    className={`px-3 py-1 rounded-md font-label-md text-label-md transition-colors ${timeRange === '30' ? 'bg-surface-container text-on-surface' : 'text-outline hover:bg-surface'}`}
                  >
                    30D
                  </button>
                  <button
                    onClick={() => setTimeRange('90')}
                    className={`px-3 py-1 rounded-md font-label-md text-label-md transition-colors ${timeRange === '90' ? 'bg-surface-container text-on-surface' : 'text-outline hover:bg-surface'}`}
                  >
                    90D
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full min-h-[200px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.5)"
                        style={{ fontSize: '12px' }}
                        interval={Math.max(0, Math.floor(trendData.length / 4) - 1)}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.5)"
                        domain={[0, 100]}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => `${value} / 100`}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#0053db"
                        strokeWidth={3}
                        dot={{ fill: '#ffffff', r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-on-surface-variant">
                    <p>No trend data available yet. Complete a test to see your progress!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Reaction Time */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant shadow-sm hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(37,99,235,0.06)] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <span className="text-secondary font-label-md text-label-md flex items-center gap-1 bg-secondary-container/30 px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span> Latest
                </span>
              </div>
              <h4 className="font-body-md text-body-md text-on-surface-variant mb-1">Reaction Time</h4>
              <div className="flex items-end justify-between">
                <div className="font-h3 text-h3 text-on-surface">{metrics.reactionTime ? `${Math.round(metrics.reactionTime)}` : '—'} {metrics.reactionTime && <span className="font-body-md text-body-md text-outline">ms</span>}</div>
              </div>
            </div>

            {/* Working Memory */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant shadow-sm hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(37,99,235,0.06)] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <span className="text-tertiary font-label-md text-label-md flex items-center gap-1 bg-tertiary-fixed/30 px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> Improving
                </span>
              </div>
              <h4 className="font-body-md text-body-md text-on-surface-variant mb-1">Working Memory</h4>
              <div className="flex items-end justify-between">
                <div className="font-h3 text-h3 text-on-surface">{metrics.workingMemory ? `${Math.round(metrics.workingMemory)}` : '—'} {metrics.workingMemory && <span className="font-body-md text-body-md text-outline">%</span>}</div>
              </div>
            </div>

            {/* Sustained Attention */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant shadow-sm hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(37,99,235,0.06)] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">visibility</span>
                </div>
                <span className="text-secondary font-label-md text-label-md flex items-center gap-1 bg-secondary-container/30 px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> Stable
                </span>
              </div>
              <h4 className="font-body-md text-body-md text-on-surface-variant mb-1">Sustained Attention</h4>
              <div className="flex items-end justify-between">
                <div className="font-h3 text-h3 text-on-surface">{metrics.sustainedAttention ? `${Math.round(metrics.sustainedAttention)}` : '—'} {metrics.sustainedAttention && <span className="font-body-md text-body-md text-outline">%</span>}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FloatingChatButton />
    </div>
  );
}
