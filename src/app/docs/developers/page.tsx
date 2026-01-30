import Link from "next/link";

export default function DeveloperDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors -ml-76"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Link>
        </div>
      </div>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Developer Documentation
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Integrate Sentinel&apos;s AI-powered revenue intelligence into your
            applications.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-12">

          <div>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Link
                href="/api-docs"
                className="block p-6 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-blue-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">API Reference</h3>
                <p className="text-sm text-white/60">
                  Complete API documentation with interactive examples
                </p>
              </Link>

              <div className="p-6 rounded-2xl bg-[#1a1a1a] border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Webhooks</h3>
                <p className="text-sm text-white/60">
                  Real-time event notifications for your integrations
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Quick Start</h2>

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                1. Authentication
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                All API requests require authentication. Include your API token in
                the Authorization header:
              </p>
              <pre className="bg-[#0a0a0a] rounded-xl p-4 overflow-x-auto border border-white/10">
                <code className="text-green-400 text-sm">
                  {`curl -X GET "https://api.sentinel.dev/api/deals" \\
  -H "Authorization: Bearer your_api_token" \\
  -H "Content-Type: application/json"`}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">2. List Deals</h3>
              <pre className="bg-[#0a0a0a] rounded-xl p-4 overflow-x-auto border border-white/10">
                <code className="text-green-400 text-sm">
                  {`// Response
{
  "success": true,
  "data": [
    {
      "id": "clx123abc",
      "name": "Acme Corp",
      "stage": "negotiation",
      "value": 50000,
      "riskLevel": "Low",
      "riskScore": 0.25
    }
  ]
}`}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                3. Webhook Events
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Configure webhooks to receive real-time notifications:
              </p>
              <div className="bg-[#0a0a0a] rounded-xl p-4 overflow-x-auto border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-white/50">Event</th>
                      <th className="text-left py-2 text-white/50">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/70">
                    <tr className="border-b border-white/5">
                      <td className="py-2">
                        <code className="text-blue-400">deal.created</code>
                      </td>
                      <td className="py-2">New deal added to pipeline</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2">
                        <code className="text-blue-400">deal.stage_changed</code>
                      </td>
                      <td className="py-2">Deal moved to a different stage</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2">
                        <code className="text-blue-400">deal.at_risk</code>
                      </td>
                      <td className="py-2">Deal flagged as high risk</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2">
                        <code className="text-blue-400">deal.closed_won</code>
                      </td>
                      <td className="py-2">Deal successfully closed</td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        <code className="text-blue-400">deal.closed_lost</code>
                      </td>
                      <td className="py-2">Deal lost</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                4. Webhook Payload
              </h3>
              <pre className="bg-[#0a0a0a] rounded-xl p-4 overflow-x-auto border border-white/10">
                <code className="text-green-400 text-sm">
                  {`// Webhook payload example
{
  "id": "evt_abc123",
  "event": "deal.stage_changed",
  "timestamp": "2025-01-25T12:00:00Z",
  "data": {
    "id": "clx123abc",
    "name": "Acme Corp",
    "oldStage": "proposal",
    "newStage": "negotiation",
    "value": 50000
  }
}

// Verify webhook signature
const signature = req.headers["x-webhook-signature"];
const expectedSig = crypto
  .createHmac("sha256", webhookSecret)
  .update(JSON.stringify(payload))
  .digest("hex");

if (signature === expectedSig) {
  // Webhook is authentic
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
