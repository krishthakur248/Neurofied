const contentTypeIcons = {
  video: '🎥',
  article: '📄',
  tip: '💡',
};

export default function ResourceCard({ resource, onView }) {
  const icon = contentTypeIcons[resource.content_type] || '📚';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-32 flex items-center justify-center">
        <div className="text-5xl">{icon}</div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          {resource.duration_minutes && (
            <span>⏱️ {resource.duration_minutes} min</span>
          )}
          {resource.reading_time_minutes && (
            <span>📖 {resource.reading_time_minutes} min read</span>
          )}
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
            {resource.category}
          </span>
        </div>

        <button
          onClick={onView}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
        >
          View Resource
        </button>
      </div>
    </div>
  );
}
