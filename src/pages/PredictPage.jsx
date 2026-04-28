import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { insforgeClient } from '../lib/insforge';
import FloatingChatButton from '../components/FloatingChatButton';
import PageHeader from '../components/PageHeader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

// ============================================================================
// 🧠 ML MODEL LOGIC
// ============================================================================
const MODEL_BIAS = -26.2512;
const MODEL_WEIGHTS = {
  age: 0.3164,
  gender: 0.0705,
  ethnicity: -0.0988,
  bmi: -0.0081,
  smoking: 6.2363,
  alcohol: 0.0058,
  physicalActivity: -1.5478,
  education: -2.0236,
  sleepHours: -0.0078,
  stressLevel: 0.8042,
  memoryComplaints: 13.0540,
  headaches: 0.0053,
  familyHistory: 9.0420,
};

const calculateRiskScore = (formData) => {
  const inputs = {
    age: Number(formData.age),
    gender: Number(formData.gender),
    ethnicity: Number(formData.ethnicity),
    bmi: Number(formData.bmi),
    smoking: formData.smoking ? 1 : 0,
    alcohol: Number(formData.alcohol),
    physicalActivity: Number(formData.physicalActivity),
    education: Number(formData.education),
    sleepHours: Number(formData.sleepHours),
    stressLevel: Number(formData.stressLevel),
    memoryComplaints: formData.memoryComplaints ? 1 : 0,
    headaches: formData.headaches ? 1 : 0,
    familyHistory: formData.familyHistory ? 1 : 0,
  };

  let logOdds = MODEL_BIAS;
  const chartData = [];

  for (const [key, value] of Object.entries(inputs)) {
    const featureWeight = MODEL_WEIGHTS[key] || 0;
    const contribution = value * featureWeight;
    logOdds += contribution;

    if (contribution !== 0) {
      chartData.push({
        feature: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        impact: Number(contribution.toFixed(4))
      });
    }
  }

  chartData.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  const probability = 1 / (1 + Math.exp(-logOdds));

  const score = Math.round(probability * 100);
  let riskLevel = 'Low';
  if (score > 60) riskLevel = 'High';
  else if (score > 35) riskLevel = 'Moderate';

  return {
    score,
    riskLevel,
    chartData: chartData
  };
};

// ============================================================================
// 📊 UI COMPONENT: FEATURE IMPACT CHART
// ============================================================================
const FeatureChart = ({ data }) => (
  <div className="w-full h-[400px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 140, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="feature"
          type="category"
          width={130}
          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          formatter={(value) => [value.toFixed(4), 'Impact']}
          contentStyle={{
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            backgroundColor: '#ffffff',
            padding: '8px 12px',
          }}
        />
        <ReferenceLine x={0} stroke="#cbd5e1" strokeDasharray="3 3" />
        <Bar dataKey="impact" barSize={18} radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#ef4444' : '#10b981'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// ============================================================================
// 📝 UI COMPONENT: PREDICTION FORM
// ============================================================================
const PredictionForm = ({ formData, handleChange, onSubmit, loading }) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
      {/* Column 1: Demographics & Health Metrics */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Demographics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" min="10" max="100" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
                <option value="0">Female</option>
                <option value="1">Male</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">favorite</span>
            Health Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">BMI</label>
              <input type="number" name="bmi" value={formData.bmi} onChange={handleChange} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" step="0.1" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">Sleep (hrs/night)</label>
              <input type="number" name="sleepHours" value={formData.sleepHours} onChange={handleChange} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" step="0.5" required />
            </div>
          </div>
        </div>
      </div>

      {/* Column 2: Lifestyle & Cognitive Status */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">directions_run</span>
            Lifestyle
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">Exercise (hrs/week)</label>
              <input type="number" name="physicalActivity" value={formData.physicalActivity} onChange={handleChange} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">Alcohol (units/week)</label>
              <input type="number" name="alcohol" value={formData.alcohol} onChange={handleChange} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" required />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">psychology</span>
            Cognitive Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-end">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">Stress Level (1-10)</label>
              <input type="number" name="stressLevel" value={formData.stressLevel} onChange={handleChange} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" min="1" max="10" required />
            </div>
            <div className="flex flex-col justify-end">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">Education</label>
              <select name="education" value={formData.education} onChange={handleChange} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
                <option value="0">High School</option>
                <option value="1">Bachelors</option>
                <option value="2">Masters or Higher</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Clinical Indicators & Ethnicity */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">assessment</span>
            Clinical Indicators
          </h3>
          <div className="space-y-3">
            {[
              { name: 'memoryComplaints', label: 'Memory Complaints' },
              { name: 'familyHistory', label: 'Family History of Decline' },
              { name: 'headaches', label: 'Frequent Headaches' },
              { name: 'smoking', label: 'Current Smoker' },
            ].map((field) => (
              <label key={field.name} className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container-highest transition-colors border border-outline hover:border-primary/30">
                <input type="checkbox" name={field.name} checked={formData[field.name]} onChange={handleChange} className="w-5 h-5 rounded border-outline text-primary focus:ring-primary/20 cursor-pointer" />
                <span className="text-sm font-medium text-on-surface">{field.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">Ethnicity</label>
          <select name="ethnicity" value={formData.ethnicity} onChange={handleChange} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm">
            <option value="0">Asian</option>
            <option value="1">Caucasian</option>
            <option value="2">African American</option>
            <option value="3">Hispanic</option>
            <option value="4">Other</option>
          </select>
        </div>
      </div>
    </div>

    {/* Full-width Elements */}
    <div className="mt-4 bg-surface-container-lowest p-4 rounded-xl border border-outline/20 shadow-sm">
      <p className="text-xs font-semibold text-on-surface mb-2">Cognitive Score ➔ Stress Level Mapping</p>
      <div className="flex w-full h-10 rounded-lg overflow-hidden border border-outline/20">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => {
            const maxScore = level === 1 ? 100 : 100 - (level - 1) * 10;
            const minScore = level === 10 ? 0 : 100 - level * 10 + 1;
            const textClass = level >= 8 ? 'text-error' : level >= 4 ? 'text-yellow-700' : 'text-success';
            const bgColor = level >= 8 ? 'bg-error/10' : level >= 4 ? 'bg-yellow-500/10' : 'bg-success/10';
            return (
              <div key={level} className={`flex-1 flex flex-col items-center justify-center border-r last:border-0 border-outline/10 ${bgColor} ${textClass}`}>
                <span className="text-xs font-bold leading-none">{level}</span>
                <span className="text-[9px] leading-none mt-1 font-medium">{minScore}-{maxScore}</span>
              </div>
            );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-on-surface-variant mt-1.5 px-1 font-medium">
        <span>Low Stress (High Score)</span>
        <span>High Stress (Low Score)</span>
      </div>
    </div>

    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:from-on-surface-variant/30 disabled:to-on-surface-variant/20 disabled:cursor-not-allowed text-on-primary py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:shadow-sm">
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Analyzing Risk...</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[20px]">health_metrics</span>
          <span>Run Risk Assessment</span>
        </>
      )}
    </button>
  </form>
);

// ============================================================================
// 🎯 MAIN PREDICT PAGE COMPONENT
// ============================================================================
export default function PredictPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    age: 65,
    gender: '1',
    ethnicity: '0',
    bmi: 24,
    smoking: false,
    alcohol: 2,
    physicalActivity: 3,
    education: '1',
    sleepHours: 7,
    stressLevel: 5,
    memoryComplaints: false,
    headaches: false,
    familyHistory: false,
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userProgress, setUserProgress] = useState(null);

  // Load user's cognitive score on mount
  useEffect(() => {
    if (user) {
      loadUserCognitiveData();
    }
  }, [user]);

  const loadUserCognitiveData = async () => {
    try {
      const { data } = await insforgeClient
        .from('user_progress')
        .select('average_score, latest_risk_level')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserProgress(data);
        // Convert cognitive performance score to stress level (INVERSE relationship)
        // HIGH cognitive score (healthy brain) = LOW stress level
        // LOW cognitive score (unhealthy brain) = HIGH stress level
        // Formula: stress = (100 - cognitiveScore) / 10, bounded between 1-10
        const cognitiveScore = data.average_score || 0;
        const stressLevel = Math.max(1, Math.min(10, Math.round((100 - cognitiveScore) / 10)));

        setFormData((prev) => ({
          ...prev,
          stressLevel,
        }));
      }
    } catch (err) {
      console.error('Error loading user cognitive data:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePredict = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = calculateRiskScore(formData);
      setResults(result);
    } catch (err) {
      console.error('Error calculating risk:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:ml-64 ml-0 min-h-screen bg-app-gradient pb-20 md:pb-8">
      <FloatingChatButton />

      {/* Header */}
      <PageHeader title="Predict Risk" searchPlaceholder="Search assessments..." />

      {/* Title Section */}
      <div className="px-4 md:px-8 py-6 bg-white/50 border-b border-outline-variant/20">
        <h1 className="text-h3 font-h3 text-primary mb-1">Risk Prediction</h1>
        <p className="text-body-md text-on-surface-variant">Advanced ML-based cognitive decline risk assessment</p>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-h5 font-h5 text-on-surface">Patient Information</h2>
                <p className="text-body-sm text-on-surface-variant mt-1 mb-6">
                  Stress level auto-filled from your cognitive game performance (inverse relationship)
                </p>
              <PredictionForm
                formData={formData}
                handleChange={handleChange}
                onSubmit={handlePredict}
                loading={loading}
              />
            </div>

            {/* Results Section */}
            <div>
              {results ? (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 animate-fade-in">
                  {/* Risk Score Display */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-h5 font-h5 text-on-surface">Risk Assessment Result</h2>
                        <p className="text-body-sm text-on-surface-variant mt-1">Explainable AI Model Analysis</p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          results.riskLevel === 'High'
                            ? 'bg-error/10 text-error'
                            : results.riskLevel === 'Moderate'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                        }`}
                      >
                        {results.riskLevel} Risk
                      </div>
                    </div>

                    {/* Risk Score Gauge */}
                    <div className={`rounded-2xl p-6 text-center mb-6 ${
                      results.riskLevel === 'High'
                        ? 'bg-error/10 border border-error/20'
                        : results.riskLevel === 'Moderate'
                          ? 'bg-warning/10 border border-warning/20'
                          : 'bg-success/10 border border-success/20'
                    }`}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                        results.riskLevel === 'High'
                          ? 'text-error'
                          : results.riskLevel === 'Moderate'
                            ? 'text-warning'
                            : 'text-success'
                      }`}>
                        Predicted Risk Probability
                      </p>
                      <div className={`text-5xl font-black ${
                        results.riskLevel === 'High'
                          ? 'text-error'
                          : results.riskLevel === 'Moderate'
                            ? 'text-warning'
                            : 'text-success'
                      }`}>
                        {results.score}%
                      </div>
                    </div>

                    {/* Risk Interpretation */}
                    <div className="bg-surface-container-low rounded-lg p-4 mb-6">
                      <p className="text-sm text-on-surface">
                        {results.riskLevel === 'High'
                          ? '⚠️ High cognitive decline risk detected. Consider consulting a healthcare professional.'
                          : results.riskLevel === 'Moderate'
                            ? '⚡ Moderate risk level. Monitor cognitive health and maintain healthy lifestyle habits.'
                            : '✅ Low risk level. Continue healthy cognitive habits and regular assessments.'}
                      </p>
                    </div>
                  </div>

                  {/* Feature Impact Chart */}
                  <div className="border-t border-outline-variant pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-on-surface">Feature Impact Analysis</h3>
                      <div className="flex gap-4 text-xs font-medium text-on-surface-variant">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-success rounded-full"></span>
                          Protective
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-error rounded-full"></span>
                          Risk Factor
                        </span>
                      </div>
                    </div>
                    <FeatureChart data={results.chartData} />
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-6 pt-6 border-t border-outline-variant">
                    <p className="text-xs text-on-surface-variant/60 flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">info</span>
                      <span>This is an educational tool using logistic regression. Not a medical diagnostic tool. Consult healthcare professionals for medical advice.</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 h-full flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-primary/20 mb-4">assessment</span>
                  <p className="text-center text-on-surface-variant font-medium">
                    Complete the form and click "Run Risk Assessment" to see results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
