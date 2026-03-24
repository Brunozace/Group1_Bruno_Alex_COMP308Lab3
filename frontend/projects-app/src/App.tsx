import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen px-6 py-10">
      <header className="max-w-4xl mx-auto mb-8">
        <p className="text-sm uppercase tracking-wider text-slate-500">Remote</p>
        <h1 className="text-3xl font-semibold text-slate-900">Projects App</h1>
        <p className="text-slate-600 mt-2">
          Placeholder remote. Implement project CRUD, feature requests, and draft submissions here.
        </p>
      </header>
      <main className="max-w-4xl mx-auto space-y-3 text-slate-700">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
          <p className="font-semibold">TODO</p>
          <ol className="list-decimal ml-6 text-sm mt-2 space-y-1">
            <li>Use Apollo Client provided by Shell via module federation/shared deps.</li>
            <li>Build screens for create project, feature requests, and draft history.</li>
            <li>Enforce authorization using user info from session-aware gateway context.</li>
          </ol>
        </div>
      </main>
    </div>
  );
};

export default App;
