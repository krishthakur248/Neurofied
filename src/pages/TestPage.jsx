import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import ReactionTimeTest from '../components/tests/ReactionTimeTest';
import MemoryTest from '../components/tests/MemoryTest';
import AttentionTest from '../components/tests/AttentionTest';
import AnalyzingResults from '../components/AnalyzingResults';
import { insforgeClient } from '../lib/insforge';
import PageHeader from '../components/PageHeader';

const TEST_CONFIG = [
  { slug: 'reaction-time', name: 'Reaction Time', icon: 'bolt', desc: 'Measure absolute neural processing speed and motor response latency. This assessment provides baseline data for overall cognitive processing efficiency.', time: '60 seconds', Component: ReactionTimeTest, badge: 'Core Metric' },
  { slug: 'memory-test', name: 'Memory Accuracy', icon: 'psychology', desc: 'Assess short-term recall fidelity and working memory capacity through pattern recognition and sequence retention exercises.', time: '90 seconds', Component: MemoryTest },
  { slug: 'attention-test', name: 'Attention & Focus', icon: 'center_focus_strong', desc: 'Evaluate sustained concentration, visual tracking, and the ability to suppress cognitive distractors over a continuous operational period.', time: '120 seconds', Component: AttentionTest, badge: 'Advanced' },
];

// Static client-side scoring
function computeScores(reactionData, memoryData, attentionData) {
  let reactionScore = 100;
  if (reactionData) {
    const mean = reactionData.meanRT;
    if (mean <= 200) reactionScore = 100;
    else if (mean <= 250) reactionScore = 90;
    else if (mean <= 300) reactionScore = 80;
    else if (mean <= 350) reactionScore = 70;
    else if (mean <= 400) reactionScore = 60;
    else if (mean <= 500) reactionScore = 45;
    else reactionScore = 30;
    if (reactionData.cvRT > 25) reactionScore = Math.max(reactionScore - 10, 20);
  }

  let memoryScore = 100;
  if (memoryData) {
    memoryScore = Math.round(memoryData.memoryAccuracy);
  }

  let attentionScore = 100;
  if (attentionData) {
    const hitRate = attentionData.hitRate || 0;
    const commRate = attentionData.commissionRate || 0;
    attentionScore = Math.round(hitRate * 0.6 + (100 - commRate) * 0.4);
  }

  const overallScore = Math.round((reactionScore + memoryScore + attentionScore) / 3);

  let riskLevel = 'low';
  if (overallScore < 50) riskLevel = 'high';
  else if (overallScore < 70) riskLevel = 'moderate';

  const riskLabels = {
    low: 'Your brain is performing well. Keep it up!',
    moderate: 'Some patterns are worth watching. We recommend re-testing in 3 days.',
    high: 'Your results suggest it may be worth speaking with a healthcare professional.',
  };

  const suggestions = [];
  if (reactionScore < 70) suggestions.push({ icon: '🏃', text: 'Stay physically active — exercise improves reaction speed.' });
  if (memoryScore < 70) suggestions.push({ icon: '🧩', text: 'Practice brain exercises daily to strengthen memory.' });
  if (attentionScore < 70) suggestions.push({ icon: '😴', text: 'Maintain a regular sleep schedule for better focus.' });
  suggestions.push({ icon: '🥗', text: 'Eat a balanced and healthy diet rich in omega-3s.' });
  if (suggestions.length < 4) suggestions.push({ icon: '🧘', text: 'Practice mindfulness meditation to reduce cognitive stress.' });

  return {
    overallScore,
    reactionScore,
    memoryScore,
    attentionScore,
    riskLevel,
    riskLabel: riskLabels[riskLevel],
    suggestions,
    interpretation: generateInterpretation(reactionScore, memoryScore, attentionScore, riskLevel),
  };
}

function generateInterpretation(reactionScore, memoryScore, attentionScore, riskLevel) {
  const parts = [];
  if (reactionScore < 60) parts.push('Your reaction time is slightly slower than average');
  else if (reactionScore >= 80) parts.push('Your reaction time is within the normal range');

  if (memoryScore < 60) parts.push('memory performance is below normal range');
  else if (memoryScore >= 80) parts.push('memory recall is strong');

  if (attentionScore < 60) parts.push('attention focus could be improved');
  else if (attentionScore >= 80) parts.push('attention and focus are solid');

  if (parts.length === 0) return 'Your cognitive performance is within the healthy range across all domains.';

  let text = parts.join(', and ') + '.';
  if (riskLevel === 'moderate') text += ' This may indicate early signs of cognitive stress or fatigue.';
  if (riskLevel === 'high') text += ' We recommend consulting with a healthcare professional.';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function TestPage() {
  const { testSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState('select');
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testResults, setTestResults] = useState({});
  const [finalResults, setFinalResults] = useState(null);

  useEffect(() => {
    if (testSlug) {
      const idx = TEST_CONFIG.findIndex(t => t.slug === testSlug);
      if (idx >= 0) {
        setCurrentTestIndex(idx);
        setView('testing');
      }
    }
  }, [testSlug]);

  const handleStartAll = () => {
    setCurrentTestIndex(0);
    setTestResults({});
    setView('testing');
  };

  const handleTestComplete = (data) => {
    const slug = TEST_CONFIG[currentTestIndex].slug;
    const newResults = { ...testResults, [slug]: data };
    setTestResults(newResults);

    if (currentTestIndex < TEST_CONFIG.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
    } else {
      setView('analyzing');
      setTimeout(async () => {
        const scores = computeScores(
          newResults['reaction-time'],
          newResults['memory-test'],
          newResults['attention-test']
        );
        setFinalResults(scores);

        try {
          console.log('📊 Starting to save test results for user:', user.id);

          const { data: tests, error: testsError } = await insforgeClient.from('tests').select('id, slug');

          if (testsError) {
            console.error('❌ Error fetching tests:', testsError);
            throw testsError;
          }

          if (tests) {
            console.log('✅ Found', tests.length, 'tests in database');

            for (const test of tests) {
              const rawData = newResults[test.slug];
              if (rawData) {
                let score = 0;
                if (test.slug === 'reaction-time') score = scores.reactionScore;
                else if (test.slug === 'memory-test') score = scores.memoryScore;
                else if (test.slug === 'attention-test') score = scores.attentionScore;

                const resultData = {
                  user_id: user.id,
                  test_id: test.id,
                  score,
                  raw_data: rawData,
                  risk_level: scores.riskLevel,
                  risk_score: scores.overallScore,
                  ai_insights: {
                    interpretation: scores.interpretation,
                    recommendations: scores.suggestions.map(s => s.text),
                    flags: [],
                  },
                  duration_seconds: Math.round((rawData.avgResponseTimeMs || rawData.meanRT || 0) / 1000 * 5),
                };

                console.log(`📝 Saving ${test.slug} result with score: ${score}`);

                const { data: insertedData, error: insertError } = await insforgeClient
                  .from('test_results')
                  .insert([resultData])
                  .select();

                if (insertError) {
                  console.error(`❌ Error saving ${test.slug}:`, insertError);
                  throw insertError;
                }

                console.log(`✅ Successfully saved ${test.slug}`, insertedData);
              }
            }

            console.log('📈 Updating user progress...');

            const { data: existingProgress, error: progressError } = await insforgeClient
              .from('user_progress')
              .select('*')
              .eq('user_id', user.id)
              .single();

            if (progressError && progressError.code !== 'PGRST116') {
              console.error('❌ Error fetching user progress:', progressError);
              throw progressError;
            }

            const progressData = {
              user_id: user.id,
              total_tests_completed: (existingProgress?.total_tests_completed || 0) + 1,
              average_score: existingProgress
                ? Math.round(((existingProgress.average_score * existingProgress.total_tests_completed) + scores.overallScore) / ((existingProgress.total_tests_completed || 0) + 1))
                : scores.overallScore,
              latest_risk_level: scores.riskLevel,
              last_test_date: new Date().toISOString(),
            };

            if (existingProgress) {
              const { error: updateError } = await insforgeClient
                .from('user_progress')
                .update(progressData)
                .eq('user_id', user.id);

              if (updateError) {
                console.error('❌ Error updating user progress:', updateError);
                throw updateError;
              }
              console.log('✅ User progress updated');
            } else {
              const { error: insertError } = await insforgeClient
                .from('user_progress')
                .insert([progressData]);

              if (insertError) {
                console.error('❌ Error inserting user progress:', insertError);
                throw insertError;
              }
              console.log('✅ User progress created');
            }

            console.log('🎉 All results saved successfully!');
          }
        } catch (err) {
          console.error('❌ Critical error saving results:', err);
        }

        setView('results');
      }, 3500);
    }
  };

  const CurrentTestComponent = TEST_CONFIG[currentTestIndex]?.Component;

  // Selection View
  if (view === 'select') {
    return (
      <div className="flex-1 flex flex-col md:ml-64 ml-0 min-h-screen overflow-hidden pb-24 md:pb-0">
        {/* Shared Page Header with profile */}
        <PageHeader searchPlaceholder="Search assessments..." />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-margin-desktop bg-background">
          <div className="max-w-container-max mx-auto w-full">
            <header className="mb-stack-lg max-w-2xl">
              <h2 className="font-h2 text-h2 text-on-background mb-stack-sm">Cognitive Assessments</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Select a clinical-grade module to measure specific cognitive domains. Ensure the environment is quiet and free from distractions before beginning.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {TEST_CONFIG.map((test, idx) => (
                <article
                  key={idx}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_30px_rgb(37,99,235,0.03)] p-gutter flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(37,99,235,0.08)] transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    setCurrentTestIndex(idx);
                    setView('testing');
                  }}
                >
                  <div className="flex justify-between items-start mb-stack-md">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:text-on-primary transition-colors duration-300 ${
                      idx === 0 ? 'bg-surface-container-low text-primary group-hover:bg-primary' :
                      idx === 1 ? 'bg-surface-container-low text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary' :
                      'bg-surface-container-low text-secondary group-hover:bg-secondary group-hover:text-on-secondary'
                    }`}>
                      <span className="material-symbols-outlined text-[28px]">{test.icon}</span>
                    </div>
                    {test.badge && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-caption text-caption bg-secondary-container text-on-secondary-container">
                        {test.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-h3 text-h3 text-on-surface mb-2 group-hover:text-primary transition-colors">{test.name}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-stack-lg flex-1">
                    {test.desc}
                  </p>

                  <div className="flex items-center justify-between pt-stack-md border-t border-outline-variant/50">
                    <div className="flex items-center text-on-surface-variant font-caption text-caption">
                      <span className="material-symbols-outlined text-[16px] mr-1">timer</span>
                      <span>Est. {test.time}</span>
                    </div>
                    <button className="bg-primary text-on-primary px-5 py-2 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors">
                      Begin Test
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Testing View
  if (view === 'testing' && CurrentTestComponent) {
    return (
      <div className="flex-1 flex flex-col md:ml-64 ml-0 min-h-screen overflow-hidden bg-[#0b1c30] pb-24 md:pb-0">
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#0b1c30_100%)] text-white">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setView('select')}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold mb-8 transition-all hover:-translate-x-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
              Back to Assessments
            </button>
            <CurrentTestComponent onComplete={handleTestComplete} />
          </div>
        </main>
      </div>
    );
  }

  // Analyzing View
  if (view === 'analyzing') {
    return <AnalyzingResults />;
  }

  // Results View
  if (view === 'results' && finalResults) {
    return (
      <div className="flex-1 flex flex-col md:ml-64 ml-0 min-h-screen overflow-hidden pb-24 md:pb-0">
        <PageHeader searchPlaceholder="Your results..." />
        <main className="flex-1 overflow-y-auto p-margin-desktop bg-background">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-on-surface-variant text-body-md mb-4">Your Result</p>
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#eaf1ff" strokeWidth="12" />
                  <circle
                    cx="80" cy="80" r="70"
                    fill="none"
                    stroke={finalResults.riskLevel === 'low' ? '#006c49' : finalResults.riskLevel === 'moderate' ? '#f59e0b' : '#ef4444'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(finalResults.overallScore / 100) * 440} 440`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-h1 font-bold text-on-surface">{finalResults.overallScore}</span>
                  <span className="text-on-surface-variant text-caption">/ 100</span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-label-md font-label-md mt-3 ${
                finalResults.riskLevel === 'low' ? 'bg-secondary-container text-on-secondary-container' :
                finalResults.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-900' : 'bg-error-container text-on-error-container'
              }`}>
                <span className="material-symbols-outlined text-[16px]">{finalResults.riskLevel === 'low' ? 'check_circle' : finalResults.riskLevel === 'moderate' ? 'warning' : 'dangerous'}</span>
                {finalResults.riskLevel.charAt(0).toUpperCase() + finalResults.riskLevel.slice(1)} Risk
              </div>
              <p className="text-on-surface-variant text-body-md mt-3 max-w-sm mx-auto">{finalResults.riskLabel}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/results')}
                className="flex-1 bg-surface-container text-on-surface font-label-md text-label-md px-6 py-3 rounded-lg transition-colors hover:bg-surface-container-high"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  setView('select');
                  setTestResults({});
                }}
                className="flex-1 bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg transition-colors hover:bg-primary/90"
              >
                Take Another Test
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
