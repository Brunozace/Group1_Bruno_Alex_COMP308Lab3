import React, { useMemo, useState } from "react";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import "./index.css";

type Project = {
  id: string;
  title: string;
  description: string;
};

type FeatureRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
};

type Draft = {
  id: string;
  content: string;
  version: number;
  createdAt: string;
};

type Citation = {
  documentName: string;
  category: string;
  section: string;
  chunkId: string;
  excerpt: string;
  relevanceScore: number;
};

type ReviewIssue = {
  type: string;
  severity: string;
  description: string;
  suggestions: string[];
  confidenceScore: number;
  citations: Citation[];
};

type DraftReview = {
  id: string;
  draftId: string;
  summary: string;
  initialConfidence: number;
  finalConfidence: number;
  overallConfidence: number;
  issues: ReviewIssue[];
  citations: Citation[];
  reflection: {
    changed: boolean;
    notes?: string;
    confidenceAdjusted: boolean;
    unsupportedClaims: string[];
    citationRevisions: string[];
  };
  createdAt: string;
};

const REVIEW_FIELDS = gql`
  fragment AiReviewFields on DraftReview {
    id
    draftId
    summary
    initialConfidence
    finalConfidence
    overallConfidence
    createdAt
    reflection {
      changed
      notes
      confidenceAdjusted
      unsupportedClaims
      citationRevisions
    }
    issues {
      type
      severity
      description
      suggestions
      confidenceScore
      citations {
        documentName
        category
        section
        chunkId
        excerpt
        relevanceScore
      }
    }
    citations {
      documentName
      category
      section
      chunkId
      excerpt
      relevanceScore
    }
  }
`;

const PROJECTS = gql`
  query AiReviewProjects {
    projectsByUser {
      id
      title
      description
    }
  }
`;

const FEATURES = gql`
  query AiReviewFeatures($projectId: ID!) {
    featureRequests(projectId: $projectId) {
      id
      title
      description
      status
    }
  }
`;

const DRAFTS = gql`
  query AiReviewDrafts($featureId: ID!) {
    draftsByFeature(featureId: $featureId) {
      id
      content
      version
      createdAt
    }
  }
`;

const REVIEW_HISTORY = gql`
  ${REVIEW_FIELDS}
  query AiReviewHistory($draftId: String!) {
    reviewsByDraft(draftId: $draftId) {
      ...AiReviewFields
    }
  }
`;

const REVIEW_DRAFT = gql`
  ${REVIEW_FIELDS}
  mutation AiReviewDraft($draftId: String!, $content: String!) {
    reviewDraft(draftId: $draftId, content: $content) {
      ...AiReviewFields
    }
  }
`;

const confidencePct = (value: number) => `${Math.round(value * 100)}%`;

const formatDraftDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No date saved" : date.toLocaleDateString();
};

const severityClass = (severity: string) => {
  const normalized = severity.toLowerCase();
  if (normalized === "high") return "border-red-300 bg-red-50 text-red-800";
  if (normalized === "medium") return "border-amber-300 bg-amber-50 text-amber-800";
  return "border-emerald-300 bg-emerald-50 text-emerald-800";
};

const App: React.FC = () => {
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useQuery(PROJECTS);
  const [loadFeatures, { data: featuresData, loading: featuresLoading }] = useLazyQuery(FEATURES);
  const [loadDrafts, { data: draftsData, loading: draftsLoading }] = useLazyQuery(DRAFTS);
  const [loadHistory, { data: historyData, loading: historyLoading, refetch: refetchHistory }] =
    useLazyQuery(REVIEW_HISTORY);
  const [reviewDraft, { loading: reviewing, error: reviewError }] = useMutation(REVIEW_DRAFT);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [activeReview, setActiveReview] = useState<DraftReview | null>(null);

  const projects: Project[] = projectsData?.projectsByUser ?? [];
  const features: FeatureRequest[] = featuresData?.featureRequests ?? [];
  const drafts: Draft[] = draftsData?.draftsByFeature ?? [];
  const history: DraftReview[] = historyData?.reviewsByDraft ?? [];

  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.id === selectedDraftId),
    [drafts, selectedDraftId]
  );

  const draftContent = selectedDraft?.content || manualContent;
  const draftId = selectedDraft?.id || "manual-draft";
  const canReview = Boolean(draftContent.trim()) && !reviewing;

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedFeatureId("");
    setSelectedDraftId("");
    setActiveReview(null);
    if (projectId) {
      await loadFeatures({ variables: { projectId } });
    }
  };

  const handleFeatureChange = async (featureId: string) => {
    setSelectedFeatureId(featureId);
    setSelectedDraftId("");
    setActiveReview(null);
    if (featureId) {
      await loadDrafts({ variables: { featureId } });
    }
  };

  const handleDraftChange = async (id: string) => {
    setSelectedDraftId(id);
    setActiveReview(null);
    if (id) {
      await loadHistory({ variables: { draftId: id } });
    }
  };

  const handleReview = async () => {
    if (!draftContent.trim()) return;

    try {
      const result = await reviewDraft({
        variables: {
          draftId,
          content: draftContent,
        },
      });

      const review = result.data?.reviewDraft as DraftReview | undefined;
      if (review) {
        setActiveReview(review);
        await loadHistory({ variables: { draftId: review.draftId } });
        await refetchHistory?.({ draftId: review.draftId });
      }
    } catch {
      // Apollo exposes the safe error through reviewError; avoid an unhandled promise rejection.
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#171717]">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <header className="mb-8 border-b border-[#d8d4c9] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#69735f]">
            AI Review
          </p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Draft review workspace</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#55514a]">
            Select an implementation draft, run the review pipeline, and inspect grounded issues,
            citations, confidence, and reflection notes.
          </p>
        </header>

        {projectsError && (
          <div className="mb-5 border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            Could not load project data. Confirm the gateway and all three subgraphs are running.
          </div>
        )}

        <main className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <section className="space-y-5">
            <Panel title="Submitted drafts">
              <label className="block text-sm font-semibold text-[#34312d]">Project</label>
              <select
                className="mt-2 w-full rounded-md border border-[#c7c1b4] bg-white px-3 py-2 text-sm"
                value={selectedProjectId}
                onChange={(event) => handleProjectChange(event.target.value)}
              >
                <option value="">{projectsLoading ? "Loading projects..." : "Choose a project"}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-sm font-semibold text-[#34312d]">Feature</label>
              <select
                className="mt-2 w-full rounded-md border border-[#c7c1b4] bg-white px-3 py-2 text-sm"
                value={selectedFeatureId}
                onChange={(event) => handleFeatureChange(event.target.value)}
                disabled={!selectedProjectId || featuresLoading}
              >
                <option value="">{featuresLoading ? "Loading features..." : "Choose a feature"}</option>
                {features.map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.title}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-sm font-semibold text-[#34312d]">Draft</label>
              <select
                className="mt-2 w-full rounded-md border border-[#c7c1b4] bg-white px-3 py-2 text-sm"
                value={selectedDraftId}
                onChange={(event) => handleDraftChange(event.target.value)}
                disabled={!selectedFeatureId || draftsLoading}
              >
                <option value="">{draftsLoading ? "Loading drafts..." : "Choose a draft"}</option>
                {drafts.map((draft) => (
                  <option key={draft.id} value={draft.id}>
                    Version {draft.version} - {formatDraftDate(draft.createdAt)}
                  </option>
                ))}
              </select>
            </Panel>

            <Panel title="Manual review input">
              <textarea
                className="min-h-44 w-full rounded-md border border-[#c7c1b4] bg-white px-3 py-2 text-sm leading-6"
                placeholder="Paste resolver logic, GraphQL schema notes, backend implementation details, or another draft for review."
                value={manualContent}
                onChange={(event) => {
                  setManualContent(event.target.value);
                  setSelectedDraftId("");
                  setActiveReview(null);
                }}
              />
              <p className="mt-2 text-xs text-[#6b665f]">
                Manual input is useful when a submitted draft is not available yet.
              </p>
            </Panel>

            <div className="rounded-md border border-[#d8d4c9] bg-[#fffdf8] p-4 shadow-sm">
              <button
                type="button"
                onClick={handleReview}
                disabled={!canReview}
                style={{
                  display: "block",
                  width: "100%",
                  border: 0,
                  borderRadius: "10px",
                  backgroundColor: canReview ? "#214f43" : "#8f9a92",
                  color: "#ffffff",
                  cursor: canReview ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  padding: "14px 18px",
                  textAlign: "center"
                }}
              >
                {reviewing ? "Running review..." : "Request AI review"}
              </button>
              {!draftContent.trim() && (
                <p className="mt-2 text-xs text-[#6b665f]">
                  Select a submitted draft or paste draft content to enable review.
                </p>
              )}
            </div>

            {reviewError && (
              <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                {reviewError.message}
              </div>
            )}
          </section>

          <section className="space-y-5">
            <Panel title="Draft under review">
              {draftContent ? (
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-[#24211d] p-4 text-sm leading-6 text-[#f7f6f2]">
                  {draftContent}
                </pre>
              ) : (
                <p className="text-sm text-[#6b665f]">
                  Select a submitted draft or paste draft content to start a review.
                </p>
              )}
            </Panel>

            {activeReview ? (
              <ReviewResult review={activeReview} />
            ) : (
              <Panel title="Review result">
                <p className="text-sm text-[#6b665f]">
                  The generated review will appear here with issues, suggestions, confidence, citations,
                  and reflection status.
                </p>
              </Panel>
            )}

            <Panel title="Review history">
              {historyLoading ? (
                <p className="text-sm text-[#6b665f]">Loading prior reviews...</p>
              ) : history.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {history.map((review) => (
                    <button
                      key={review.id}
                      onClick={() => setActiveReview(review)}
                      className="rounded-md border border-[#d8d4c9] bg-white p-3 text-left text-sm hover:border-[#2f6f5e]"
                    >
                      <span className="block font-semibold text-[#24211d]">
                        {confidencePct(review.finalConfidence)} final confidence
                      </span>
                      <span className="mt-1 block text-xs text-[#6b665f]">
                        {new Date(review.createdAt).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6b665f]">
                  Prior reviews will appear after the first review for this draft.
                </p>
              )}
            </Panel>
          </section>
        </main>
      </div>
    </div>
  );
};

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-md border border-[#d8d4c9] bg-[#fffdf8] p-5 shadow-sm">
    <h2 className="mb-4 text-base font-semibold text-[#24211d]">{title}</h2>
    {children}
  </section>
);

const ReviewResult: React.FC<{ review: DraftReview }> = ({ review }) => (
  <div className="space-y-5">
    <Panel title="Structured review">
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <p className="text-sm leading-6 text-[#34312d]">{review.summary}</p>
        <div className="rounded-md border border-[#c7c1b4] bg-white p-4">
          <span className="block text-xs font-semibold uppercase text-[#69735f]">Final confidence</span>
          <span className="mt-1 block text-3xl font-semibold text-[#2f6f5e]">
            {confidencePct(review.finalConfidence)}
          </span>
          <span className="mt-2 block text-xs text-[#6b665f]">
            Initial: {confidencePct(review.initialConfidence)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone={review.reflection.changed ? "amber" : "green"}>
          Reflection {review.reflection.changed ? "changed result" : "confirmed support"}
        </Badge>
        <Badge tone={review.reflection.confidenceAdjusted ? "amber" : "green"}>
          Confidence {review.reflection.confidenceAdjusted ? "adjusted" : "unchanged"}
        </Badge>
        <Badge tone="neutral">Validated response</Badge>
      </div>

      {review.reflection.notes && (
        <p className="mt-4 rounded-md bg-[#eef3ea] p-3 text-sm text-[#34312d]">
          {review.reflection.notes}
        </p>
      )}

      {(review.reflection.unsupportedClaims.length > 0 ||
        review.reflection.citationRevisions.length > 0) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ReflectionList title="Unsupported or weak claims" items={review.reflection.unsupportedClaims} />
          <ReflectionList title="Citation/confidence revisions" items={review.reflection.citationRevisions} />
        </div>
      )}
    </Panel>

    <Panel title={`Issues (${review.issues.length})`}>
      {review.issues.length ? (
        <div className="space-y-4">
          {review.issues.map((issue, index) => (
            <article key={`${issue.type}-${index}`} className="rounded-md border border-[#d8d4c9] bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${severityClass(issue.severity)}`}>
                  {issue.severity}
                </span>
                <Badge tone="neutral">{issue.type}</Badge>
                <span className="text-xs font-semibold text-[#6b665f]">
                  {confidencePct(issue.confidenceScore)} confidence
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#34312d]">{issue.description}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#34312d]">
                {issue.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
              <CitationList citations={issue.citations} compact />
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#6b665f]">No issues were returned for this draft.</p>
      )}
    </Panel>

    <Panel title="Retrieved citations">
      <p className="mb-3 text-sm text-[#6b665f]">
        These are the knowledge chunks retrieved by the vector search and used to ground the review.
      </p>
      <CitationList citations={review.citations} />
    </Panel>
  </div>
);

const ReflectionList: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="rounded-md border border-[#d8d4c9] bg-white p-3">
    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#69735f]">{title}</h3>
    {items.length ? (
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#34312d]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="mt-2 text-sm text-[#6b665f]">None flagged.</p>
    )}
  </div>
);

const CitationList: React.FC<{ citations: Citation[]; compact?: boolean }> = ({ citations, compact }) => {
  if (!citations.length) {
    return <p className="mt-3 text-sm text-[#6b665f]">No citations were attached.</p>;
  }

  return (
    <div className={`grid gap-3 ${compact ? "mt-3" : "md:grid-cols-2"}`}>
      {citations.map((citation) => (
        <div key={`${citation.documentName}-${citation.chunkId}`} className="rounded-md border border-[#d8d4c9] bg-[#fffdf8] p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#2f6f5e]">
            <span>{citation.documentName}</span>
            <span className="rounded-md bg-[#e7efe9] px-2 py-1 text-[#2f6f5e]">{citation.category}</span>
            <span className="rounded-md bg-[#eef3ea] px-2 py-1 text-[#34312d]">{citation.chunkId}</span>
            <span className="rounded-md bg-white px-2 py-1 text-[#6b665f]">
              {Math.round(citation.relevanceScore * 100)}% match
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-[#34312d]">{citation.section}</p>
          <p className="mt-2 text-xs leading-5 text-[#55514a]">{citation.excerpt}</p>
        </div>
      ))}
    </div>
  );
};

const Badge: React.FC<{ tone: "green" | "amber" | "neutral"; children: React.ReactNode }> = ({
  tone,
  children,
}) => {
  const classes = {
    green: "border-emerald-300 bg-emerald-50 text-emerald-800",
    amber: "border-amber-300 bg-amber-50 text-amber-800",
    neutral: "border-[#c7c1b4] bg-white text-[#34312d]",
  };

  return (
    <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${classes[tone]}`}>
      {children}
    </span>
  );
};

export default App;
