type WebMcpInputSchema = Record<string, unknown>;

interface WebMcpClient {
  requestUserInteraction(callback: () => Promise<unknown>): Promise<unknown>;
}

interface WebMcpTool {
  name: string;
  description: string;
  inputSchema?: WebMcpInputSchema;
  annotations?: {
    readOnlyHint?: boolean;
  };
  execute(
    input: Record<string, unknown>,
    client: WebMcpClient,
  ): Promise<unknown>;
}

interface WebMcpModelContext {
  registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): void;
}

interface Document {
  modelContext?: WebMcpModelContext;
}

