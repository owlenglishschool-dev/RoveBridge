# WebMCP architecture

RoveBridge uses two related but separate MCP surfaces.

```text
ChatGPT in-app browser / WebMCP Chrome
                |
                | page-scoped site tools
                v
       document.modelContext
                |
                | Cloudflare Agents WebMCP adapter
                v
       POST /webmcp (same origin)
                |
                | website session -> user identity
                v
        RoveBridge MCP tool server
                |
                v
       private per-user knowledge store
```

The browser registers tools only while the RoveBridge page is open. The
production adapter first checks the website session, then bridges the same-origin
`/webmcp` endpoint under the `rovebridge.*` namespace.

The existing OAuth-protected Remote MCP endpoint remains separate. A remote MCP
installation does not automatically make tools available to a browser page, and
a website session is not treated as an MCP OAuth bearer token.

## Public and private boundaries

This repository contains the WebMCP integration, a safe runnable demonstration,
and the production browser adapter. It intentionally excludes the production
authentication implementation, database schema, conversation ingestion pipeline,
and private retrieval logic.

The public demo therefore uses three sample Connections stored in source code.
The production site uses the same agent-facing interaction pattern with data
scoped to the signed-in user.

