import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen px-6 py-10">
      <header className="max-w-3xl mx-auto mb-8">
        <p className="text-sm uppercase tracking-wider text-slate-500">Remote</p>
        <h1 className="text-3xl font-semibold text-slate-900">AI Review App</h1>
        <p className="text-slate-600 mt-2">
          Placeholder
        </p>
      </header>
      <main className="max-w-3xl mx-auto space-y-4 text-slate-700">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
          <p className="font-semibold">Future hooks</p>
          <ul className="list-disc ml-6 text-sm mt-2 space-y-1">
            <li>Upload draft context + tests</li>
            <li>Invoke AI review pipeline</li>
            <li>Display findings, severity, and suggested fixes</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default App;
