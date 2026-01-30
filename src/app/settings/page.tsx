"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getAllDeals } from "@/app/actions/deals";
import { getMyTeams } from "@/app/actions/teams";
import { getUserProfile, updateUserProfile, inviteUserByEmail } from "@/app/actions/user";
import {
  getMyNotificationSettings,
  updateMyNotificationSettings,
} from "@/app/actions/notifications";
import {
  getMyRiskSettings,
  updateMyRiskSettings,
} from "@/app/actions/risk-settings";
import {
  getAllIntegrationStatuses,
  getIntegrationLogs,
  type AllIntegrationStatuses,
  type IntegrationLogEntry,
} from "@/app/actions/integrations";
import {
  connectSalesforce,
  disconnectSalesforce,
  syncSalesforceDeals,
  updateSalesforceSettings,
} from "@/app/actions/salesforce";
import {
  connectHubSpot,
  disconnectHubSpot,
  syncHubSpotDeals,
  updateHubSpotSettings,
} from "@/app/actions/hubspot";
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  syncCalendarEvents,
  updateGoogleCalendarSettings,
} from "@/app/actions/google-calendar";
import {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
} from "@/app/actions/payment-methods";
import { getCurrentUserPlan, type UserPlanInfo } from "@/app/actions/plans";
import { CARD_BRANDS, type PaymentMethodItem } from "@/lib/payment-methods";
import { formatRelativeTime } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { openUserProfile } = useClerk();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    riskAlerts: true,
    weeklyDigest: false,
    dealUpdates: true,
  });
  const [dealsCount, setDealsCount] = useState(0);
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    email: "",
    company: "",
    role: "admin",
    imageUrl: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [integrationStatuses, setIntegrationStatuses] = useState<AllIntegrationStatuses | null>(null);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState<"salesforce" | "hubspot" | "google_calendar" | null>(null);
  const [showManageModal, setShowManageModal] = useState<"salesforce" | "hubspot" | "googleCalendar" | null>(null);
  const [connectingIntegration, setConnectingIntegration] = useState<string | null>(null);
  const [syncingIntegration, setSyncingIntegration] = useState<string | null>(null);
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLogEntry[]>([]);
  const [salesforceForm, setSalesforceForm] = useState({ apiKey: "", instanceUrl: "" });
  const [hubspotForm, setHubspotForm] = useState({ apiKey: "" });
  const [googleCalendarForm, setGoogleCalendarForm] = useState({ apiKey: "", calendarId: "" });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [riskSettings, setRiskSettings] = useState({
    inactivityThresholdDays: 7,
    enableCompetitiveSignals: true,
  });
  const [isSavingRiskSettings, setIsSavingRiskSettings] = useState(false);
  const [riskSettingsError, setRiskSettingsError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<"add" | { type: "edit"; id: string } | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    brand: "VISA",
    last4: "",
    expMonth: new Date().getMonth() + 1,
    expYear: new Date().getFullYear() + 1,
    setAsDefault: true,
  });
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [showRemovePaymentDialog, setShowRemovePaymentDialog] = useState(false);
  const [removingPaymentId, setRemovingPaymentId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlanInfo | null>(null);

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "risk", label: "Risk Settings", icon: "⚠️" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
    { id: "team", label: "Team", icon: "👥" },
    { id: "billing", label: "Billing", icon: "💳" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [deals, teams, plan, profileData] = await Promise.all([
          getAllDeals(),
          getMyTeams(),
          getCurrentUserPlan(),
          getUserProfile(),
        ]);
        const nonDemoDeals = deals.filter((deal) => !deal.isDemo);
        setDealsCount(nonDemoDeals.length);
        const totalMembers = teams.reduce((sum, team) => sum + team.memberCount, 0);
        setTeamMembersCount(totalMembers);
        setUserPlan(plan ?? null);

        if (profileData) {
          setUserData({
            name: profileData.name || "",
            surname: profileData.surname || "",
            email: profileData.email || "",
            company: profileData.company || "",
            role: profileData.role || "admin",
            imageUrl: profileData.imageUrl || "",
          });
          if (profileData.imageUrl) {
            setAvatarPreview(profileData.imageUrl);
          }
        }

        const notificationSettings = await getMyNotificationSettings();
        setNotifications({
          emailAlerts: notificationSettings.emailOnActionOverdue,
          riskAlerts: notificationSettings.emailOnDealAtRisk,
          weeklyDigest: notificationSettings.emailDigestFrequency === "weekly",
          dealUpdates: notificationSettings.emailOnStageChange,
        });

        const riskSettingsData = await getMyRiskSettings();
        setRiskSettings({
          inactivityThresholdDays: riskSettingsData.inactivityThresholdDays,
          enableCompetitiveSignals: riskSettingsData.enableCompetitiveSignals,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function loadPaymentMethods() {
      if (activeTab !== "billing") return;
      setLoadingPaymentMethods(true);
      try {
        const list = await getPaymentMethods();
        setPaymentMethods(list);
      } catch (e) {
        console.error("Failed to load payment methods:", e);
        toast.error("Failed to load payment methods.");
      } finally {
        setLoadingPaymentMethods(false);
      }
    }
    loadPaymentMethods();
  }, [activeTab]);

  useEffect(() => {
    async function loadIntegrationStatuses() {
      if (activeTab !== "integrations") return;

      setLoadingStatuses(true);
      try {
        const [statuses, logs] = await Promise.all([
          getAllIntegrationStatuses(),
          getIntegrationLogs(undefined, 10),
        ]);
        setIntegrationStatuses(statuses);
        setIntegrationLogs(logs);
      } catch (error) {
        console.error("Failed to fetch integration statuses:", error);
        toast.error("Failed to load integration statuses");
      } finally {
        setLoadingStatuses(false);
      }
    }
    loadIntegrationStatuses();
  }, [activeTab]);

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsCanceling(false);
    setShowCancelDialog(false);
    toast.success("Your subscription has been canceled successfully.");
  };

  const openAddPaymentModal = () => {
    setPaymentForm({
      brand: "VISA",
      last4: "",
      expMonth: new Date().getMonth() + 1,
      expYear: new Date().getFullYear() + 1,
      setAsDefault: paymentMethods.length === 0,
    });
    setShowPaymentModal("add");
  };

  const openEditPaymentModal = (pm: PaymentMethodItem) => {
    setPaymentForm({
      brand: pm.brand,
      last4: pm.last4,
      expMonth: pm.expMonth,
      expYear: pm.expYear,
      setAsDefault: pm.isDefault,
    });
    setShowPaymentModal({ type: "edit", id: pm.id });
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.last4.trim()) {
      toast.error("Please enter the last 4 digits of your card.");
      return;
    }
    setIsSavingPayment(true);
    try {
      if (showPaymentModal === "add") {
        await addPaymentMethod({
          brand: paymentForm.brand,
          last4: paymentForm.last4,
          expMonth: paymentForm.expMonth,
          expYear: paymentForm.expYear,
          setAsDefault: paymentForm.setAsDefault,
        });
        toast.success("Payment method added.");
      } else if (showPaymentModal?.type === "edit") {
        await updatePaymentMethod(showPaymentModal.id, {
          brand: paymentForm.brand,
          last4: paymentForm.last4,
          expMonth: paymentForm.expMonth,
          expYear: paymentForm.expYear,
        });
        toast.success("Payment method updated.");
      }
      setShowPaymentModal(null);
      const list = await getPaymentMethods();
      setPaymentMethods(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save payment method.");
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleRemovePaymentClick = (id: string) => {
    setRemovingPaymentId(id);
    setShowRemovePaymentDialog(true);
  };

  const handleConfirmRemovePayment = async () => {
    if (!removingPaymentId) return;
    try {
      await removePaymentMethod(removingPaymentId);
      toast.success("Payment method removed.");
      setShowRemovePaymentDialog(false);
      setRemovingPaymentId(null);
      const list = await getPaymentMethods();
      setPaymentMethods(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove payment method.");
    }
  };

  const handleSetDefaultPayment = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      toast.success("Default payment method updated.");
      const list = await getPaymentMethods();
      setPaymentMethods(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set default.");
    }
  };

  const brandStyles: Record<string, { bg: string; label: string }> = {
    VISA: { bg: "from-blue-600 to-blue-400", label: "VISA" },
    Mastercard: { bg: "from-orange-600 to-red-500", label: "MC" },
    Amex: { bg: "from-cyan-600 to-blue-500", label: "Amex" },
    Discover: { bg: "from-amber-600 to-orange-500", label: "Discover" },
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      if (user) {
        await user.delete();
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let imageUrl = userData.imageUrl;
      if (avatarPreview && avatarPreview.startsWith("data:")) {
        imageUrl = avatarPreview;
      }

      await updateUserProfile({
        name: userData.name,
        surname: userData.surname,
        company: userData.company,
        role: userData.role,
        imageUrl: imageUrl,
      });

      toast.success("Profile updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      await updateMyNotificationSettings({
        emailOnActionOverdue: notifications.emailAlerts,
        emailOnDealAtRisk: notifications.riskAlerts,
        emailDigestFrequency: notifications.weeklyDigest ? "weekly" : "never",
        emailOnStageChange: notifications.dealUpdates,
      });
      toast.success("Notification preferences saved successfully!");
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      toast.error("Failed to save notification preferences. Please try again.");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleSaveRiskSettings = async () => {

    if (riskSettings.inactivityThresholdDays < 1 || riskSettings.inactivityThresholdDays > 30) {
      setRiskSettingsError("Inactivity threshold must be between 1 and 30 days");
      toast.error("Please fix the validation errors before saving");
      return;
    }

    setIsSavingRiskSettings(true);
    setRiskSettingsError(null);
    try {
      await updateMyRiskSettings({
        inactivityThresholdDays: riskSettings.inactivityThresholdDays,
        enableCompetitiveSignals: riskSettings.enableCompetitiveSignals,
      });
      toast.success("Risk settings saved successfully!");
    } catch (error) {
      console.error("Failed to save risk settings:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save risk settings";
      toast.error(errorMessage);
      setRiskSettingsError(errorMessage);
    } finally {
      setIsSavingRiskSettings(false);
    }
  };

  const handleConnectSalesforce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesforceForm.apiKey.trim() || !salesforceForm.instanceUrl.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setConnectingIntegration("salesforce");
    try {
      await connectSalesforce(salesforceForm.apiKey.trim(), salesforceForm.instanceUrl.trim());
      toast.success("Salesforce connected successfully!");
      setShowConnectModal(null);
      setSalesforceForm({ apiKey: "", instanceUrl: "" });
      const statuses = await getAllIntegrationStatuses();
      setIntegrationStatuses(statuses);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect Salesforce");
    } finally {
      setConnectingIntegration(null);
    }
  };

  const handleConnectHubSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubspotForm.apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }
    setConnectingIntegration("hubspot");
    try {
      await connectHubSpot(hubspotForm.apiKey.trim());
      toast.success("HubSpot connected successfully!");
      setShowConnectModal(null);
      setHubspotForm({ apiKey: "" });
      const statuses = await getAllIntegrationStatuses();
      setIntegrationStatuses(statuses);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect HubSpot");
    } finally {
      setConnectingIntegration(null);
    }
  };

  const handleConnectGoogleCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleCalendarForm.apiKey.trim() || !googleCalendarForm.calendarId.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setConnectingIntegration("google_calendar");
    try {
      await connectGoogleCalendar(googleCalendarForm.apiKey.trim(), googleCalendarForm.calendarId.trim());
      toast.success("Google Calendar connected successfully!");
      setShowConnectModal(null);
      setGoogleCalendarForm({ apiKey: "", calendarId: "" });
      const statuses = await getAllIntegrationStatuses();
      setIntegrationStatuses(statuses);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect Google Calendar");
    } finally {
      setConnectingIntegration(null);
    }
  };

  const handleSync = async (integration: string) => {
    setSyncingIntegration(integration);
    try {
      let result;
      if (integration === "salesforce") {
        result = await syncSalesforceDeals();
      } else if (integration === "hubspot") {
        result = await syncHubSpotDeals();
      } else if (integration === "googleCalendar") {
        result = await syncCalendarEvents();
      }
      toast.success(`Synced successfully! ${result?.synced || 0} items processed`);
      const [statuses, logs] = await Promise.all([
        getAllIntegrationStatuses(),
        getIntegrationLogs(undefined, 10),
      ]);
      setIntegrationStatuses(statuses);
      setIntegrationLogs(logs);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setSyncingIntegration(null);
    }
  };

  const handleDisconnect = async (integration: string) => {
    const names: Record<string, string> = {
      salesforce: "Salesforce",
      hubspot: "HubSpot",
      googleCalendar: "Google Calendar",
    };
    if (!confirm(`Are you sure you want to disconnect ${names[integration]}? This won't delete any synced data.`)) return;

    try {
      if (integration === "salesforce") {
        await disconnectSalesforce();
      } else if (integration === "hubspot") {
        await disconnectHubSpot();
      } else if (integration === "googleCalendar") {
        await disconnectGoogleCalendar();
      }
      toast.success("Disconnected successfully");
      setShowManageModal(null);
      const statuses = await getAllIntegrationStatuses();
      setIntegrationStatuses(statuses);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect");
    }
  };

  const handleToggleAutoSync = async (integration: string) => {
    try {
      let currentEnabled = false;
      if (integration === "salesforce" && integrationStatuses?.salesforce) {
        currentEnabled = integrationStatuses.salesforce.syncEnabled;
        await updateSalesforceSettings({ syncEnabled: !currentEnabled });
      } else if (integration === "hubspot" && integrationStatuses?.hubspot) {
        currentEnabled = integrationStatuses.hubspot.syncEnabled;
        await updateHubSpotSettings({ syncEnabled: !currentEnabled });
      } else if (integration === "googleCalendar" && integrationStatuses?.googleCalendar) {
        currentEnabled = integrationStatuses.googleCalendar.syncEnabled;
        await updateGoogleCalendarSettings({ syncEnabled: !currentEnabled });
      }
      const statuses = await getAllIntegrationStatuses();
      setIntegrationStatuses(statuses);
      toast.success(`Auto-sync ${!currentEnabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update settings");
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSendingInvite(true);
    try {
      await inviteUserByEmail(inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail.trim()}`);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  };

  const getInitials = () => {
    const first = userData.name?.[0] || "";
    const last = userData.surname?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const DEAL_LIMIT = userPlan?.maxDeals ?? 100;
  const TEAM_MEMBER_LIMIT = userPlan?.maxTeamMembers ?? 3;
  const dealsPercentage = DEAL_LIMIT > 0 ? (dealsCount / DEAL_LIMIT) * 100 : 0;
  const planPriceDisplay = userPlan?.priceDisplay ?? "Free";
  const isPaidPlan = userPlan?.isPaidPlan ?? false;
  const apiCallsDisplay = userPlan?.apiCallsDisplay ?? "1K";

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full" style={{ background: "#0a0a0f" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
            <p className="text-sm text-white/40">
              Manage your account and preferences
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-64 shrink-0">
              <nav className="flex flex-row lg:flex-col gap-2 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all min-h-[44px] ${activeTab === tab.id
                      ? "bg-[#8b1a1a]/20 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                      } lg:w-full`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div
                className="rounded-2xl p-4 mt-6"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(139, 26, 26, 0.15) 0%, rgba(107, 15, 15, 0.05) 100%)",
                  border: "1px solid rgba(139, 26, 26, 0.2)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b1a1a] to-[#6b0f0f] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {getInitials()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{userPlan?.planName ?? "Starter"}</p>
                    <p className="text-xs text-white/40">{dealsCount} / {DEAL_LIMIT} deals</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8b1a1a] to-[#6b0f0f]"
                    style={{ width: `${Math.min(dealsPercentage, 100)}%` }}
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
                        {avatarPreview ? (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden">
                            <img
                              src={avatarPreview}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8b1a1a] to-[#6b0f0f] flex items-center justify-center text-white text-2xl font-bold">
                            {getInitials()}
                          </div>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
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
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8b1a1a]/50 transition-colors"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          disabled
                          readOnly
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 placeholder-white/30 cursor-not-allowed opacity-60"
                          placeholder="Enter your email"
                        />
                        <p className="text-xs text-white/40 mt-1">
                          Email can only be changed by signing in with a different account
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={userData.company}
                          onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8b1a1a]/50 transition-colors"
                          placeholder="Enter company name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                          Role
                        </label>
                        <select
                          value={userData.role}
                          onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                          className="w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#8b1a1a]/50 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[length:16px] bg-[right_0.75rem_center]"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Sales Manager</option>
                          <option value="rep">Sales Rep</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(135deg, #d51024 0%, #8b1a1a 100%)",
                        }}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
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
                            Manage your password and security settings
                          </p>
                        </div>
                        <button
                          onClick={() => openUserProfile()}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          Change
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-sm font-medium text-white">
                            Two-Factor Authentication
                          </p>
                          <p className="text-xs text-white/40">
                            {user?.twoFactorEnabled
                              ? "2FA is enabled"
                              : "Add an extra layer of security"}
                          </p>
                        </div>
                        <button
                          onClick={() => openUserProfile()}
                          className="px-4 py-2 rounded-xl text-sm font-medium bg-[#8b1a1a]/20 text-red-400 hover:bg-[#8b1a1a]/30 transition-colors"
                        >
                          {user?.twoFactorEnabled ? "Manage" : "Enable"}
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
                      <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      >
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
                          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${notifications[item.id as keyof typeof notifications]
                            ? "bg-[#8b1a1a]"
                            : "bg-white/10"
                            }`}
                        >
                          <div
                            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${notifications[item.id as keyof typeof notifications]
                              ? "translate-x-6"
                              : "translate-x-1"
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={isSavingNotifications}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                      style={{
                        background:
                          "linear-gradient(135deg, #d51024 0%, #8b1a1a 100%)",
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {isSavingNotifications ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "risk" && (
                <div className="space-y-6">
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Risk Analysis Settings
                    </h3>
                    <p className="text-sm text-white/40 mb-6">
                      Configure how Sentinel calculates deal risk scores and detects competitive signals
                    </p>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">
                          Inactivity Threshold (Days)
                        </label>
                        <p className="text-xs text-white/40 mb-3">
                          Number of days without activity before a deal is considered at risk. Default: 7 days
                        </p>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={riskSettings.inactivityThresholdDays}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setRiskSettings({
                                ...riskSettings,
                                inactivityThresholdDays: 7,
                              });
                              setRiskSettingsError(null);
                              return;
                            }
                            const numValue = parseInt(value, 10);
                            if (isNaN(numValue)) {
                              setRiskSettingsError("Please enter a valid number");
                              return;
                            }
                            if (numValue < 1 || numValue > 30) {
                              setRiskSettingsError("Value must be between 1 and 30 days");
                              return;
                            }
                            setRiskSettings({
                              ...riskSettings,
                              inactivityThresholdDays: numValue,
                            });
                            setRiskSettingsError(null);
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (isNaN(value) || value < 1) {
                              setRiskSettings({
                                ...riskSettings,
                                inactivityThresholdDays: 1,
                              });
                              setRiskSettingsError(null);
                            } else if (value > 30) {
                              setRiskSettings({
                                ...riskSettings,
                                inactivityThresholdDays: 30,
                              });
                              setRiskSettingsError(null);
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none transition-colors ${riskSettingsError
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10 focus:border-[#8b1a1a]/50"
                            }`}
                        />
                        {riskSettingsError ? (
                          <p className="text-xs text-red-400 mt-2">{riskSettingsError}</p>
                        ) : (
                          <p className="text-xs text-white/30 mt-2">
                            Range: 1-30 days
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div>
                          <label className="block text-sm font-medium text-white mb-1">
                            Competitive Signals Detection
                          </label>
                          <p className="text-xs text-white/40">
                            Automatically detect competitor mentions and competitive pressure indicators in deal timeline events
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setRiskSettings({
                              ...riskSettings,
                              enableCompetitiveSignals: !riskSettings.enableCompetitiveSignals,
                            })
                          }
                          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${riskSettings.enableCompetitiveSignals
                            ? "bg-[#8b1a1a]"
                            : "bg-white/10"
                            }`}
                        >
                          <div
                            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${riskSettings.enableCompetitiveSignals
                              ? "translate-x-6"
                              : "translate-x-1"
                              }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSaveRiskSettings}
                        disabled={isSavingRiskSettings}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                        style={{
                          background:
                            "linear-gradient(135deg, #d51024 0%, #8b1a1a 100%)",
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {isSavingRiskSettings ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "integrations" && (
                <div className="space-y-6">
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Connected Apps
                    </h3>
                    <p className="text-sm text-white/40 mb-6">
                      Connect your tools to sync deals, contacts, and calendar events
                    </p>

                    {loadingStatuses ? (
                      <div className="grid gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="animate-pulse flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white/10"></div>
                              <div>
                                <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                                <div className="h-3 w-32 bg-white/5 rounded"></div>
                              </div>
                            </div>
                            <div className="h-9 w-20 bg-white/10 rounded-xl"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        <IntegrationCard
                          name="Salesforce"
                          description="Sync deals and contacts"
                          icon="☁️"
                          iconBg="bg-blue-500/20"
                          connected={integrationStatuses?.salesforce?.connected || false}
                          lastSyncAt={integrationStatuses?.salesforce?.lastSyncAt}
                          totalSynced={integrationStatuses?.salesforce?.totalSynced}
                          onConnect={() => setShowConnectModal("salesforce")}
                          onManage={() => setShowManageModal("salesforce")}
                          onSync={() => handleSync("salesforce")}
                          syncing={syncingIntegration === "salesforce"}
                        />

                        <IntegrationCard
                          name="HubSpot"
                          description="CRM integration"
                          icon="🔶"
                          iconBg="bg-orange-500/20"
                          connected={integrationStatuses?.hubspot?.connected || false}
                          lastSyncAt={integrationStatuses?.hubspot?.lastSyncAt}
                          totalSynced={integrationStatuses?.hubspot?.totalSynced}
                          onConnect={() => setShowConnectModal("hubspot")}
                          onManage={() => setShowManageModal("hubspot")}
                          onSync={() => handleSync("hubspot")}
                          syncing={syncingIntegration === "hubspot"}
                        />

                        <IntegrationCard
                          name="Slack"
                          description="Get notifications in Slack"
                          icon="💬"
                          iconBg="bg-red-600/20"
                          connected={integrationStatuses?.slack?.connected || false}
                          channelCount={integrationStatuses?.slack?.channelCount}
                          onConnect={() => router.push("/settings/integrations")}
                          onManage={() => router.push("/settings/integrations")}
                          hideSync
                        />

                        <IntegrationCard
                          name="Google Calendar"
                          description="Sync meetings and events"
                          icon="📅"
                          iconBg="bg-blue-500/20"
                          connected={integrationStatuses?.googleCalendar?.connected || false}
                          lastSyncAt={integrationStatuses?.googleCalendar?.lastSyncAt}
                          onConnect={() => setShowConnectModal("google_calendar")}
                          onManage={() => setShowManageModal("googleCalendar")}
                          onSync={() => handleSync("googleCalendar")}
                          syncing={syncingIntegration === "googleCalendar"}
                        />
                      </div>
                    )}
                  </div>

                  <div
                    className="rounded-2xl p-6"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Recent Activity
                    </h3>
                    {integrationLogs.length === 0 ? (
                      <p className="text-sm text-white/40 text-center py-6">
                        No integration activity yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {integrationLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]"
                          >
                            <div
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.status === "success"
                                ? "bg-emerald-400"
                                : log.status === "failed"
                                  ? "bg-red-400"
                                  : "bg-white/30"
                                }`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-white/60 uppercase">
                                  {log.integration.replace("_", " ")}
                                </span>
                                <span className="text-xs text-white/30">•</span>
                                <span className="text-xs text-white/40">
                                  {log.action.replace("_", " ")}
                                </span>
                              </div>
                              {log.message && (
                                <p className="text-sm text-white/60 mt-0.5 truncate">
                                  {log.message}
                                </p>
                              )}
                              <p className="text-xs text-white/30 mt-1">
                                {formatRelativeTime(log.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#8b1a1a]/20 text-red-400 hover:bg-[#8b1a1a]/30 transition-colors"
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
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b1a1a] to-[#6b0f0f] flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {member.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-white/40 truncate">
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
                        "linear-gradient(145deg, rgba(139, 26, 26, 0.1) 0%, rgba(107, 15, 15, 0.05) 100%)",
                      border: "1px solid rgba(139, 26, 26, 0.2)",
                    }}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b1a1a]/10 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold text-red-400 bg-[#8b1a1a]/20 mb-3">
                            Current Plan
                          </span>
                          <h3 className="text-2xl font-bold text-white">
                            {userPlan?.planName ?? "Starter"}
                          </h3>
                          <p className="text-white/40 mt-1">
                            {userPlan?.planType === "starter"
                              ? "Perfect for getting started"
                              : userPlan?.planType === "pro"
                                ? "Perfect for growing sales teams"
                                : userPlan?.planType === "enterprise"
                                  ? "For large organizations"
                                  : "Your current plan"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">{planPriceDisplay}</p>
                          {userPlan?.isPaidPlan && userPlan?.priceDisplay !== "Contact us" && (
                            <p className="text-sm text-white/40">/month</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        {[
                          { label: "Deals", value: `${dealsCount} / ${DEAL_LIMIT}` },
                          { label: "Team Members", value: `${teamMembersCount} / ${TEAM_MEMBER_LIMIT}` },
                          { label: "API Calls", value: `— / ${apiCallsDisplay}` },
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
                        <button
                          onClick={() => router.push("/pricing")}
                          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          Change Plan
                        </button>
                        {isPaidPlan && (
                          <button
                            onClick={() => setShowCancelDialog(true)}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
                          >
                            Cancel Subscription
                          </button>
                        )}
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

                    {loadingPaymentMethods ? (
                      <p className="text-sm text-white/40 py-4">Loading...</p>
                    ) : (
                      <>
                        <div className="space-y-4 mb-4">
                          {paymentMethods.length === 0 && (
                            <p className="text-sm text-white/40 py-2">No payment methods yet.</p>
                          )}
                          {paymentMethods.map((pm) => {
                            const style = brandStyles[pm.brand] ?? { bg: "from-gray-600 to-gray-500", label: pm.brand.slice(0, 2).toUpperCase() };
                            return (
                              <div
                                key={pm.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className={`w-12 h-8 rounded-lg bg-gradient-to-r ${style.bg} flex items-center justify-center shrink-0`}>
                                    <span className="text-white text-xs font-bold">
                                      {style.label}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-white">
                                      •••• •••• •••• {pm.last4}
                                    </p>
                                    <p className="text-xs text-white/40">
                                      Expires {String(pm.expMonth).padStart(2, "0")}/{pm.expYear}
                                      {pm.isDefault && (
                                        <span className="ml-2 text-red-400">Default</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {!pm.isDefault && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetDefaultPayment(pm.id)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                      Set default
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openEditPaymentModal(pm)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                  >
                                    Update
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePaymentClick(pm.id)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={openAddPaymentModal}
                          className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          + Add new payment method
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {showCancelDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !isCanceling && setShowCancelDialog(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Cancel Subscription?
            </h3>
            <p className="text-sm text-white/60 mb-6">
              Are you sure you want to cancel your subscription? This action cannot be undone. You will lose access to all premium features immediately.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={isCanceling}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #d51024 0%, #8b1a1a 100%)",
                }}
              >
                {isCanceling ? "Canceling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !isSavingPayment && setShowPaymentModal(null)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {showPaymentModal === "add" ? "Add payment method" : "Update payment method"}
            </h3>
            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Card brand</label>
                <select
                  value={paymentForm.brand}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, brand: e.target.value }))}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#8b1a1a]/50 appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat [background-image:url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]"
                >
                  {CARD_BRANDS.map((b) => (
                    <option key={b} value={b} className="bg-gray-900">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Last 4 digits</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4242"
                  value={paymentForm.last4}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, last4: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8b1a1a]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Exp. month</label>
                  <select
                    value={paymentForm.expMonth}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, expMonth: Number(e.target.value) }))}
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#8b1a1a]/50 appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat [background-image:url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m} className="bg-gray-900">
                        {String(m).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Exp. year</label>
                  <select
                    value={paymentForm.expYear}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, expYear: Number(e.target.value) }))}
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#8b1a1a]/50 appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat [background-image:url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]"
                  >
                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                      <option key={y} value={y} className="bg-gray-900">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {showPaymentModal === "add" && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.setAsDefault}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, setAsDefault: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-red-500 focus:ring-red-500/50"
                  />
                  <span className="text-sm text-white/70">Set as default payment method</span>
                </label>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !isSavingPayment && setShowPaymentModal(null)}
                  disabled={isSavingPayment}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPayment}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #d51024 0%, #8b1a1a 100%)" }}
                >
                  {isSavingPayment ? "Saving..." : showPaymentModal === "add" ? "Add card" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRemovePaymentDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowRemovePaymentDialog(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-xl font-bold text-white mb-2">Remove payment method?</h3>
            <p className="text-sm text-white/60 mb-6">
              This card will be removed from your account. You can add it again anytime.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowRemovePaymentDialog(false); setRemovingPaymentId(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemovePayment}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: "linear-gradient(135deg, #d51024 0%, #8b1a1a 100%)" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !isDeleting && setShowDeleteDialog(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(145deg, rgba(239,68,68,0.1) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <h3 className="text-xl font-bold text-red-400 mb-2">
              Delete Account?
            </h3>
            <p className="text-sm text-white/60 mb-4">
              Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
            </p>
            <p className="text-xs text-red-400/70 mb-6">
              All your deals, teams, notifications, and other data will be permanently deleted.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                }}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConnectModal === "salesforce" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowConnectModal(null)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                ☁️
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Connect Salesforce</h3>
                <p className="text-sm text-white/40">Sync your opportunities and contacts</p>
              </div>
            </div>

            <form onSubmit={handleConnectSalesforce} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Instance URL</label>
                <input
                  type="url"
                  value={salesforceForm.instanceUrl}
                  onChange={(e) => setSalesforceForm((f) => ({ ...f, instanceUrl: e.target.value }))}
                  placeholder="https://yourcompany.salesforce.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8b1a1a]/50"
                  required
                />
                <p className="text-xs text-white/40 mt-1">Your Salesforce org URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">API Key / Access Token</label>
                <input
                  type="password"
                  value={salesforceForm.apiKey}
                  onChange={(e) => setSalesforceForm((f) => ({ ...f, apiKey: e.target.value }))}
                  placeholder="Enter your Salesforce API key"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8b1a1a]/50"
                  required
                />
                <p className="text-xs text-white/40 mt-1">
                  <a
                    href="https://help.salesforce.com/s/articleView?id=sf.connected_app_create_api_integration.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:underline"
                  >
                    How to get your API key →
                  </a>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectingIntegration === "salesforce"}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #d51024 0%, #8b1a1a 100%)" }}
                >
                  {connectingIntegration === "salesforce" ? "Connecting..." : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConnectModal === "hubspot" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowConnectModal(null)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
                🔶
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Connect HubSpot</h3>
                <p className="text-sm text-white/40">Import your CRM deals and contacts</p>
              </div>
            </div>

            <form onSubmit={handleConnectHubSpot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Private App Access Token</label>
                <input
                  type="password"
                  value={hubspotForm.apiKey}
                  onChange={(e) => setHubspotForm((f) => ({ ...f, apiKey: e.target.value }))}
                  placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8b1a1a]/50"
                  required
                />
                <p className="text-xs text-white/40 mt-1">
                  <a
                    href="https://developers.hubspot.com/docs/api/private-apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:underline"
                  >
                    Create a Private App in HubSpot →
                  </a>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectingIntegration === "hubspot"}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #d51024 0%, #8b1a1a 100%)" }}
                >
                  {connectingIntegration === "hubspot" ? "Connecting..." : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConnectModal === "google_calendar" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowConnectModal(null)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                📅
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Connect Google Calendar</h3>
                <p className="text-sm text-white/40">Sync meetings and schedule events</p>
              </div>
            </div>

            <form onSubmit={handleConnectGoogleCalendar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">API Key</label>
                <input
                  type="password"
                  value={googleCalendarForm.apiKey}
                  onChange={(e) => setGoogleCalendarForm((f) => ({ ...f, apiKey: e.target.value }))}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8b1a1a]/50"
                  required
                />
                <p className="text-xs text-white/40 mt-1">
                  Create in Google Cloud Console → APIs &amp; Services → Credentials. Enable &quot;Google Calendar API&quot; for the project.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Calendar ID</label>
                <input
                  type="text"
                  value={googleCalendarForm.calendarId}
                  onChange={(e) => setGoogleCalendarForm((f) => ({ ...f, calendarId: e.target.value }))}
                  placeholder="e.g. xxx@group.calendar.google.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8b1a1a]/50"
                  required
                />
                <p className="text-xs text-white/40 mt-1">
                  Use a <strong>public</strong> calendar&apos;s ID. API keys cannot access &quot;primary&quot; or private calendars. In Google Calendar, create a calendar, set it to &quot;Make available to public&quot;, then copy its ID (Settings → your calendar → Integrate calendar).
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectingIntegration === "google_calendar"}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #d51024 0%, #8b1a1a 100%)" }}
                >
                  {connectingIntegration === "google_calendar" ? "Connecting..." : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowManageModal(null)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                  {showManageModal === "salesforce" && "☁️"}
                  {showManageModal === "hubspot" && "🔶"}
                  {showManageModal === "googleCalendar" && "📅"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {showManageModal === "salesforce" && "Salesforce"}
                    {showManageModal === "hubspot" && "HubSpot"}
                    {showManageModal === "googleCalendar" && "Google Calendar"}
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowManageModal(null)}
                className="text-white/40 hover:text-white p-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02]">
                <span className="text-sm text-white/60">Last Sync</span>
                <span className="text-sm text-white">
                  {formatRelativeTime(
                    showManageModal === "salesforce" ? integrationStatuses?.salesforce?.lastSyncAt :
                      showManageModal === "hubspot" ? integrationStatuses?.hubspot?.lastSyncAt :
                        showManageModal === "googleCalendar" ? integrationStatuses?.googleCalendar?.lastSyncAt :
                          null
                  ) || "Never"}
                </span>
              </div>
              {(showManageModal === "salesforce" || showManageModal === "hubspot") && (
                <div className="flex justify-between p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-sm text-white/60">Total Synced</span>
                  <span className="text-sm text-white">
                    {showManageModal === "salesforce"
                      ? integrationStatuses?.salesforce?.totalSynced || 0
                      : integrationStatuses?.hubspot?.totalSynced || 0} items
                  </span>
                </div>
              )}
              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02]">
                <span className="text-sm text-white/60">Status</span>
                <span
                  className={`text-sm ${(showManageModal === "salesforce" ? integrationStatuses?.salesforce?.lastSyncStatus :
                    showManageModal === "hubspot" ? integrationStatuses?.hubspot?.lastSyncStatus :
                      showManageModal === "googleCalendar" ? integrationStatuses?.googleCalendar?.lastSyncStatus :
                        null) === "success"
                    ? "text-emerald-400"
                    : (showManageModal === "salesforce" ? integrationStatuses?.salesforce?.lastSyncStatus :
                      showManageModal === "hubspot" ? integrationStatuses?.hubspot?.lastSyncStatus :
                        showManageModal === "googleCalendar" ? integrationStatuses?.googleCalendar?.lastSyncStatus :
                          null) === "failed"
                      ? "text-red-400"
                      : "text-white"
                    }`}
                >
                  {(showManageModal === "salesforce" ? integrationStatuses?.salesforce?.lastSyncStatus :
                    showManageModal === "hubspot" ? integrationStatuses?.hubspot?.lastSyncStatus :
                      showManageModal === "googleCalendar" ? integrationStatuses?.googleCalendar?.lastSyncStatus :
                        null) || "Ready"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] mb-6">
              <div>
                <p className="text-sm font-medium text-white">Auto-sync</p>
                <p className="text-xs text-white/40">Automatically sync data periodically</p>
              </div>
              <button
                onClick={() => handleToggleAutoSync(showManageModal)}
                className={`relative w-12 h-7 rounded-full transition-colors ${(showManageModal === "salesforce" ? integrationStatuses?.salesforce?.syncEnabled :
                  showManageModal === "hubspot" ? integrationStatuses?.hubspot?.syncEnabled :
                    showManageModal === "googleCalendar" ? integrationStatuses?.googleCalendar?.syncEnabled :
                      false)
                  ? "bg-[#8b1a1a]"
                  : "bg-white/10"
                  }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${(showManageModal === "salesforce" ? integrationStatuses?.salesforce?.syncEnabled :
                    showManageModal === "hubspot" ? integrationStatuses?.hubspot?.syncEnabled :
                      showManageModal === "googleCalendar" ? integrationStatuses?.googleCalendar?.syncEnabled :
                        false)
                    ? "translate-x-6"
                    : "translate-x-1"
                    }`}
                />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSync(showManageModal)}
                disabled={syncingIntegration === showManageModal}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                {syncingIntegration === showManageModal ? "Syncing..." : "Sync Now"}
              </button>
              <button
                onClick={() => handleDisconnect(showManageModal)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !sendingInvite && setShowInviteModal(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#8b1a1a]/20 flex items-center justify-center text-2xl">
                  👥
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Invite Member</h3>
                  <p className="text-sm text-white/40">Send an invitation to join your team</p>
                </div>
              </div>
              <button
                onClick={() => !sendingInvite && setShowInviteModal(false)}
                disabled={sendingInvite}
                className="text-white/40 hover:text-white p-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={sendingInvite}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#8b1a1a]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  disabled={sendingInvite}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#8b1a1a]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  disabled={sendingInvite}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white/60 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite || !inviteEmail.trim()}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-[#8b1a1a] hover:bg-[#6b0f0f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingInvite ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function IntegrationCard({
  name,
  description,
  icon,
  iconBg,
  connected,
  lastSyncAt,
  totalSynced,
  channelCount,
  onConnect,
  onManage,
  onSync,
  syncing,
  hideSync,
}: {
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  connected: boolean;
  lastSyncAt?: Date | null;
  totalSynced?: number;
  channelCount?: number;
  onConnect: () => void;
  onManage: () => void;
  onSync?: () => void;
  syncing?: boolean;
  hideSync?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{name}</p>
          <p className="text-xs text-white/40">{description}</p>
          {connected && lastSyncAt && (
            <p className="text-xs text-white/30 mt-0.5">
              Last sync: {formatRelativeTime(lastSyncAt)}
              {totalSynced !== undefined && totalSynced > 0 && ` · ${totalSynced} synced`}
            </p>
          )}
          {connected && channelCount !== undefined && channelCount > 0 && (
            <p className="text-xs text-white/30 mt-0.5">{channelCount} channel{channelCount > 1 ? "s" : ""} connected</p>
          )}
        </div>
      </div>

      {connected ? (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
          {!hideSync && onSync && (
            <button
              onClick={onSync}
              disabled={syncing}
              className="px-3 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Syncing
                </span>
              ) : (
                "Sync"
              )}
            </button>
          )}
          <button
            onClick={onManage}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Manage
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[#8b1a1a]/20 text-red-400 hover:bg-[#8b1a1a]/30 transition-colors"
        >
          Connect
        </button>
      )}
    </div>
  );
}
