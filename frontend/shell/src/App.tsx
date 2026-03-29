import React, { createContext, useContext, useMemo, useState, Suspense } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  ApolloLink,
  split,
  gql,
  useMutation,
  useQuery,
} from "@apollo/client";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

const ProjectsApp = React.lazy(() => import("projectsApp/ProjectsApp"));
const AIReviewApp = React.lazy(() => import("aiReviewApp/AIReviewApp"));

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (u: string, e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      username
      email
      role
    }
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
      user {
        id
        username
        email
        role
      }
    }
  }
`;

const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      success
      message
      user {
        id
        username
        email
        role
      }
    }
  }
`;

const LOGOUT = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, loading, refetch } = useQuery(CURRENT_USER);
  const [loginMutate] = useMutation(LOGIN);
  const [registerMutate] = useMutation(REGISTER);
  const [logoutMutate] = useMutation(LOGOUT);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setPending(true);
    setError(null);
    try {
      await loginMutate({ variables: { email, password } });
      await refetch();
    } catch (e: any) {
      setError(e?.message || "Login failed");
      throw e;
    } finally {
      setPending(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setPending(true);
    setError(null);
    try {
      await registerMutate({ variables: { username, email, password } });
      await refetch();
    } catch (e: any) {
      setError(e?.message || "Registration failed");
      throw e;
    } finally {
      setPending(false);
    }
  };

  const logout = async () => {
    setPending(true);
    setError(null);
    try {
      await logoutMutate();
      await refetch();
    } catch (e: any) {
      setError(e?.message || "Logout failed");
      throw e;
    } finally {
      setPending(false);
    }
  };

  const value = useMemo(
    () => ({
      user: data?.currentUser ?? null,
      loading: loading || pending,
      login,
      register,
      logout,
      error,
      clearError: () => setError(null),
    }),
    [data, loading, pending, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
};

const NavBar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  return (
    <nav className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <span className="text-sm uppercase tracking-wider text-slate-500">Shell Host</span>
        <Link to="/" className="text-lg font-semibold text-slate-900">
          DevPilot 2026
        </Link>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/projects" className="text-slate-700 hover:text-slate-900">
          Projects
        </Link>
        <Link to="/ai-review" className="text-slate-700 hover:text-slate-900">
          AI Review
        </Link>
        {user ? (
          <>
            <span className="text-slate-600">Hi, {user.username}</span>
            <button
              onClick={logout}
              disabled={loading}
              className="px-3 py-1 rounded-md bg-slate-900 text-white text-xs"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="px-3 py-1 rounded-md bg-slate-900 text-white text-xs hover:bg-slate-800"
          >
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
};

const Home: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome to DevPilot</h1>
        <p className="text-slate-600 mt-2">
          Shell owns Apollo Client, auth state, and routes. Remotes load below via module federation.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
          <p className="font-semibold mb-2">Module Federation Remotes</p>
          <ul className="list-disc ml-5 text-sm text-slate-700 space-y-1">
            <li>projects-app (feature workflows)</li>
            <li>ai-review-app (AI review placeholder)</li>
          </ul>
        </div>
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
          <p className="font-semibold mb-2">Status</p>
          <p className="text-sm text-slate-700">
            Auth: {user ? `Signed in as ${user.email}` : "Not signed in"}
          </p>
        </div>
      </div>
    </div>
  );
};

const AuthPage: React.FC = () => {
  const { login, register, loading, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) return <Navigate to="/projects" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (mode === "login") {
      await login(email, password);
    } else {
      await register(username, email, password);
    }
    navigate("/projects");
  };

  return (
    <div className="max-w-md mx-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">
        {mode === "login" ? "Login" : "Register"}
      </h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div>
            <label className="block text-sm text-slate-600 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}
        <div>
          <label className="block text-sm text-slate-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 text-white py-2 text-sm hover:bg-slate-800"
        >
          {loading ? "Working..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
      {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
      <div className="text-sm text-slate-600 mt-4">
        {mode === "login" ? (
          <button className="text-blue-600" onClick={() => setMode("register")}>
            Need an account? Register
          </button>
        ) : (
          <button className="text-blue-600" onClick={() => setMode("login")}>
            Already registered? Login
          </button>
        )}
      </div>
    </div>
  );
};

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-slate-600">Loading...</p>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const ProjectsRoute: React.FC = () => (
  <Protected>
    <Suspense fallback={<p className="text-slate-600">Loading Projects...</p>}>
      <ProjectsApp />
    </Suspense>
  </Protected>
);

const AIReviewRoute: React.FC = () => (
  <Protected>
    <Suspense fallback={<p className="text-slate-600">Loading AI Review...</p>}>
      <AIReviewApp />
    </Suspense>
  </Protected>
);

const AppShell: React.FC = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-6xl mx-auto px-6 py-6">
      <NavBar />
      <main className="mt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/projects" element={<ProjectsRoute />} />
          <Route path="/ai-review" element={<AIReviewRoute />} />
        </Routes>
      </main>
    </div>
  </div>
);

const createApolloClient = () => {
  const gatewayLink = new HttpLink({
    uri: "http://localhost:4000/graphql",
    credentials: "include",
  });

  const authLink = new HttpLink({
    uri: "http://localhost:4001/graphql",
    credentials: "include",
  });

  const authOps = new Set(["Login", "Register", "Logout", "CurrentUser"]);

  const splitLink = split(
    ({ operationName }) => authOps.has(operationName || ""),
    authLink,
    gatewayLink
  );

  return new ApolloClient({
    link: ApolloLink.from([splitLink]),
    cache: new InMemoryCache(),
  });
};

const App: React.FC = () => {
  const client = useMemo(createApolloClient, []);

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
