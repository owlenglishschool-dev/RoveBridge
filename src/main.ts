import "./style.css";

type Interest = "learning" | "design" | "systems";
type Distance = "too_obvious" | "just_right" | "too_far";

type DemoConnection = {
  interest: Interest;
  title: string;
  anchor: string;
  externalConcept: string;
  explanation: string;
};

const connections: readonly DemoConnection[] = [
  {
    interest: "learning",
    title: "Learning schedules as ecological succession",
    anchor: "You were deciding how to sequence a difficult curriculum.",
    externalConcept: "Ecological succession",
    explanation:
      "A curriculum can be designed like a recovering ecosystem: early concepts change the environment so later, more specialized ideas can take root. The useful question becomes not only ‘What comes next?’ but ‘What conditions must this lesson create for what comes next?’",
  },
  {
    interest: "design",
    title: "Interface restraint as information foraging",
    anchor: "You wanted a product to offer one useful result instead of a feed.",
    externalConcept: "Information foraging theory",
    explanation:
      "Removing choices can increase the scent of the remaining path. A single, well-supported result tells the user where attention should go, while a feed transfers the cost of selection back to them.",
  },
  {
    interest: "systems",
    title: "Retrieval coverage as a detection problem",
    anchor: "You were evaluating whether a larger search index would improve discovery.",
    externalConcept: "Species detectability",
    explanation:
      "Ecologists distinguish abundance from detectability: not observing a species does not prove it is absent. Personal retrieval has the same trap. Before adding a stronger ranker, measure whether the ingestion process could have observed the missing knowledge at all.",
  },
];

const interestSchema = {
  type: "object",
  properties: {
    interest: {
      type: "string",
      enum: ["learning", "design", "systems"],
      description: "Optional area to use as the starting point.",
    },
  },
  additionalProperties: false,
} as const;

function chooseConnection(input: Record<string, unknown>): DemoConnection {
  const requested = input.interest;
  if (requested === "learning" || requested === "design" || requested === "systems") {
    return connections.find((item) => item.interest === requested) ?? connections[0];
  }
  return connections[Math.floor(Math.random() * connections.length)];
}

function asMarkdown(connection: DemoConnection): string {
  return `## ${connection.title}\n\n**Starting point:** ${connection.anchor}\n\n**Unexpected field:** ${connection.externalConcept}\n\n${connection.explanation}`;
}

function registerDemoTools(): number {
  const context = document.modelContext;
  if (!context) return 0;

  const controller = new AbortController();

  context.registerTool(
    {
      name: "rovebridge.find_new_connection",
      description:
        "Find one surprising connection between a sample personal-knowledge anchor and an unfamiliar external field. Use when the user asks RoveBridge to find a new connection.",
      inputSchema: interestSchema,
      annotations: { readOnlyHint: true },
      async execute(input) {
        return {
          connection: chooseConnection(input),
          note: "This public showcase uses sample data. The live RoveBridge site uses the signed-in user's private knowledge store.",
        };
      },
    },
    { signal: controller.signal },
  );

  context.registerTool(
    {
      name: "rovebridge.list_demo_connections",
      description: "List the safe sample anchors available in this public WebMCP showcase.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      async execute() {
        return connections.map(({ interest, title, anchor }) => ({ interest, title, anchor }));
      },
    },
    { signal: controller.signal },
  );

  context.registerTool(
    {
      name: "rovebridge.record_demo_feedback",
      description: "Record local-only feedback about the knowledge distance of a demo connection.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          distance: {
            type: "string",
            enum: ["too_obvious", "just_right", "too_far"],
          },
        },
        required: ["title", "distance"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      async execute(input) {
        const distance = input.distance as Distance;
        const validDistance = ["too_obvious", "just_right", "too_far"].includes(distance);
        if (typeof input.title !== "string" || !validDistance) {
          throw new Error("A title and valid distance are required.");
        }
        localStorage.setItem(
          "rovebridge-demo-feedback",
          JSON.stringify({ title: input.title, distance, recordedAt: new Date().toISOString() }),
        );
        return { recorded: true, storage: "local browser only" };
      },
    },
    { signal: controller.signal },
  );

  window.addEventListener("pagehide", () => controller.abort(), { once: true });
  return 3;
}

function updateStatus(toolCount: number) {
  const title = document.querySelector<HTMLElement>("#status-title");
  const copy = document.querySelector<HTMLElement>("#status-copy");
  const dot = document.querySelector<HTMLElement>("#status-dot");
  if (!title || !copy || !dot) return;

  if (toolCount > 0) {
    title.textContent = `Site tools ready (${toolCount})`;
    copy.textContent = "Keep this page open, then ask your agent to use the RoveBridge site tools.";
    dot.classList.add("ready");
    return;
  }

  title.textContent = "WebMCP is not available in this browser";
  copy.textContent = "Open this page in ChatGPT’s in-app browser or Chrome with WebMCP enabled.";
}

function showPreview() {
  const result = document.querySelector<HTMLElement>("#result");
  if (!result) return;
  const connection = chooseConnection({});
  result.hidden = false;
  result.innerHTML = `
    <p class="label">SAMPLE CONNECTION</p>
    <h2>${connection.title}</h2>
    <p><strong>Starting point:</strong> ${connection.anchor}</p>
    <p><strong>Unexpected field:</strong> ${connection.externalConcept}</p>
    <p>${connection.explanation}</p>
    <details><summary>Markdown returned to an agent</summary><pre>${asMarkdown(connection)}</pre></details>
  `;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

updateStatus(registerDemoTools());
document.querySelector("#demo-button")?.addEventListener("click", showPreview);

