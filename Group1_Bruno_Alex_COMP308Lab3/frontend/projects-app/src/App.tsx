import React, { useMemo, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";

const PROJECTS = gql`
  query ProjectsByUser {
    projectsByUser {
      id
      title
      description
      createdAt
    }
  }
`;

const FEATURES = gql`
  query FeatureRequests($projectId: ID!) {
    featureRequests(projectId: $projectId) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

const DRAFTS = gql`
  query DraftsByFeature($featureId: ID!) {
    draftsByFeature(featureId: $featureId) {
      id
      content
      version
      createdAt
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject($title: String!, $description: String!) {
    createProject(title: $title, description: $description) {
      id
      title
      description
      createdAt
    }
  }
`;

const ADD_FEATURE = gql`
  mutation AddFeature($projectId: ID!, $title: String!, $description: String!) {
    addFeatureRequest(projectId: $projectId, title: $title, description: $description) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

const SUBMIT_DRAFT = gql`
  mutation SubmitDraft($featureId: ID!, $content: String!) {
    submitDraft(featureId: $featureId, content: $content) {
      id
      content
      version
      createdAt
    }
  }
`;

const App: React.FC = () => {
  const { data, loading, refetch } = useQuery(PROJECTS);
  const [createProject] = useMutation(CREATE_PROJECT, { onCompleted: () => refetch() });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const projects = data?.projectsByUser ?? [];
  const selectedProject = useMemo(
    () => projects.find((p: any) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;
    await createProject({ variables: { title: projectTitle, description: projectDescription } });
    setProjectTitle("");
    setProjectDescription("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wider text-slate-500">Remote</p>
          <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-2">
            Create projects, add feature requests, and submit implementation drafts.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">New Project</h3>
              <form className="space-y-2" onSubmit={handleCreateProject}>
                <input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Title"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  rows={3}
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-slate-900 text-white py-2 text-sm hover:bg-slate-800"
                >
                  Create
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Your Projects</h3>
              {loading ? (
                <p className="text-sm text-slate-600">Loading...</p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-slate-600">No projects yet.</p>
              ) : (
                <ul className="space-y-2">
                  {projects.map((p: any) => (
                    <li key={p.id}>
                      <button
                        onClick={() => setSelectedProjectId(p.id)}
                        className={`w-full text-left rounded-md border px-3 py-2 text-sm ${
                          selectedProjectId === p.id
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-semibold">{p.title}</div>
                        <div className="text-xs text-slate-600">{p.description}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedProject ? (
              <ProjectDetail projectId={selectedProject.id} title={selectedProject.title} />
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
                Select a project to manage feature requests and drafts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectDetail: React.FC<{ projectId: string; title: string }> = ({ projectId, title }) => {
  const { data, loading, refetch } = useQuery(FEATURES, { variables: { projectId } });
  const [addFeature] = useMutation(ADD_FEATURE, { onCompleted: () => refetch() });
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  const features = data?.featureRequests ?? [];

  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    await addFeature({ variables: { projectId, title: featureTitle, description: featureDesc } });
    setFeatureTitle("");
    setFeatureDesc("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-slate-500">Project</p>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Add Feature Request</h3>
        <form className="grid md:grid-cols-3 gap-2" onSubmit={handleAddFeature}>
          <input
            value={featureTitle}
            onChange={(e) => setFeatureTitle(e.target.value)}
            placeholder="Feature title"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-1"
          />
          <input
            value={featureDesc}
            onChange={(e) => setFeatureDesc(e.target.value)}
            placeholder="Short description"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-1"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 text-white py-2 text-sm hover:bg-slate-800 md:col-span-1"
          >
            Add
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Feature Requests</h3>
          {loading ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : features.length === 0 ? (
            <p className="text-sm text-slate-600">No feature requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {features.map((f: any) => (
                <li key={f.id}>
                  <button
                    onClick={() => setSelectedFeatureId(f.id)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                      selectedFeatureId === f.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-xs text-slate-600">{f.description}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Status: {f.status}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Drafts</h3>
          {selectedFeatureId ? (
            <DraftSection featureId={selectedFeatureId} />
          ) : (
            <p className="text-sm text-slate-600">Select a feature to view drafts.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const DraftSection: React.FC<{ featureId: string }> = ({ featureId }) => {
  const { data, loading, refetch } = useQuery(DRAFTS, { variables: { featureId } });
  const [submitDraft] = useMutation(SUBMIT_DRAFT, { onCompleted: () => refetch() });
  const [content, setContent] = useState("");

  const drafts = data?.draftsByFeature ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitDraft({ variables: { featureId, content } });
    setContent("");
  };

  return (
    <div className="space-y-3">
      <form className="space-y-2" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Implementation notes or draft"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          rows={4}
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
        >
          Submit Draft
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-600">Loading drafts...</p>
      ) : drafts.length === 0 ? (
        <p className="text-sm text-slate-600">No drafts yet.</p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((d: any) => (
            <li key={d.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Version {d.version}</span>
                <span>{new Date(d.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-slate-800 whitespace-pre-wrap">{d.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
