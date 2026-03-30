# DevPilot 2026 – Lab 3 Milestone Skeleton

## Workspace Layout
- `gateway/` – Apollo Gateway exposing `/graphql` and federating the two subgraphs.
- `auth-service/` – Auth subgraph for session-based registration/login/logout/currentUser using Mongo-backed sessions.
- `projects-service/` – Projects subgraph for projects, feature requests, and drafts with authorization.
- `frontend/shell/` – Host micro frontend: owns Apollo Client, routing, auth state, and loads remotes.
- `frontend/projects-app/` – Remote micro frontend handling project workflows.
- `frontend/ai-review-app/` – Remote micro frontend placeholder for future AI review UI.

## Getting Started
1. Run `npm install` at the repo root to install all workspace dependencies (uses npm workspaces).
2. Copy each `.env.example` to `.env` inside gateway, auth-service, and projects-service, then fill in values.
3. Start MongoDB locally or via Docker before running backend services.
4. Start each backend service individually (`npm run dev` in `gateway`, `auth-service`, `projects-service`).
5. Start micro frontends (`npm run dev` in each frontend workspace); Shell will load remotes via module federation.

## Notes
- Tailwind CSS is configured for the frontends; customize tokens before building UI.
- TypeScript configs are present but contain no runtime code; implement resolvers, schemas, and UI screens as the next step.
- Session auth is intended to use HTTP-only cookies stored via `express-session` + `connect-mongo`; wire it up when implementing.
