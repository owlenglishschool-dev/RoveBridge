# RoveBridge — WebMCP

RoveBridge is a personal knowledge-expansion engine. It helps a person and an
agent connect one concrete idea from the person's history to an unfamiliar
concept from another field.

This public repository focuses only on the WebMCP integration created for the
OpenAI WebMCP Challenge. The production authentication, database, ingestion,
and private retrieval implementation are intentionally not included.

## Live project

**https://rovebridge.theappary.com/discover**

Open the URL inside ChatGPT's in-app browser or Google Chrome with WebMCP
enabled. A dedicated judge account is available; its credentials are supplied
privately in the Devpost testing instructions and are intentionally not stored
in this public repository.

### Judge test flow

1. Open the [WebMCP sign-in page](https://rovebridge.theappary.com/signin?surface=webmcp&returnTo=%2Fdiscover) in the WebMCP-capable browser.
2. Sign in with the judge credentials from the Devpost testing instructions.
3. Keep the `/discover` page open and confirm that it says **Site tools ready**.
4. Confirm that the browser's site-tool list includes `rovebridge.find_new_connection`.
5. Return to the adjacent ChatGPT conversation and ask:

> Find me a new connection.

6. Review the compact current-conversation summary when ChatGPT asks permission to share it with RoveBridge. The raw transcript is not required.
7. Follow the tool flow until ChatGPT presents and saves the complete Connection.
8. Optionally review the saved result at [Connections](https://rovebridge.theappary.com/account/connections).

The authenticated live app exposes seven WebMCP tools. The high-level entry
point is `rovebridge.find_new_connection`; the write step stores only an approved
compact anchor from the current conversation. WebMCP does not expose the legacy
past-chat import or profile-sync tools.

## What is included

- [`src/main.ts`](src/main.ts): a runnable, public WebMCP demonstration using
  safe sample knowledge and direct `document.modelContext.registerTool(...)`
  calls.
- [`src/production-adapter.ts`](src/production-adapter.ts): the browser adapter
  used by the production architecture. It verifies the website session and
  bridges the authenticated same-origin `/webmcp` MCP endpoint.
- [`docs/architecture.md`](docs/architecture.md): the WebMCP trust boundary and
  the separation between page-scoped WebMCP and Remote MCP.

The public demo exposes three tools:

| Tool | Purpose |
| --- | --- |
| `rovebridge.find_new_connection` | Return one surprising, sample-data Connection |
| `rovebridge.list_demo_connections` | List the safe anchors available in the demo |
| `rovebridge.record_demo_feedback` | Save distance feedback in local browser storage |

## Why WebMCP

Without WebMCP, an agent must interpret a visual page or use a separately
installed remote integration. WebMCP lets the open page declare structured,
typed actions to the browser agent while remaining the human-visible interface.

For RoveBridge, this is especially useful because the tools should exist only
inside the page where the user can see the authentication and data context. The
page remains understandable to a human while becoming directly actionable for
an agent.

## Run the public showcase

```sh
npm install
npm run dev
```

The page still renders in a normal browser, but tool registration requires a
WebMCP-capable client. A production build can be verified with:

```sh
npm run build
```

## Production integration

The live site does not send private knowledge to JavaScript as demo fixtures.
Instead, it uses Cloudflare's experimental `agents/experimental/webmcp` adapter:

```ts
const { registerWebMcp } = await import("agents/experimental/webmcp");

const handle = await registerWebMcp({
  url: "/webmcp",
  prefix: "rovebridge.",
  timeoutMs: 30_000,
  quiet: true,
});
```

The same-origin endpoint derives the user identity from the existing website
session. Authentication and conversation-sharing permission remain separate:
signing in does not authorize a transcript transfer. The OAuth-protected Remote
MCP endpoint remains separate.

## Privacy

The public showcase contains no user conversations, credentials, production
secrets, database identifiers, or private backend source. Its example
Connections are fictional demonstration data.

## License

[MIT](LICENSE)
