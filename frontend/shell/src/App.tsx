import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen px-6 py-10">
      <header className="max-w-4xl mx-auto mb-8">
        <p className="text-sm uppercase tracking-wider text-slate-500">Shell Host</p>
        <h1 className="text-3xl font-semibold text-slate-900">DevPilot 2026 Shell</h1>
        <p className="text-slate-600 mt-2">
          Placeholder host app. Wire Apollo Client, auth state, and remote micro frontends here.
        </p>
      </header>
      <main className="max-w-4xl mx-auto space-y-4 text-slate-700">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
          <p className="font-semibold">Module Federation remotes</p>
          <ul className="list-disc ml-6 text-sm mt-2">
            <li>projects-app (feature workflows)</li>
            <li>ai-review-app (AI review placeholder)</li>
          </ul>
        </div>
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
          <p className="font-semibold">TODO</p>
          <ol className="list-decimal ml-6 text-sm mt-2 space-y-1">
            <li>Configure `vite.config.ts` with module federation host + remote URLs.</li>
            <li>Instantiate a single Apollo Client pointed at the gateway.</li>
            <li>Implement auth context using HTTP-only cookie sessions.</li>
            <li>Mount remote routes via React Router.</li>
          </ol>
        </div>
      </main>
    </div>
  );
};

export default App;
