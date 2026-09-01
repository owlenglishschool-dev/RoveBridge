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

## Current-conversation consent boundary

The WebMCP entry tool is read-only and receives no conversation content. It
returns a prompt instructing the ChatGPT host to recall one random or
diversity-weighted past conversation using its own conversation-memory
capability. ChatGPT—not the user—selects the episode and visibly summarizes it
in the current thread. The request to use RoveBridge is workflow context and is
rejected as an anchor.

The write schema requires `host_recalled_past_conversation` origin,
`random_or_diversity_weighted` selection, `displayed_in_current_chat=true`, an
episode description, concrete detail, summary, and substantive anchor. The
server applies a second quality gate to reject generic or padded
RoveBridge-invocation capsules. Before the write tool runs, the host must show
what will be shared and complete its permission step. Raw message arrays are not
accepted. Signing in proves identity but does not replace this data-sharing
permission.

The WebMCP surface intentionally omits the legacy past-conversation import and
profile-sync tools. Those tools remain available only through the separately
authorized Remote MCP surface for explicit legacy use.

## Public and private boundaries

This repository contains the WebMCP integration, a safe runnable demonstration,
and the production browser adapter. It intentionally excludes the production
authentication implementation, database schema, conversation ingestion pipeline,
and private retrieval logic.

The public demo therefore uses three sample Connections stored in source code.
The production site uses the same agent-facing interaction pattern with data
scoped to the signed-in user.
