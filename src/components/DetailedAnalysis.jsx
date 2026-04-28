export default function DetailedAnalysis({ result }) {
  const getRiskColor = (level) => {
    switch (level) {
      case 'low':
        return 'bg-green-50 border-green-500 text-green-900';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-500 text-yellow-900';
      case 'high':
        return 'bg-red-50 border-red-500 text-red-900';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-900';
    }
  };

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className={`p-6 rounded-lg border-2 ${getRiskColor(result.risk_level)}`}>
        <div className="text-center">
          <p className="text-sm font-semibold mb-2">Your Result</p>
          <div className="text-6xl font-bold mb-4">{result.score}</div>
          <div className="text-lg mb-4">
            <span className={`inline-block px-4 py-2 rounded-full font-semibold ${getRiskBadgeColor(result.risk_level)}`}>
              {result.risk_level.toUpperCase()} Risk
            </span>
          </div>
          <p className="text-sm opacity-75">Risk Score: {result.risk_score}</p>
        </div>
      </div>

      {/* AI Insights */}
      {result.ai_insights && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-bold text-lg mb-4">AI Analysis</h3>
          <p className="text-gray-700 mb-6">{result.ai_insights.interpretation}</p>

          {result.ai_insights.recommendations && result.ai_insights.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-purple-600">Recommendations:</h4>
              <ul className="space-y-2">
                {result.ai_insights.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.ai_insights.flags && result.ai_insights.flags.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-red-600">Flags:</h4>
              <ul className="space-y-2">
                {result.ai_insights.flags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-red-700 bg-red-50 p-2 rounded">
                    <span className="font-bold">⚠️</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Score Breakdown */}
      {result.raw_data && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-bold text-lg mb-4">Score Breakdown</h3>
          <div className="space-y-3">
            {result.raw_data.reaction_times && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Reaction Times Recorded</span>
                <span className="font-semibold">{result.raw_data.reaction_times.length}</span>
              </div>
            )}
            {result.raw_data.memory_errors !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Memory Errors</span>
                <span className="font-semibold">{result.raw_data.memory_errors}</span>
              </div>
            )}
            {result.raw_data.attention_errors !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Attention Errors</span>
                <span className="font-semibold">{result.raw_data.attention_errors}</span>
              </div>
            )}
            {result.raw_data.response_accuracy !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Response Accuracy</span>
                <span className="font-semibold">{(result.raw_data.response_accuracy * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
