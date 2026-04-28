const categoryIcons = {
  reaction: '⚡',
  memory: '🧠',
  attention: '👁️',
};

export default function TestCard({ test, onStart }) {
  const icon = categoryIcons[test.category] || '🧪';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
          {test.category}
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{test.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{test.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
        <span>⏱️ {test.duration_seconds} seconds</span>
      </div>

      <button
        onClick={onStart}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        Start Test →
      </button>
    </div>
  );
}
