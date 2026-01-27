export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Sentinel API",
    version: "1.0.0",
    description: `# Sentinel API Documentation

Sentinel is an AI-powered revenue intelligence platform. This API allows you to:

- Manage deals and pipeline data
- Access AI-powered insights
- Configure webhooks and integrations
- Manage team members and permissions

## Authentication

All API requests require authentication using a Bearer token. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer your_api_token
\`\`\`

## Rate Limits

- 1000 requests per minute for standard endpoints
- 100 requests per minute for AI-powered endpoints

## Webhooks

Sentinel can send real-time notifications to your endpoints. See the Webhooks section for available events.`,
    contact: {
      name: "Sentinel Support",
      email: "support@sentinel.dev",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      description: "Current environment",
    },
  ],
  tags: [
    { name: "Deals", description: "Deal management endpoints" },
    { name: "Insights", description: "AI-powered insights and analytics" },
    { name: "Notifications", description: "Notification management" },
    { name: "Webhooks", description: "Webhook configuration" },
    { name: "Teams", description: "Team management" },
  ],
  paths: {
    "/api/deals": {
      get: {
        tags: ["Deals"],
        summary: "List all deals",
        description: "Retrieve all deals for the authenticated user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "stage",
            in: "query",
            description: "Filter by stage",
            schema: {
              type: "string",
              enum: [
                "lead",
                "qualified",
                "proposal",
                "negotiation",
                "closed_won",
                "closed_lost",
              ],
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Number of results to return",
            schema: { type: "integer", default: 50, maximum: 100 },
          },
        ],
        responses: {
          "200": {
            description: "List of deals",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Deal" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Deals"],
        summary: "Create a new deal",
        description: "Create a new deal in the pipeline",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDealRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Deal created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Deal" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/deals/{id}": {
      get: {
        tags: ["Deals"],
        summary: "Get deal by ID",
        description:
          "Retrieve a specific deal with full details including timeline and risk assessment",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Deal ID",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Deal details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/DealDetail" },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Deals"],
        summary: "Update deal",
        description: "Update deal properties including stage",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateDealRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Deal updated" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/insights/chat": {
      post: {
        tags: ["Insights"],
        summary: "AI Chat",
        description:
          "Send a message to the AI assistant for pipeline insights",
        security: [{ bearerAuth: [] }],
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
                    success: { type: "boolean" },
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
        },
      },
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get notifications",
        description: "Retrieve user notifications",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "unreadOnly",
            in: "query",
            schema: { type: "boolean", default: false },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
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
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        notifications: { type: "array" },
                        unreadCount: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/webhooks": {
      get: {
        tags: ["Webhooks"],
        summary: "List webhooks",
        description: "Get all configured webhooks",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of webhooks" },
        },
      },
      post: {
        tags: ["Webhooks"],
        summary: "Create webhook",
        description: "Configure a new webhook endpoint",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "url", "events"],
                properties: {
                  name: { type: "string", example: "My Webhook" },
                  url: {
                    type: "string",
                    format: "uri",
                    example: "https://example.com/webhook",
                  },
                  events: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "deal.created",
                        "deal.updated",
                        "deal.stage_changed",
                        "deal.at_risk",
                        "deal.closed_won",
                        "deal.closed_lost",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Webhook created" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Deal: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx123abc" },
          name: { type: "string", example: "Acme Corp Enterprise" },
          stage: { type: "string", example: "negotiation" },
          value: { type: "integer", example: 50000 },
          status: { type: "string", example: "active" },
          riskScore: { type: "number", example: 0.35 },
          riskLevel: {
            type: "string",
            enum: ["Low", "Medium", "High"],
          },
          createdAt: { type: "string", format: "date-time" },
          lastActivityAt: { type: "string", format: "date-time" },
        },
      },
      DealDetail: {
        allOf: [
          { $ref: "#/components/schemas/Deal" },
          {
            type: "object",
            properties: {
              primaryRiskReason: { type: "string", nullable: true },
              recommendedAction: {
                type: "object",
                nullable: true,
                properties: {
                  label: { type: "string" },
                  urgency: { type: "string" },
                },
              },
              timeline: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    eventType: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    metadata: { type: "object" },
                  },
                },
              },
              events: { type: "array" },
            },
          },
        ],
      },
      CreateDealRequest: {
        type: "object",
        required: ["name", "stage", "value"],
        properties: {
          name: { type: "string", example: "New Customer Deal" },
          stage: { type: "string", example: "lead" },
          value: { type: "integer", example: 25000 },
          location: { type: "string", example: "United States" },
        },
      },
      UpdateDealRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          stage: { type: "string" },
          value: { type: "integer" },
        },
      },
      WebhookEvent: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique event ID",
          },
          event: { type: "string", description: "Event type" },
          timestamp: { type: "string", format: "date-time" },
          data: { type: "object", description: "Event payload" },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Authentication required",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                error: { type: "string", example: "Unauthorized" },
              },
            },
          },
        },
      },
      BadRequest: {
        description: "Invalid request",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                error: { type: "string" },
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                },
              },
            },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                error: { type: "string", example: "Not found" },
              },
            },
          },
        },
      },
    },
  },
};
