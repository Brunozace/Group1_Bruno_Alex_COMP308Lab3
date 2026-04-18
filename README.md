# DevPilot 2026 - AI Review Milestone

DevPilot 2026 is a federated MERN-style project management and AI review platform for COMP-308. The application uses a React micro frontend shell, Apollo Gateway, session-based authentication with HTTP-only cookies, MongoDB persistence, and an AI Review subgraph with a retrieval-augmented review pipeline.

## Architecture

### Frontend micro frontends

- `frontend/shell` - host app; owns Apollo Client, routing, auth state, and remote loading.
- `frontend/projects-app` - remote app for projects, feature requests, implementation drafts, and draft history.
- `frontend/ai-review-app` - remote app for selecting drafts, requesting AI reviews, and displaying structured results, citations, confidence, reflection, and history.

### Backend services

- `server/gateway` - Apollo Gateway exposing the single `http://localhost:4000/graphql` endpoint.
- `server/microservices/auth-service` - Auth subgraph for register, login, logout, and current user.
- `server/microservices/projects-service` - Projects subgraph for projects, features, and drafts.
- `server/microservices/ai-review-service` - AI Review subgraph for retrieval-grounded draft review and review history.

The old top-level `auth-service`, `projects-service`, and `gateway` folders are not used. The active backend source of truth is `server/`.

## Ports

- Shell: `5173`
- Projects remote: `5174`
- AI Review remote: `5175`
- Gateway: `4000`
- Auth service: `4001`
- Projects service: `4002`
- AI Review service: `4003`

## Environment Setup

MongoDB must be running locally before starting the backend.

Copy the example files if you want explicit local configuration:

```bash
copy server\gateway\.env.example server\gateway\.env
copy server\microservices\auth-service\.env.example server\microservices\auth-service\.env
copy server\microservices\projects-service\.env.example server\microservices\projects-service\.env
copy server\microservices\ai-review-service\.env.example server\microservices\ai-review-service\.env
```

All services must share the same values for:

- `SESSION_SECRET`
- `SESSION_COOKIE_NAME`
- `SESSION_STORE_URI`

The default local settings use `mongodb://127.0.0.1:27017/devpilot`.

## Install

From the repo root:

```bash
npm install
npm install --prefix server
```

## Run

Use separate terminals.

Backend:

```bash
cd server
npm run dev
```

Projects remote:

```bash
cd frontend/projects-app
npm run build
npm run preview -- --host localhost --port 5174 --strictPort
```

AI Review remote:

```bash
cd frontend/ai-review-app
npm run build
npm run preview -- --host localhost --port 5175 --strictPort
```

Shell:

```bash
cd frontend/shell
npm run dev -- --host --port 5173
```

Open the app at:

```text
http://localhost:5173
```

## AI Review Pipeline

The AI Review service runs a local agentic RAG-style pipeline:

1. Seeds 15 internal knowledge chunks into MongoDB on startup.
2. Generates deterministic hash embeddings for each knowledge chunk.
3. Stores embeddings in the `knowledgedocuments` collection.
4. Embeds the submitted draft.
5. Retrieves the most relevant chunks using cosine similarity.
6. Generates a structured review using retrieved citations.
7. Adds probabilistic confidence variation to demonstrate that AI review output is not deterministic.
8. Runs a reflection pass to detect missing or weak citation support.
9. Adjusts confidence when reflection finds unsupported claims.
10. Validates the final output with Zod before persistence.
11. Saves review history, citations, initial confidence, final confidence, reflection outcomes, and timestamps in MongoDB.

## MongoDB Collections

Expected collections include:

- `users`
- `sessions`
- `projects`
- `featurerequests`
- `drafts`
- `knowledgedocuments`
- `draftreviews`

## Demo Flow

1. Register or log in through the Shell.
2. Create a project.
3. Add a feature request.
4. Submit an implementation draft.
5. Open AI Review.
6. Select the project, feature, and draft.
7. Request an AI review.
8. Show the structured summary, issue cards, severity labels, suggestions, confidence, citations, reflection badges, and review history.
9. Refresh the browser to show session persistence.
10. Optionally open MongoDB Compass to show persisted users, sessions, knowledge documents, drafts, and draft reviews.

## Troubleshooting

- If the Shell is blank and the console says `remoteEntry.js 404`, rebuild and preview the corresponding remote on ports `5174` and `5175`.
- If requests fail with `POST http://localhost:4000/graphql net::ERR_CONNECTION_REFUSED`, the Gateway is not running.
- If the Gateway repeats `Gateway waiting for subgraphs...`, one of ports `4001`, `4002`, or `4003` is not running.
- If authenticated actions fail, confirm all services share the same session secret, cookie name, and session store URI.

