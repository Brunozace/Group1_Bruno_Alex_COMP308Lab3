export const knowledgeDocuments = [
  {
    title: "Resolver Authorization Standard",
    category: "security",
    section: "Protected resolver ownership checks",
    chunkId: "SEC-RES-001",
    content:
      "Protected GraphQL resolvers must verify the active session before reading or mutating project data. Mutations must constrain access by owner, author, or project membership instead of trusting client supplied ids."
  },
  {
    title: "Session Cookie Security Guide",
    category: "security",
    section: "HTTP-only session handling",
    chunkId: "SEC-SES-002",
    content:
      "Session authentication must use HTTP-only cookies and server-side session storage. Frontends must not persist JWTs or session tokens in localStorage. Services that consume a session must use the same cookie name, secret, and shared session store."
  },
  {
    title: "GraphQL Input Validation Standard",
    category: "reliability",
    section: "Safe mutation inputs",
    chunkId: "GQL-VAL-003",
    content:
      "GraphQL mutations should validate required input length, expected enum values, and ownership before creating database records. Invalid input should fail safely with clear messages and without leaking internal implementation details."
  },
  {
    title: "GraphQL Resolver Design Guidelines",
    category: "architecture",
    section: "Resolver responsibilities",
    chunkId: "GQL-RES-004",
    content:
      "Resolvers should remain thin orchestration layers. They should delegate retrieval, validation, generation, and persistence to dedicated services so that behavior can be tested independently."
  },
  {
    title: "Apollo Federation Subgraph Notes",
    category: "architecture",
    section: "Gateway and subgraph contract",
    chunkId: "FED-SUB-005",
    content:
      "A federated subgraph must expose a stable GraphQL schema and be reachable by the Apollo Gateway during startup. Cookie headers should be forwarded from the gateway to subgraphs that enforce session-based authorization."
  },
  {
    title: "MongoDB Modeling Standard",
    category: "data",
    section: "Review persistence",
    chunkId: "DB-REV-006",
    content:
      "AI review results should persist the draft id, reviewer id, retrieved citations, issue severities, initial confidence, final confidence, reflection outcome, and timestamps so review history can be audited."
  },
  {
    title: "Implementation Draft Review Rubric",
    category: "quality",
    section: "Expected review output",
    chunkId: "REV-OUT-007",
    content:
      "A draft review must include a concise summary and structured issues. Each issue needs a type, severity, description, actionable suggestions, a confidence score, and citations that point to source documents and chunks."
  },
  {
    title: "Agentic RAG Pipeline Notes",
    category: "ai",
    section: "Retrieval generation reflection validation",
    chunkId: "RAG-PIPE-008",
    content:
      "The AI review workflow should run as a multi-step pipeline: retrieve relevant knowledge chunks, generate a structured review grounded in those chunks, perform reflection to detect weak claims, validate the output shape, and then persist the final result."
  },
  {
    title: "Reflection and Hallucination Checks",
    category: "ai",
    section: "Unsupported claim handling",
    chunkId: "RAG-REF-009",
    content:
      "Reflection should critique claims that lack citation support. Unsupported or weakly supported claims should be removed, revised, or assigned lower confidence. Citation changes must be recorded for transparency."
  },
  {
    title: "Error Handling Guidelines",
    category: "reliability",
    section: "Safe failures",
    chunkId: "ERR-SAFE-010",
    content:
      "Backend services should return safe errors and avoid saving malformed AI output. Frontend screens should render validation or network failures clearly rather than crashing or silently ignoring the problem."
  },
  {
    title: "Testing Expectations",
    category: "quality",
    section: "Verification requirements",
    chunkId: "TEST-VER-011",
    content:
      "Feature implementations should include a plan for unit tests, integration tests, or manual verification. Drafts should identify which resolver paths, authorization paths, and error paths need to be tested."
  },
  {
    title: "Frontend Composition Notes",
    category: "frontend",
    section: "Micro frontend responsibilities",
    chunkId: "UI-MFE-012",
    content:
      "The shell application should own routing, Apollo Client, and authentication state. Remote apps should receive Apollo context through composition and focus on their bounded feature UI."
  },
  {
    title: "Citation Display Standard",
    category: "frontend",
    section: "Grounding transparency",
    chunkId: "UI-CIT-013",
    content:
      "AI review interfaces should show retrieved source names, chunk or section identifiers, excerpts, and confidence indicators so users can understand what evidence grounded each recommendation."
  },
  {
    title: "Draft Versioning Guidelines",
    category: "data",
    section: "Implementation draft history",
    chunkId: "DB-DRF-014",
    content:
      "Implementation drafts should retain version numbers and timestamps. Review history should remain associated with the exact draft version that was reviewed."
  },
  {
    title: "Secure Database Query Notes",
    category: "security",
    section: "Scoped queries",
    chunkId: "SEC-DB-015",
    content:
      "Database queries that use client-provided identifiers should include ownership or membership filters. Fetching by id alone can expose records from another user or project."
  }
];

