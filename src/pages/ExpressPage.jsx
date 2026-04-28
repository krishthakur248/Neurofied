import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { insforgeClient } from '../lib/insforge';
import FloatingChatButton from '../components/FloatingChatButton';
import PageHeader from '../components/PageHeader';

export default function ExpressPage() {
  const { user } = useAuth();
  const [feeling, setFeeling] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const quickTips = [
    { id: 'forgetting', label: 'forgetting', icon: '🧠' },
    { id: 'confused', label: 'confused', icon: '😕' },
    { id: 'memory_issues', label: 'memory issues', icon: '📝' },
    { id: 'word_finding', label: 'word finding', icon: '💭' },
    { id: 'disoriented', label: 'disoriented', icon: '🌀' },
    { id: 'fatigued', label: 'fatigued', icon: '😴' },
  ];

  // Load user data on mount for context
  useEffect(() => {
    if (user) {
      loadUserContextData();
    }
  }, [user]);

  const loadUserContextData = async () => {
    try {
      // Get user progress for context
      const { data: progressData } = await insforgeClient
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get latest test results for additional context
      const { data: resultsData } = await insforgeClient
        .from('test_results')
        .select('score, risk_level, tests(name), created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setUserData({
        progress: progressData,
        recentResults: resultsData,
      });
    } catch (err) {
      console.error('Error loading user context:', err);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAnalyze = async () => {
    if (!feeling.trim()) {
      setError('Please describe how you\'re feeling');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Build context from user data and selected tags
      let context = `User's feeling description: "${feeling}"`;

      if (selectedTags.length > 0) {
        const tagLabels = selectedTags.map(id =>
          quickTips.find(t => t.id === id)?.label
        );
        context += `\nConcerns: ${tagLabels.join(', ')}`;
      }

      if (userData?.progress) {
        context += `\nUser has completed ${userData.progress.total_tests_completed} cognitive assessments with an average score of ${Math.round(userData.progress.average_score || 0)}.`;
      }

      if (userData?.recentResults?.length > 0) {
        const latestResult = userData.recentResults[0];
        context += `\nMost recent assessment (${latestResult.tests.name}): Score ${latestResult.score}, Risk Level: ${latestResult.risk_level}`;
      }

      // Call AI with context
      const GEMINI_API_KEY = "AIzaSyBqRMdcB30OCqo-gB4tOe1SLGNXM0LCCRg";
      const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

      const geminiPrompt = `System: You are Neurofied, a compassionate cognitive health advisor. Analyze the user's emotional and cognitive state based on their description and assessment history.

Return ONLY a valid JSON object matching this structure EXACTLY:
{
  "greeting": "A short, empathetic 2-3 sentence opening message.",
  "currentState": [
    { "aspect": "String (e.g. Cognitive Function)", "observation": "Your observation based on data" },
    { "aspect": "String (e.g. Emotional State)", "observation": "Your observation based on their input" }
  ],
  "contributingFactors": [
    "Factor 1 based on their input or history",
    "Factor 2..."
  ],
  "recommendations": [
    { "title": "Recommendation title", "description": "Specific advice" }
  ],
  "seekHelp": [
    "Red flag 1 when to seek professional help"
  ]
}

User Context:
${context}`;

      const aiResponse = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          generationConfig: {
            responseMimeType: "application/json",
          },
          contents: [{
            parts: [{
              text: geminiPrompt
            }]
          }]
        })
      });

      const aiData = await aiResponse.json();
      const analysisText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

      let parsedData = null;
      try {
        parsedData = JSON.parse(analysisText);
      } catch (e) {
        console.error("Failed to parse JSON", e);
      }

      if (parsedData) {
        setAnalysis({
          data: parsedData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tags: selectedTags,
        });
      } else {
        setError('Unable to generate analysis. Please try again.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze your feelings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:ml-64 min-h-screen bg-app-gradient pb-20 md:pb-8">
      <FloatingChatButton />

      {/* Header */}
      <PageHeader title="Express Yourself" searchPlaceholder="Search insights..." />

      {/* Title Section */}
      <div className="px-4 md:px-8 py-6 bg-white/50 border-b border-outline-variant/20">
        <h1 className="text-h3 font-h3 text-primary mb-1">Express Yourself</h1>
        <p className="text-body-md text-on-surface-variant">Tell us how you're feeling — AI does the rest.</p>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            {/* Textarea */}
            <div className="mb-6">
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="Describe how you're feeling..."
                className="w-full h-64 p-4 bg-surface-container-low rounded-xl border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none font-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-all"
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-body-sm text-on-surface-variant">Be honest — this stays private.</p>
                <span className="text-label-md text-on-surface-variant/60">
                  {feeling.length}/500
                </span>
              </div>
            </div>

            {/* Quick Tips Tags */}
            <div className="mb-6">
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wide mb-3">Quick Tips</p>
              <div className="flex flex-wrap gap-2">
                {quickTips.map((tip) => (
                  <button
                    key={tip.id}
                    onClick={() => toggleTag(tip.id)}
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-full border-2 transition-all font-body-md text-sm tap-highlight-transparent ${
                      selectedTags.includes(tip.id)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-transparent border-outline hover:border-primary/50 text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span>{tip.icon}</span>
                    <span>+ {tip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg">
                <p className="text-body-md text-error">{error}</p>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !feeling.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:from-on-surface-variant/30 disabled:to-on-surface-variant/20 disabled:cursor-not-allowed text-on-primary py-4 rounded-xl font-label-md text-label-md transition-all shadow-md hover:shadow-lg disabled:shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  <span>Get Insights</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-h4 font-h4 text-primary mb-1">Your Analysis</h2>
                  <p className="text-body-sm text-on-surface-variant">{analysis.timestamp}</p>
                </div>
                <span className="material-symbols-outlined text-primary text-[28px]">check_circle</span>
              </div>

              {/* Analysis Tags */}
              {analysis.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {analysis.tags.map(tagId => {
                    const tag = quickTips.find(t => t.id === tagId);
                    return (
                      <div
                        key={tagId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-body-sm"
                      >
                        <span>{tag?.icon}</span>
                        <span>{tag?.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Analysis Content */}
              <div className="space-y-8 mt-6">
                {/* Greeting */}
                <p className="text-body-lg text-on-surface leading-relaxed">
                  {analysis.data.greeting}
                </p>

                {/* Current State Table */}
                {analysis.data.currentState?.length > 0 && (
                  <div>
                    <h3 className="text-h5 font-h5 text-primary mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">health_metrics</span>
                      Current State Assessment
                    </h3>
                    <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-surface-container-highest/50">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-on-surface w-1/3 border-b border-outline-variant/30">Aspect</th>
                            <th className="px-4 py-3 font-semibold text-on-surface border-b border-outline-variant/30">Observation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          {analysis.data.currentState.map((item, idx) => (
                            <tr key={idx} className="hover:bg-surface-container-highest/20 transition-colors">
                              <td className="px-4 py-3 font-medium text-on-surface-variant align-top">{item.aspect}</td>
                              <td className="px-4 py-3 text-on-surface">{item.observation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Contributing Factors */}
                {analysis.data.contributingFactors?.length > 0 && (
                  <div>
                    <h3 className="text-h5 font-h5 text-primary mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">psychology</span>
                      Contributing Factors
                    </h3>
                    <ul className="space-y-2">
                      {analysis.data.contributingFactors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg">
                          <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">insights</span>
                          <span className="text-body-md text-on-surface">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.data.recommendations?.length > 0 && (
                  <div>
                    <h3 className="text-h5 font-h5 text-primary mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">lightbulb</span>
                      Personalized Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.data.recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-primary/5 border border-primary/20 p-4 rounded-xl hover:shadow-sm transition-shadow">
                          <h4 className="font-semibold text-primary mb-1">{rec.title}</h4>
                          <p className="text-sm text-on-surface-variant">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* When to Seek Help */}
                {analysis.data.seekHelp?.length > 0 && (
                  <div>
                    <h3 className="text-h5 font-h5 text-error mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">warning</span>
                      When to Seek Professional Help
                    </h3>
                    <div className="bg-error/5 border border-error/20 rounded-xl p-4">
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.data.seekHelp.map((flag, idx) => (
                          <li key={idx} className="text-sm text-error/90 leading-relaxed">{flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="mt-6 pt-6 border-t border-outline-variant">
                <p className="text-body-sm text-on-surface-variant/60 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">lock</span>
                  <span>This analysis is private and only visible to you.</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
