type GraphQLContext = {
  req: {
    headers?: {
      cookie?: string;
    };
  };
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const projectsGraphql = async <T>(query: string, variables: Record<string, unknown>, cookie: string) => {
  const response = await fetch(process.env.PROJECTS_SUBGRAPH_URL || "http://localhost:4002/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message || "Projects service authorization check failed.");
  }

  return payload.data as T;
};

export const assertDraftAccess = async (draftId: string, context: GraphQLContext) => {
  if (draftId === "manual-draft" || draftId.startsWith("manual-draft-")) {
    return;
  }

  const cookie = context.req.headers?.cookie || "";
  if (!cookie) {
    throw new Error("Not authenticated.");
  }

  const projectsData = await projectsGraphql<{ projectsByUser: Array<{ id: string }> }>(
    `query AuthorizedProjects { projectsByUser { id } }`,
    {},
    cookie
  );

  for (const project of projectsData.projectsByUser) {
    const featuresData = await projectsGraphql<{ featureRequests: Array<{ id: string }> }>(
      `query AuthorizedFeatures($projectId: ID!) { featureRequests(projectId: $projectId) { id } }`,
      { projectId: project.id },
      cookie
    );

    for (const feature of featuresData.featureRequests) {
      const draftsData = await projectsGraphql<{ draftsByFeature: Array<{ id: string }> }>(
        `query AuthorizedDrafts($featureId: ID!) { draftsByFeature(featureId: $featureId) { id } }`,
        { featureId: feature.id },
        cookie
      );

      if (draftsData.draftsByFeature.some((draft) => draft.id === draftId)) {
        return;
      }
    }
  }

  throw new Error("Draft not found or unauthorized.");
};

