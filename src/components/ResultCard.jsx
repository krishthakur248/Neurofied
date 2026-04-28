export default function ResultCard({ result }) {
  const getRiskColor = (level) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border-l-4 border-purple-500">
      <h3 className="font-bold text-lg mb-2">{result.tests?.name}</h3>
      <p className="text-gray-600 text-sm mb-4">
        {new Date(result.completed_at).toLocaleDateString()} at{' '}
        {new Date(result.completed_at).toLocaleTimeString()}
      </p>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Score</span>
          <span className="text-2xl font-bold text-purple-600">{result.score}/100</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Risk Level</span>
          <span className={`font-semibold ${getRiskColor(result.risk_level)} capitalize`}>
            {result.risk_level}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Duration</span>
          <span className="text-sm">{result.duration_seconds} seconds</span>
        </div>
      </div>
    </div>
  );
}
