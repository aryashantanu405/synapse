'use client';

const DashboardPage = () => {
  return (
    <div className="p-8 text-white h-full">
      <h1 className="text-3xl font-bold mb-8">Your Learning Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Placeholder Widget 1: Mistake Patterns */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-3 text-blue-400">Common Mistake Patterns</h2>
          <p className="text-slate-400">Coming soon: Visualize the types of errors you make most often and get targeted advice on how to improve.</p>
        </div>

        {/* Placeholder Widget 2: Strengths */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-3 text-green-400">Your Strengths</h2>
          <p className="text-slate-400">Coming soon: See which coding concepts you've mastered and track your progress toward new skills.</p>
        </div>

        {/* Placeholder Widget 3: Activity Heatmap */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-3 text-yellow-400">Activity Tracker</h2>
          <p className="text-slate-400">Coming soon: A heatmap of your coding sessions to help you build a consistent practice.</p>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;