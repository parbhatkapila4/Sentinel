import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function DocsPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="fixed inset-0 bg-black text-white overflow-y-auto">
      <div className="border-b border-white/10 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
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
          <div className="flex items-center gap-4">
            <Link
              href="/api-docs"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              API Reference
            </Link>
            <Link
              href="/docs/developers"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Developer Docs
            </Link>
          </div>
        </div>
      </div>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Complete Documentation
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Everything you need to know about Sentinel, the revenue management
            platform that prevents deals from silently decaying in your pipeline.
            Learn how to turn your sales data into actionable insights and never
            lose a deal you didn&apos;t see coming.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-20">

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Welcome to Sentinel Documentation
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              This documentation is your complete guide to using Sentinel
              effectively. Whether you&apos;re a sales rep tracking your first
              deal or a revenue leader managing a complex pipeline, you&apos;ll
              find everything you need here to get the most out of the platform.
            </p>
            <p className="text-white/70 mb-6 leading-relaxed">
              Sentinel is designed to be intuitive, but mastering its features
              will help you prevent revenue loss and close more deals. This guide
              covers everything from basic setup to advanced risk analysis
              techniques. We&apos;ve organized it so you can jump to any section
              you need, or read it start to finish for a comprehensive
              understanding.
            </p>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-semibold text-white mb-3">
                How to Use This Documentation
              </h3>
              <p className="text-white/80 leading-relaxed mb-4">
                This documentation is structured to help you learn Sentinel
                progressively. If you&apos;re new, start with &quot;Getting
                Started&quot; and work your way through. If you&apos;re
                experienced, use the table of contents to jump to specific
                features or concepts you want to understand better.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                Each section includes practical examples and real-world scenarios
                to help you understand not just how features work, but when and
                why to use them. We&apos;ve also included best practices
                throughout, based on how successful teams use Sentinel.
              </p>
              <p className="text-white/80 leading-relaxed">
                <strong className="text-white">Quick tip:</strong> Bookmark this
                page and refer back to it as you use Sentinel. The more you use
                the platform, the more these concepts will make sense, and
                you&apos;ll discover new ways to leverage Sentinel&apos;s
                capabilities.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Key Features That Make Sentinel Different
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Sentinel isn&apos;t just another CRM. Here&apos;s what makes it
              special:
            </p>
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  🎯 AI-Powered Risk Scoring
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  Every deal in your pipeline gets a real-time risk score from 0
                  to 1. This isn&apos;t just a number, it&apos;s calculated based
                  on multiple data points: how long a deal has been in its current
                  stage, recent activity levels, historical patterns from similar
                  deals, and more.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Why this matters:</strong> You
                  can&apos;t fix what you don&apos;t see. Risk scores surface
                  problems before they become lost deals, giving you time to
                  intervene and save revenue.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  📊 Silent Decay Detection
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  Deals don&apos;t always fail dramatically. More often, they
                  just... fade away. A prospect stops responding to emails. A
                  meeting gets postponed repeatedly. A proposal sits unread. These
                  are all signs of silent decay.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">How Sentinel helps:</strong> By
                  tracking activity patterns and comparing them to historical
                  data, Sentinel identifies when a deal is quietly losing momentum
                  and alerts you before it&apos;s too late to recover.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  📅 Comprehensive Timeline Tracking
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  Every interaction, meeting, email, and milestone is tracked in
                  a chronological timeline. This isn&apos;t just for record-keeping, it&apos;s
                  the data that powers our risk analysis.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">The benefit:</strong> You get a
                  complete picture of each deal&apos;s journey, making it easier
                  to spot patterns, identify bottlenecks, and understand why
                  deals succeed or fail.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  📈 Revenue Forecasting & Analytics
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  Get AI-powered revenue forecasts based on your actual pipeline
                  data, not just wishful thinking. See pipeline value by stage,
                  track conversion rates, and understand where your revenue is
                  really coming from.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">What you get:</strong> Data-driven
                  insights that help you make better decisions about where to
                  focus your efforts, which deals need attention, and what your
                  actual revenue outlook is.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Getting Started: Your First 10 Minutes
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Let&apos;s get you up and running quickly. Sentinel is designed to
              be intuitive, but here&apos;s a step-by-step guide to make sure you
              hit the ground running.
            </p>
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Step 1: Create Your First Deal
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  Navigate to the <strong className="text-white">Deals</strong>{" "}
                  page and click the <strong className="text-white">New Deal</strong>{" "}
                  button. You&apos;ll see a form asking for:
                </p>
                <ul className="space-y-3 text-white/80 mb-4">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 font-bold">1.</span>
                    <div>
                      <strong className="text-white">Deal Name:</strong> Give it
                      a descriptive name that makes sense to you and your team.
                      Examples: &quot;Acme Corp Enterprise License Q1 2026&quot; or
                      &quot;TechStartup SaaS Subscription&quot;
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 font-bold">2.</span>
                    <div>
                      <strong className="text-white">Company:</strong> The
                      company or organization you&apos;re working with. This helps
                      us track patterns across multiple deals with the same
                      company.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 font-bold">3.</span>
                    <div>
                      <strong className="text-white">Value:</strong> The
                      estimated deal value in your preferred currency. Be honest
                      here, accurate values lead to better forecasts and risk
                      analysis.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 font-bold">4.</span>
                    <div>
                      <strong className="text-white">Stage:</strong> Where is
                      this deal in your pipeline? Choose from:
                      <ul className="mt-2 ml-4 space-y-1 text-white/70">
                        <li>• <strong>Discovery:</strong> Initial contact, still evaluating fit</li>
                        <li>• <strong>Qualification:</strong> Prospect is interested and qualified</li>
                        <li>• <strong>Proposal:</strong> You&apos;ve sent a proposal or quote</li>
                        <li>• <strong>Negotiation:</strong> Active discussions about terms</li>
                        <li>• <strong>Closed:</strong> Deal is won or lost</li>
                      </ul>
                    </div>
                  </li>
                </ul>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Pro tip:</strong> Don&apos;t
                  worry about getting everything perfect on the first try. You can
                  always edit deals later. The important thing is to start
                  tracking your pipeline.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Step 2: Add Your First Event
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  Once you&apos;ve created a deal, open it and add an event. This
                  could be a meeting you had, an email you sent, or a proposal you
                  delivered. Events are crucial because they feed into our risk
                  analysis, the more events you track, the smarter Sentinel
                  becomes.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Why this matters:</strong> A
                  deal with recent activity is different from a deal that&apos;s
                  been silent for weeks. By tracking events, you give Sentinel the
                  data it needs to identify when deals are at risk.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Step 3: Check Your Risk Overview
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  Navigate to the <strong className="text-white">Risk Overview</strong>{" "}
                  page to see how Sentinel is analyzing your pipeline. You&apos;ll
                  see deals categorized by risk level: High, Medium, and Low.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">What to look for:</strong> Pay
                  special attention to deals marked as High Risk. These are the
                  ones that need immediate attention. Sentinel is telling you
                  these deals are in danger, listen to it.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Understanding Your Pipeline: The Five Stages
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Sentinel uses a five-stage pipeline model that represents the
              typical journey from first contact to closed deal. Understanding
              each stage, and when deals should move between them, is key to
              getting accurate risk scores and actionable insights.
            </p>
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl font-bold text-blue-400">1</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Discovery
                    </h3>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      This is where it all begins. You&apos;ve made initial
                      contact with a prospect, and you&apos;re both evaluating
                      whether there&apos;s a fit. Deals in Discovery are still
                      being qualified, you&apos;re learning about their needs, they&apos;re
                      learning about your solution.
                    </p>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      <strong className="text-white">Typical activities:</strong>{" "}
                      Initial calls, discovery meetings, needs assessment,
                      qualification questions.
                    </p>
                    <p className="text-white/70 leading-relaxed">
                      <strong className="text-white">When to move forward:</strong>{" "}
                      When you&apos;ve confirmed there&apos;s a real opportunity
                      and the prospect has budget, authority, need, and timeline
                      (BANT).
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl font-bold text-blue-400">2</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Qualification
                    </h3>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      The prospect has shown genuine interest and meets your
                      qualification criteria. You&apos;re actively engaging with
                      them, they&apos;re responding to your outreach, and there&apos;s
                      momentum building. This is where deals either gain traction
                      or start to stall.
                    </p>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      <strong className="text-white">Typical activities:</strong>{" "}
                      Regular meetings, demos, technical discussions, stakeholder
                      introductions, proposal preparation.
                    </p>
                    <p className="text-white/70 leading-relaxed">
                      <strong className="text-white">When to move forward:</strong>{" "}
                      When the prospect is ready to see a formal proposal or
                      quote. They&apos;ve seen enough to make a decision.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl font-bold text-blue-400">3</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Proposal
                    </h3>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      You&apos;ve sent a formal proposal, quote, or contract. The
                      ball is in their court. This is often where deals go silent
                      if you&apos;re not careful, prospects need time to review, but
                      too much silence can mean they&apos;ve moved on.
                    </p>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      <strong className="text-white">Typical activities:</strong>{" "}
                      Proposal delivery, follow-up calls, answering questions,
                      addressing concerns, waiting for feedback.
                    </p>
                    <p className="text-white/70 leading-relaxed">
                      <strong className="text-white">When to move forward:</strong>{" "}
                      When they&apos;re ready to negotiate terms, pricing, or
                      contract details. They&apos;ve reviewed the proposal and want
                      to move forward.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl font-bold text-blue-400">4</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Negotiation
                    </h3>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      Active discussions about terms, pricing, implementation
                      timelines, and contract details. You&apos;re close, but this
                      stage can drag on if not managed well. Deals in Negotiation
                      are high-value but also high-risk, they&apos;re so close that
                      losing them hurts.
                    </p>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      <strong className="text-white">Typical activities:</strong>{" "}
                      Contract reviews, pricing discussions, legal negotiations,
                      implementation planning, final approvals.
                    </p>
                    <p className="text-white/70 leading-relaxed">
                      <strong className="text-white">When to move forward:</strong>{" "}
                      When all terms are agreed upon and the contract is ready to
                      be signed. The deal is won (or lost if negotiations break
                      down).
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl font-bold text-blue-400">5</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Closed
                    </h3>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      The deal is done, either won or lost. Closed deals are
                      valuable for historical analysis. They help Sentinel learn
                      patterns: what do successful deals look like? How long do
                      they typically take? What activities correlate with wins?
                    </p>
                    <p className="text-white/70 mb-3 leading-relaxed">
                      <strong className="text-white">Why this matters:</strong>{" "}
                      The more closed deals you have in Sentinel, the better our
                      risk analysis becomes. We learn from your history to predict
                      your future.
                    </p>
                    <p className="text-white/70 leading-relaxed">
                      <strong className="text-white">Best practice:</strong>{" "}
                      Always mark deals as Closed when they&apos;re done, whether
                      won or lost. This keeps your pipeline accurate and helps
                      Sentinel learn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Risk Analysis & Silent Decay Detection: How It Works
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              This is Sentinel&apos;s superpower. Our AI-powered risk analysis
              doesn&apos;t just look at one metric, it synthesizes multiple data
              points to give you a comprehensive view of deal health. Here&apos;s
              exactly how it works:
            </p>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-red-500/10 to-amber-500/10 rounded-xl p-6 border border-red-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">
                  The Risk Score: Your Early Warning System
                </h3>
                <p className="text-white/80 mb-4 leading-relaxed">
                  Every deal gets a risk score from 0.0 (lowest risk) to 1.0
                  (highest risk). This score is calculated in real-time based on
                  multiple factors:
                </p>
                <ul className="space-y-3 text-white/80 mb-4">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1 font-bold">•</span>
                    <div>
                      <strong className="text-white">Time in Stage:</strong>{" "}
                      How long has this deal been in its current stage? If a deal
                      has been in &quot;Proposal&quot; for 45 days and your average
                      time in that stage is 14 days, that&apos;s a red flag. Deals
                      that linger in stages longer than normal are at higher risk.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1 font-bold">•</span>
                    <div>
                      <strong className="text-white">Activity Level:</strong>{" "}
                      When was the last event added to this deal? A deal with no
                      activity in 3 weeks is very different from a deal with
                      activity yesterday. Lack of recent activity is one of the
                      strongest indicators of silent decay.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1 font-bold">•</span>
                    <div>
                      <strong className="text-white">Stage Velocity:</strong>{" "}
                      How quickly do deals typically move through each stage in
                      your pipeline? Sentinel learns your patterns. If a deal is
                      moving slower than your historical average, it gets flagged.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1 font-bold">•</span>
                    <div>
                      <strong className="text-white">Historical Patterns:</strong>{" "}
                      What do similar deals look like? Sentinel compares each deal
                      to your historical data. If deals with similar
                      characteristics typically fail at this stage, the risk score
                      increases.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1 font-bold">•</span>
                    <div>
                      <strong className="text-white">Event Frequency:</strong>{" "}
                      Not just whether events exist, but how frequently they
                      occur. A deal with regular, consistent activity is lower
                      risk than one with sporadic or declining activity.
                    </div>
                  </li>
                </ul>
                <p className="text-white/80 leading-relaxed">
                  <strong className="text-white">The magic:</strong> These
                  factors are weighted and combined to create a single risk score
                  that tells you, at a glance, which deals need attention. You
                  don&apos;t have to manually analyze each deal, Sentinel does it
                  for you.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Understanding Risk Levels
                </h3>
                <div className="space-y-4">
                  <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                        High Risk (0.7 - 1.0)
                      </span>
                      <span className="text-white font-medium">
                        Immediate Action Required
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed">
                      These deals are in serious danger. They&apos;ve been silent
                      too long, stuck in a stage too long, or showing patterns
                      that historically lead to failure. <strong className="text-white">Don&apos;t wait.</strong>{" "}
                      Reach out today. Review the timeline, identify what went
                      wrong, and take corrective action immediately. Early
                      intervention can save these deals.
                    </p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Medium Risk (0.4 - 0.7)
                      </span>
                      <span className="text-white font-medium">
                        Monitor Closely
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed">
                      These deals are showing warning signs but aren&apos;t in
                      immediate danger. They might be moving slower than normal,
                      or activity has decreased. Keep a close eye on them, add
                      events regularly, and consider proactive outreach to
                      maintain momentum.
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Low Risk (0.0 - 0.4)
                      </span>
                      <span className="text-white font-medium">
                        Progressing Normally
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed">
                      These deals are healthy. They&apos;re moving through stages
                      at expected rates, have regular activity, and show patterns
                      consistent with successful deals. Keep doing what you&apos;re
                      doing, but don&apos;t get complacent, continue tracking events
                      and maintaining momentum.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  What is Silent Decay?
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  Silent decay is when a deal slowly loses momentum without any
                  dramatic failure. The prospect doesn&apos;t say &quot;no&quot;, they
                  just stop responding. Meetings get postponed. Emails go
                  unanswered. The deal isn&apos;t dead, but it&apos;s not alive
                  either.
                </p>
                <p className="text-white/70 mb-4 leading-relaxed">
                  <strong className="text-white">The problem:</strong> By the
                  time you realize a deal has decayed, it&apos;s often too late to
                  recover. The prospect has moved on, found another solution, or
                  lost interest.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">How Sentinel detects it:</strong>{" "}
                  We look for patterns: decreasing event frequency, increasing
                  time between activities, deals stuck in stages longer than
                  normal. When these patterns emerge, Sentinel flags the deal as
                  at risk, giving you time to intervene before it&apos;s too late.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Events & Timeline: The Foundation of Risk Analysis
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Events are the building blocks of Sentinel&apos;s intelligence.
              Every meeting, email, call, and milestone you track feeds into our
              risk analysis. The more events you add, the smarter Sentinel
              becomes. Here&apos;s how to use events effectively:
            </p>
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Types of Events You Can Track
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                    <h4 className="font-semibold text-white mb-2">
                      📅 Meeting Scheduled
                    </h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Track upcoming meetings, calls, and demos. This shows
                      active engagement and forward momentum.
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                    <h4 className="font-semibold text-white mb-2">
                      📧 Email Sent
                    </h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Record important email communications. Regular email
                      activity indicates an engaged prospect.
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                    <h4 className="font-semibold text-white mb-2">
                      📄 Proposal Sent
                    </h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Mark when proposals or quotes are delivered. This is a
                      critical milestone that often precedes negotiation.
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                    <h4 className="font-semibold text-white mb-2">
                      ⚠️ Follow-up Required
                    </h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Set reminders for follow-up actions. These help you stay on
                      top of deals that need attention.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  The Timeline View: Your Deal&apos;s Story
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  Every deal has a timeline that shows all events in chronological
                  order. This isn&apos;t just a log, it&apos;s a story. You can see
                  the deal&apos;s journey from first contact to where it is now.
                </p>
                <p className="text-white/70 mb-4 leading-relaxed">
                  <strong className="text-white">What to look for:</strong>
                </p>
                <ul className="space-y-2 text-white/80 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Gaps in activity:</strong>{" "}
                      Long periods without events are warning signs. If you see a
                      3-week gap, that&apos;s when deals start to decay.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Activity patterns:</strong>{" "}
                      Are events becoming less frequent? That&apos;s a pattern
                      Sentinel uses to calculate risk.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Stage transitions:</strong>{" "}
                      When did the deal move to its current stage? How long has it
                      been there? This directly impacts risk scores.
                    </span>
                  </li>
                </ul>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Best practice:</strong> Add
                  events regularly, even for small interactions. A quick email
                  check-in is still an event. The more data Sentinel has, the
                  better it can help you.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Analytics & Reports: Turning Data Into Decisions
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Sentinel doesn&apos;t just track your deals, it helps you understand
              them. Our analytics give you insights into pipeline health, revenue
              potential, and where to focus your efforts. Here&apos;s what you can
              learn:
            </p>
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Pipeline Value by Stage
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  See the total value of all deals in your pipeline, broken down
                  by stage. This tells you where your revenue potential is
                  concentrated. Are most of your deals in Discovery (early stage)
                  or Negotiation (close to closing)? This helps you understand
                  your revenue timeline.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">What to watch for:</strong>{" "}
                  If too much value is stuck in one stage (especially Proposal or
                  Negotiation), that&apos;s a bottleneck. You might need to focus
                  on moving those deals forward.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  AI-Powered Revenue Forecast
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  Get realistic revenue forecasts based on your actual pipeline
                  data, historical close rates, and deal velocity. This isn&apos;t
                  wishful thinking, it&apos;s data-driven prediction.
                </p>
                <p className="text-white/70 mb-4 leading-relaxed">
                  <strong className="text-white">How it works:</strong>{" "}
                  Sentinel analyzes your historical data to understand:
                </p>
                <ul className="space-y-2 text-white/80 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>What percentage of deals in each stage typically close?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>How long do deals typically take to move through stages?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>What patterns correlate with successful deals?</span>
                  </li>
                </ul>
                <p className="text-white/70 leading-relaxed">
                  Using this data, Sentinel predicts your likely revenue based on
                  your current pipeline. The more deals you close (and mark as
                  Closed), the more accurate these forecasts become.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Risk Overview Dashboard
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  Get a comprehensive view of your pipeline health. See how many
                  deals are at High, Medium, and Low risk. This gives you a
                  quick snapshot of where problems might be developing.
                </p>
                <p className="text-white/70 mb-4 leading-relaxed">
                  <strong className="text-white">How to use it:</strong>{" "}
                  Start your day by checking the Risk Overview. Focus on High Risk
                  deals first, these need immediate attention. Then review Medium
                  Risk deals to prevent them from becoming High Risk.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">The goal:</strong>{" "}
                  Keep as many deals as possible in the Low Risk category. When
                  deals move to Medium or High Risk, that&apos;s your signal to
                  take action.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Real-World Use Cases: How Teams Use Sentinel
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Sentinel is used by revenue teams of all sizes. Here are some
              common scenarios where Sentinel makes a real difference:
            </p>
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Scenario 1: The &quot;Almost There&quot; Deal
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  <strong className="text-white">The situation:</strong>{" "}
                  You have a $50,000 deal in Negotiation. It&apos;s been there for
                  3 weeks. You sent the contract, but you haven&apos;t heard back.
                  Is it still alive? Should you follow up? Or wait?
                </p>
                <p className="text-white/70 mb-3 leading-relaxed">
                  <strong className="text-white">How Sentinel helps:</strong>{" "}
                  Sentinel calculates the risk score based on how long deals
                  typically stay in Negotiation (maybe your average is 10 days).
                  It sees no activity in 3 weeks. The risk score jumps to 0.85
                  (High Risk). Sentinel alerts you: this deal needs attention now.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">The outcome:</strong>{" "}
                  You reach out immediately, discover there was a concern you
                  didn&apos;t know about, address it, and close the deal. Without
                  Sentinel, you might have waited another week, and by then it
                  could have been too late.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Scenario 2: The Quiet Prospect
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  <strong className="text-white">The situation:</strong>{" "}
                  A prospect in Qualification was very engaged, regular meetings,
                  lots of questions, seemed interested. But it&apos;s been 2 weeks
                  since the last event. Are they just busy? Or have they lost
                  interest?
                </p>
                <p className="text-white/70 mb-3 leading-relaxed">
                  <strong className="text-white">How Sentinel helps:</strong>{" "}
                  Sentinel notices the activity pattern changed. This deal had
                  weekly meetings, but now there&apos;s been no activity for 2
                  weeks. The risk score increases to 0.65 (Medium Risk, trending
                  toward High). Sentinel flags it: something&apos;s changed.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">The outcome:</strong>{" "}
                  You send a thoughtful check-in email, discover they&apos;re
                  evaluating other options, and you&apos;re able to address their
                  concerns. You re-engage them and move the deal forward. Without
                  Sentinel, you might not have noticed the pattern change until
                  it was too late.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Scenario 3: Pipeline Health Check
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  <strong className="text-white">The situation:</strong>{" "}
                  End of quarter is approaching. You need to know: what&apos;s
                  your realistic revenue forecast? Which deals are actually
                  going to close? Where should you focus your efforts?
                </p>
                <p className="text-white/70 mb-3 leading-relaxed">
                  <strong className="text-white">How Sentinel helps:</strong>{" "}
                  You check the Risk Overview and see 5 High Risk deals, 12
                  Medium Risk deals, and 8 Low Risk deals. You focus on the High
                  Risk deals first, then the Medium Risk ones. The Revenue
                  Forecast shows your realistic closing potential based on
                  historical data.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">The outcome:</strong>{" "}
                  You have a clear action plan. You know which deals need
                  attention, you have a realistic revenue forecast, and you can
                  make data-driven decisions about where to invest your time. You
                  close more deals because you focused on the right ones.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Best Practices: Getting the Most Out of Sentinel
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Sentinel is powerful, but like any tool, you get out what you put
              in. Follow these best practices to maximize your results:
            </p>
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  1. Keep Your Pipeline Updated
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  Update deal stages as soon as they change. Don&apos;t let deals
                  sit in the wrong stage, this skews your risk analysis and
                  forecasts. If a deal moves from Proposal to Negotiation, update
                  it immediately.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Why it matters:</strong>{" "}
                  Accurate stage data is critical for risk scoring. A deal that&apos;s
                  been in &quot;Proposal&quot; for 30 days is very different from one
                  that&apos;s been in &quot;Negotiation&quot; for 30 days. Keep it
                  accurate.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  2. Add Events Religiously
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  Every interaction matters. Add events for meetings, emails,
                  calls, proposals, everything. The more events you track, the
                  better Sentinel understands your deals and the more accurate
                  your risk scores become.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Pro tip:</strong>{" "}
                  Make it a habit. After every call or meeting, immediately add
                  an event. Don&apos;t wait until the end of the week, you&apos;ll
                  forget details, and the data will be less accurate.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  3. Act on High-Risk Deals Immediately
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  When Sentinel flags a deal as High Risk, don&apos;t ignore it.
                  Don&apos;t wait. Don&apos;t think &quot;I&apos;ll get to it
                  later.&quot; High Risk means the deal is in danger right now.
                  Review the timeline, identify what went wrong, and take action
                  today.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">The math:</strong>{" "}
                  Early intervention has a much higher success rate than late
                  intervention. A deal that&apos;s been silent for 2 weeks is
                  easier to save than one that&apos;s been silent for 6 weeks.
                  Sentinel gives you early warning, use it.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  4. Review Analytics Weekly
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  Set aside time each week to review your Risk Overview and
                  Analytics. Look for patterns: Are certain stages becoming
                  bottlenecks? Are risk scores trending up? What does your
                  revenue forecast look like?
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">The benefit:</strong>{" "}
                  Regular reviews help you catch problems early and make
                  data-driven decisions about where to focus your efforts. Don&apos;t
                  just react to alerts, proactively manage your pipeline.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  5. Mark Deals as Closed (Won or Lost)
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  When a deal is done, mark it as Closed. Whether it&apos;s won
                  or lost, this data is valuable. It helps Sentinel learn your
                  patterns and improve risk analysis for future deals.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Why it matters:</strong>{" "}
                  The more closed deals you have in Sentinel, the smarter it
                  becomes. It learns what successful deals look like, how long
                  they take, what activities correlate with wins. This makes
                  future risk scores more accurate.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  6. Be Honest About Deal Values
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  Enter realistic deal values, not inflated ones. Accurate values
                  lead to accurate revenue forecasts and better decision-making.
                  If a deal is worth $10,000, don&apos;t enter it as $50,000 just
                  because you hope it&apos;ll grow.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">The impact:</strong>{" "}
                  Inflated pipeline values lead to unrealistic forecasts and poor
                  decisions. Be honest. If the deal grows, you can always update
                  the value later.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Common questions about Sentinel, answered:
            </p>
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  How accurate are the risk scores?
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Risk scores become more accurate as you add more data. The more
                  deals you track, the more events you add, and the more deals you
                  close (marking them as Closed), the better Sentinel understands
                  your patterns. Early on, risk scores are based on general
                  patterns. As you use Sentinel, they become personalized to
                  your specific sales process.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Do I need to add events for every single interaction?
                </h3>
                <p className="text-white/70 leading-relaxed">
                  You don&apos;t need to track every tiny interaction, but you
                  should track significant ones. A quick email acknowledgment
                  might not need an event, but a scheduled meeting, a proposal
                  sent, or an important call definitely should. The more events you
                  add, the better, but focus on meaningful interactions that
                  indicate deal progress or engagement.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  What if a deal is legitimately taking longer than normal?
                </h3>
                <p className="text-white/70 leading-relaxed">
                  That&apos;s fine! If a deal is taking longer but you&apos;re
                  still having regular activity (meetings, emails, etc.), the risk
                  score will reflect that. Regular activity, even if the deal is
                  moving slowly, keeps risk scores lower. It&apos;s when activity
                  stops that risk scores increase. Sentinel is looking for
                  patterns of decay, not just slow movement.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Can I customize the pipeline stages?
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Currently, Sentinel uses a standard five-stage pipeline
                  (Discovery, Qualification, Proposal, Negotiation, Closed) that
                  works for most sales processes. This standardization helps our
                  risk analysis work effectively. If you have specific needs or
                  use cases, we&apos;d love to hear about them, contact us at{" "}
                  <a
                    href="mailto:parbhat@parbhat.dev"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    parbhat@parbhat.dev
                  </a>
                  .
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  How does Sentinel compare to other CRM tools?
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Sentinel isn&apos;t trying to replace your CRM, it&apos;s
                  designed to work alongside it. While traditional CRMs focus on
                  tracking what happened, Sentinel focuses on predicting what will
                  happen. Our AI-powered risk analysis and silent decay detection
                  are unique features that help you prevent revenue loss before it
                  happens.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  What if I have questions or need help?
                </h3>
                <p className="text-white/70 leading-relaxed">
                  We&apos;re here to help! Reach out to us at{" "}
                  <a
                    href="mailto:parbhat@parbhat.dev"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    parbhat@parbhat.dev
                  </a>
                  . Whether you have questions about features, need help
                  understanding risk scores, or want to share feedback, we&apos;d
                  love to hear from you. This is a product built by a founder who
                  cares deeply about solving real problems, your feedback helps us
                  make Sentinel better.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Troubleshooting: Common Issues & Solutions
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Running into an issue? Here are solutions to common problems:
            </p>
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Risk Scores Not Updating
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  <strong className="text-white">Possible causes:</strong>
                </p>
                <ul className="space-y-2 text-white/80 mb-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>You haven&apos;t added any events recently, risk scores update based on activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Deal stages haven&apos;t been updated, make sure stages reflect current reality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>You don&apos;t have enough historical data yet, scores become more accurate over time</span>
                  </li>
                </ul>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Solution:</strong>{" "}
                  Add events regularly, keep stages updated, and give Sentinel
                  time to learn your patterns. The more you use it, the better it
                  gets.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Pipeline Value Seems Incorrect
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  <strong className="text-white">Possible causes:</strong>
                </p>
                <ul className="space-y-2 text-white/80 mb-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Closed deals are still being counted, make sure closed deals are marked as &quot;Closed&quot; stage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Deal values are incorrect, review and update deal values if needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Deals are in the wrong stages, verify stages are accurate</span>
                  </li>
                </ul>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Solution:</strong>{" "}
                  Review your pipeline, ensure closed deals are marked as
                  Closed, and verify deal values and stages are accurate. Pipeline
                  value is calculated by summing all non-closed deals.
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Revenue Forecasts Seem Unrealistic
                </h3>
                <p className="text-white/70 mb-3 leading-relaxed">
                  <strong className="text-white">Possible causes:</strong>
                </p>
                <ul className="space-y-2 text-white/80 mb-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>You don&apos;t have enough closed deals yet, forecasts improve as you close more deals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Deal values are inflated, be honest about deal values</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Historical patterns haven&apos;t been established, give it time to learn</span>
                  </li>
                </ul>
                <p className="text-white/70 leading-relaxed">
                  <strong className="text-white">Solution:</strong>{" "}
                  Forecasts become more accurate as you close more deals and
                  mark them as Closed. The more historical data Sentinel has, the
                  better it can predict future outcomes. Be patient, and make sure
                  you&apos;re marking deals as Closed when they&apos;re done.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          {user ? (
            <>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-white/60 mb-8">
                Start managing your deals and preventing silent decay today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/deals/new"
                  className="px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Create Your First Deal
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-4">
                Login Required
              </h2>
              <p className="text-white/60 mb-8">
                Please log in first to access the dashboard and start managing
                your deals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sign-in"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
