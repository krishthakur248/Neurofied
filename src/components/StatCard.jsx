export default function StatCard({ icon, percentage, value, title, subtitle }) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 text-white border border-white border-opacity-20">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{percentage || value}</div>
      <div className="font-semibold text-lg">{title}</div>
      <div className="text-sm text-purple-100">{subtitle}</div>
    </div>
  );
}
