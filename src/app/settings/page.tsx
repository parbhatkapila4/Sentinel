"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    riskAlerts: true,
    weeklyDigest: false,
    dealUpdates: true,
  });

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
    { id: "team", label: "Team", icon: "👥" },
    { id: "billing", label: "Billing", icon: "💳" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full" style={{ background: "#0a0a0f" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
            <p className="text-sm text-white/40">
              Manage your account and preferences
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            }}
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save Changes
          </button>
        </div>

        <div className="flex gap-8">
          <div className="w-56 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? "bg-violet-500/20 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div
              className="mt-6 rounded-2xl p-4"
              style={{
                background:
                  "linear-gradient(145deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.05) 100%)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                  RS
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Pro Plan</p>
                  <p className="text-xs text-white/40">42 / 500 deals</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                  style={{ width: "8.4%" }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <h3 className="text-lg font-semibold text-white mb-6">
                    Profile Information
                  </h3>

                  <div className="flex items-start gap-6 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                        RS
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
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
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Sentinel"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue="admin@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        defaultValue="Acme Corp"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                        Role
                      </label>
                      <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 transition-colors">
                        <option value="admin">Admin</option>
                        <option value="manager">Sales Manager</option>
                        <option value="rep">Sales Rep</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <h3 className="text-lg font-semibold text-white mb-6">
                    Security
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">
                          Password
                        </p>
                        <p className="text-xs text-white/40">
                          Last changed 30 days ago
                        </p>
                      </div>
                      <button className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                        Change
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">
                          Two-Factor Authentication
                        </p>
                        <p className="text-xs text-white/40">
                          Add an extra layer of security
                        </p>
                      </div>
                      <button className="px-4 py-2 rounded-xl text-sm font-medium bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(239,68,68,0.05) 0%, rgba(255,255,255,0.01) 100%)",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Danger Zone
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Delete Account
                      </p>
                      <p className="text-xs text-white/40">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-6">
                  Email Notifications
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      id: "emailAlerts",
                      title: "Email Alerts",
                      description: "Receive important alerts via email",
                    },
                    {
                      id: "riskAlerts",
                      title: "Risk Alerts",
                      description: "Get notified when deals become high-risk",
                    },
                    {
                      id: "weeklyDigest",
                      title: "Weekly Digest",
                      description: "Receive a weekly summary of your pipeline",
                    },
                    {
                      id: "dealUpdates",
                      title: "Deal Updates",
                      description: "Notifications when deals are updated",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-white/40">
                          {item.description}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications((prev) => ({
                            ...prev,
                            [item.id]:
                              !prev[item.id as keyof typeof notifications],
                          }))
                        }
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          notifications[item.id as keyof typeof notifications]
                            ? "bg-violet-500"
                            : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
                            notifications[item.id as keyof typeof notifications]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-6">
                  Connected Apps
                </h3>

                <div className="grid gap-4">
                  {[
                    {
                      name: "Salesforce",
                      description: "Sync deals and contacts",
                      connected: true,
                      icon: "☁️",
                    },
                    {
                      name: "HubSpot",
                      description: "CRM integration",
                      connected: false,
                      icon: "🔶",
                    },
                    {
                      name: "Slack",
                      description: "Get notifications in Slack",
                      connected: true,
                      icon: "💬",
                    },
                    {
                      name: "Google Calendar",
                      description: "Sync meetings and events",
                      connected: false,
                      icon: "📅",
                    },
                  ].map((app) => (
                    <div
                      key={app.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                          {app.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {app.name}
                          </p>
                          <p className="text-xs text-white/40">
                            {app.description}
                          </p>
                        </div>
                      </div>
                      {app.connected ? (
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Connected
                          </span>
                          <button className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                            Manage
                          </button>
                        </div>
                      ) : (
                        <button className="px-4 py-2 rounded-xl text-sm font-medium bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors">
                          Connect
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    Team Members
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Invite Member
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "John Smith",
                      email: "john@company.com",
                      role: "Admin",
                      avatar: "JS",
                    },
                    {
                      name: "Sarah Connor",
                      email: "sarah@company.com",
                      role: "Manager",
                      avatar: "SC",
                    },
                    {
                      name: "Mike Johnson",
                      email: "mike@company.com",
                      role: "Sales Rep",
                      avatar: "MJ",
                    },
                  ].map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {member.name}
                          </p>
                          <p className="text-xs text-white/40">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-white/40 px-3 py-1 rounded-lg bg-white/5">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <div
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.05) 100%)",
                    border: "1px solid rgba(139,92,246,0.2)",
                  }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold text-violet-400 bg-violet-500/20 mb-3">
                          Current Plan
                        </span>
                        <h3 className="text-2xl font-bold text-white">
                          Professional
                        </h3>
                        <p className="text-white/40 mt-1">
                          Perfect for growing sales teams
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white">$149</p>
                        <p className="text-sm text-white/40">/month</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {[
                        { label: "Deals", value: "42 / 500" },
                        { label: "Team Members", value: "3 / 10" },
                        { label: "API Calls", value: "5K / 50K" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="p-3 rounded-xl bg-white/5"
                        >
                          <p className="text-xs text-white/40 mb-1">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors">
                        Change Plan
                      </button>
                      <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors">
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <h3 className="text-lg font-semibold text-white mb-6">
                    Payment Method
                  </h3>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          VISA
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          •••• •••• •••• 4242
                        </p>
                        <p className="text-xs text-white/40">Expires 12/25</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                      Update
                    </button>
                  </div>

                  <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                    + Add new payment method
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
