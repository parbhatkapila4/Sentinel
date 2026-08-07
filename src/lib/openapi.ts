export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Sentinel API",
    version: "1.0.0",
    description: `# Sentinel API

A small read-oriented HTTP surface over your own workspace. Most of Sentinel's
mutations run as Next.js Server Actions rather than public REST endpoints, so
only the endpoints documented below are callable over HTTP.

## Authentication

Requests are authenticated with your **Clerk session cookie** - the same session
the web app uses. Calling these endpoints from a browser where you are signed in
works; there is no API token or Bearer credential to issue, and none is planned
on this surface yet.

## Rate limits

Enforced per user by \`src/lib/api-rate-limit.ts\` (defaults, overridable by env):

- \`GET /api/notifications\` - 100 requests/minute (\`RATE_LIMIT_USER_DEFAULT\`)
- \`POST /api/insights/chat\` - 20 requests/minute (\`RATE_LIMIT_USER_AI\`)

Exceeding a limit returns **429** with a \`Retry-After\` header. Rate limiting
fails open: if Redis is unavailable the request is allowed rather than dropped.

## Not available over HTTP

Deals, webhooks and team management have no public REST endpoints. Webhooks are
configured in Settings (server actions in \`src/app/actions/webhooks.ts\`); deal
reads and writes happen through the app.`,
    contact: {
      name: "Sentinel Support",
      email: "help@sentinels.in",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      description: "Current environment",
    },
  ],
  tags: [
    { name: "Insights", description: "AI assistant over your pipeline context" },
    { name: "Notifications", description: "Read your notifications" },
  ],
  paths: {
    "/api/insights/chat": {
      post: {
        tags: ["Insights"],
        summary: "AI chat",
        description:
          "Send a message to the AI assistant for pipeline insights. Runs scoped to your workspace.",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["messages"],
                properties: {
                  messages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        role: {
                          type: "string",
                          enum: ["user", "assistant"],
                        },
                        content: { type: "string" },
                      },
                    },
                  },
                },
              },
              example: {
                messages: [
                  {
                    role: "user",
                    content: "What deals need attention this week?",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "AI response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        content: { type: "string" },
                        taskType: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List notifications",
        description: "Retrieve notifications for the signed-in user.",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "unreadOnly",
            in: "query",
            description: "Return only unread notifications.",
            schema: { type: "boolean", default: false },
          },
          {
            name: "limit",
            in: "query",
            description: "Page size. Values above 100 are clamped to 100.",
            schema: { type: "integer", default: 20, maximum: 100 },
          },
          {
            name: "skip",
            in: "query",
            description: "Number of notifications to skip.",
            schema: { type: "integer", default: 0 },
          },
        ],
        responses: {
          "200": {
            description: "List of notifications",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        notifications: { type: "array", items: { type: "object" } },
                        unreadCount: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "__session",
        description:
          "Clerk session cookie, set when you sign in to the web app. There is no separate API token.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", description: "Human-readable message." },
          code: { type: "string", example: "UNAUTHORIZED" },
          requestId: {
            type: "string",
            nullable: true,
            description: "Correlates with server logs when present.",
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "No valid session cookie.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              success: false,
              error: "Unauthorized",
              code: "UNAUTHORIZED",
            },
          },
        },
      },
      RateLimited: {
        description:
          "Per-user rate limit exceeded. Includes a Retry-After header.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              success: false,
              error: "Rate limit exceeded",
              code: "RATE_LIMIT_EXCEEDED",
            },
          },
        },
      },
      InternalError: {
        description: "Unhandled server error.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              success: false,
              error: "Internal server error",
              code: "INTERNAL_ERROR",
            },
          },
        },
      },
    },
  },
};
