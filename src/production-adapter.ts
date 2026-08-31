import type { WebMcpHandle } from "agents/experimental/webmcp";

export type ConnectionState =
  | { status: "unsupported" }
  | { status: "signed_out" }
  | { status: "ready"; tools: readonly string[] };

type SessionResponse = { authenticated: boolean };
type WebMcpDocument = Document & {
  modelContext?: NonNullable<Navigator["modelContext"]>;
};

/**
 * The production RoveBridge site bridges its authenticated, same-origin MCP
 * endpoint into the page instead of placing private data in browser code.
 */
function normalizeWebMcpSurface(): boolean {
  if (navigator.modelContext) return true;
  const documentContext = (document as WebMcpDocument).modelContext;
  if (!documentContext) return false;

  try {
    Object.defineProperty(navigator, "modelContext", {
      configurable: true,
      value: documentContext,
    });
    return true;
  } catch {
    return false;
  }
}

export async function connectAuthenticatedRoveBridge(): Promise<{
  state: ConnectionState;
  handle: WebMcpHandle | null;
}> {
  if (!normalizeWebMcpSurface()) {
    return { state: { status: "unsupported" }, handle: null };
  }

  const response = await fetch("/api/session", { credentials: "include" });
  if (!response.ok) throw new Error(`Session check failed (${response.status})`);
  const session = (await response.json()) as SessionResponse;
  if (!session.authenticated) {
    return { state: { status: "signed_out" }, handle: null };
  }

  const { registerWebMcp } = await import("agents/experimental/webmcp");
  const handle = await registerWebMcp({
    url: "/webmcp",
    prefix: "rovebridge.",
    timeoutMs: 30_000,
    quiet: true,
  });

  if (handle.tools.length === 0) {
    await handle.dispose();
    throw new Error("RoveBridge connected, but no site tools were registered.");
  }

  return {
    state: { status: "ready", tools: handle.tools },
    handle,
  };
}

