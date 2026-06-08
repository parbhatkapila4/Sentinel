"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { getMyTeams } from "@/app/actions/teams";
import {
  getUserProfile,
  updateUserProfile,
  inviteUserByEmail,
} from "@/app/actions/user";
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
  disconnectGoogleCalendar,
  updateGoogleCalendarSettings,
} from "@/app/actions/google-calendar";
import { syncCalendar } from "@/app/actions/calendar";
import {
  disconnectGmail,
  syncGmailSignals,
  updateGmailSettings,
} from "@/app/actions/gmail";
import {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
} from "@/app/actions/payment-methods";
import {
  getCurrentUsage,
  getCurrentUserPlan,
  type UserPlanInfo,
} from "@/app/actions/plans";
import type { PaymentMethodItem } from "@/lib/payment-methods";
import {
  detectBrand,
  formatExpiry,
  formatPan,
  isExpiryFuture,
  isPanValidForBrand,
  luhnValid,
  parseExpiry,
  type BrandMeta,
} from "@/lib/card-utils";
import { SettingsHero } from "./SettingsHero";
import { SettingsNav, type NavSection } from "./SettingsNav";
import {
  EditorialButton,
  EditorialInput,
  EditorialModal,
  Field,
  ModalActions,
  SerifEm,
} from "./primitives";
import {
  CancelSubscriptionDialog,
  DeleteAccountDialog,
  DisconnectIntegrationDialog,
  RemovePaymentDialog,
} from "./dialogs/ConfirmDialogs";
import { InviteMemberDialog } from "./dialogs/InviteMemberDialog";
import { EditPaymentDialog } from "./dialogs/EditPaymentDialog";
import { NotificationsSection } from "./sections/NotificationsSection";
import { RiskSection } from "./sections/RiskSection";
import { DangerZoneSection } from "./sections/DangerZoneSection";
import { ProfileAndSecuritySection } from "./sections/ProfileSection";
import { TeamSection } from "./sections/TeamSection";
import { IntegrationsSection } from "./sections/IntegrationsSection";
import { BillingSection } from "./sections/BillingSection";
import {
  ConnectGmailDialog,
  ConnectHubSpotDialog,
  ConnectSalesforceDialog,
  ManageIntegrationDialog,
  type ConnectModalKind,
  type ManageModalKind,
} from "./dialogs/IntegrationDialogs";

const PANEL_EXPAND_SCROLL_DELAY_MS = 60;

const DISCONNECT_LABELS: Record<string, string> = {
  salesforce: "Salesforce",
  hubspot: "HubSpot",
  googleCalendar: "Google Calendar",
  gmail: "Gmail",
};

const NAV_SECTIONS: NavSection[] = [
  {
    id: "settings-profile",
    label: "Profile",
    number: "01.01",
    iconPaths: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4" />
      </>
    ),
  },
  {
    id: "settings-security",
    label: "Security",
    number: "01.02",
    iconPaths: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="1" />
        <path d="M8 11V7a4 4 0 018 0v4" />
      </>
    ),
  },
  {
    id: "settings-notifications",
    label: "Notifications",
    number: "02",
    iconPaths: (
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 01-4 0" />
    ),
  },
  {
    id: "settings-risk",
    label: "Risk Analysis",
    number: "03",
    iconPaths: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
  {
    id: "settings-integrations",
    label: "Integrations",
    number: "04",
    iconPaths: (
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    ),
  },
  {
    id: "settings-team",
    label: "Team",
    number: "05",
    iconPaths: (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
  },
  {
    id: "settings-billing",
    label: "Billing",
    number: "06",
    iconPaths: (
      <>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </>
    ),
  },
  {
    id: "settings-danger",
    label: "Danger zone",
    number: "§ †",
    iconPaths: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
  },
];

type PaymentModalState =
  | "add"
  | { type: "edit"; id: string }
  | null;

export function SettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openUserProfile } = useClerk();
  const { user } = useUser();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    email: "",
    company: "",
    role: "admin",
    imageUrl: "",
  });
  const [initialProfile, setInitialProfile] = useState(profile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [initialAvatar, setInitialAvatar] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    riskAlerts: true,
    weeklyDigest: false,
    dealUpdates: true,
  });
  const [initialNotifications, setInitialNotifications] = useState(notifications);
  const [savingNotifications, setSavingNotifications] = useState(false);

  const [risk, setRisk] = useState({
    inactivityThresholdDays: 7,
    enableCompetitiveSignals: true,
  });
  const [initialRisk, setInitialRisk] = useState(risk);
  const [savingRisk, setSavingRisk] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [championDormancy, setChampionDormancy] = useState(false);
  const [stageStall, setStageStall] = useState(false);
  const [initialChampionDormancy, setInitialChampionDormancy] = useState(false);
  const [initialStageStall, setInitialStageStall] = useState(false);

  const [integrationStatuses, setIntegrationStatuses] =
    useState<AllIntegrationStatuses | null>(null);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLogEntry[]>(
    []
  );
  const [connectModal, setConnectModal] = useState<ConnectModalKind>(null);
  const [manageModal, setManageModal] = useState<ManageModalKind>(null);
  const [disconnectTarget, setDisconnectTarget] =
    useState<ManageModalKind>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectingIntegration, setConnectingIntegration] = useState<
    string | null
  >(null);
  const [syncingIntegration, setSyncingIntegration] = useState<string | null>(
    null
  );
  const [salesforceForm, setSalesforceForm] = useState({
    instanceUrl: "",
    consumerKey: "",
    consumerSecret: "",
  });
  const [hubspotForm, setHubspotForm] = useState({ apiKey: "" });
  const [slackPanelExpanded, setSlackPanelExpanded] = useState<boolean>(
    () => searchParams.get("panel") === "slack"
  );

  const revealSlackPanel = useCallback(() => {
    setSlackPanelExpanded(true);
    setTimeout(() => {
      document
        .getElementById("slack-integrations-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, PANEL_EXPAND_SCROLL_DELAY_MS);
  }, []);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [userPlan, setUserPlan] = useState<UserPlanInfo | null>(null);
  const [dealsCount, setDealsCount] = useState<number | null>(null);
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>(null);
  const [paymentForm, setPaymentForm] = useState({
    brand: "VISA",
    last4: "",
    expMonth: new Date().getMonth() + 1,
    expYear: new Date().getFullYear() + 1,
    setAsDefault: true,
  });
  const [addCard, setAddCard] = useState({
    pan: "",
    expiry: "",
    cvc: "",
    name: "",
    setAsDefault: true,
  });
  const [addCardErrors, setAddCardErrors] = useState<{
    pan?: string;
    expiry?: string;
    cvc?: string;
  }>({});
  const [savingPayment, setSavingPayment] = useState(false);
  const [showRemovePayment, setShowRemovePayment] = useState(false);
  const [removingPaymentId, setRemovingPaymentId] = useState<string | null>(
    null
  );
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [usage, teams, plan, profileData] = await Promise.all([
          getCurrentUsage(),
          getMyTeams(),
          getCurrentUserPlan(),
          getUserProfile(),
        ]);
        setDealsCount(usage ? usage.deals.current : null);
        setTeamMembersCount(
          usage?.teamMembers.current ??
          teams.reduce((sum, t) => sum + t.memberCount, 0)
        );
        setUserPlan(plan ?? null);

        if (profileData) {
          const next = {
            name: profileData.name || "",
            surname: profileData.surname || "",
            email: profileData.email || "",
            company: profileData.company || "",
            role: profileData.role || "admin",
            imageUrl: profileData.imageUrl || "",
          };
          setProfile(next);
          setSentinelJoinedAt(profileData.createdAt);
          setInitialProfile(next);
          if (profileData.imageUrl) {
            setAvatarPreview(profileData.imageUrl);
            setInitialAvatar(profileData.imageUrl);
          }
        }

        const n = await getMyNotificationSettings();
        const nextNotif = {
          emailAlerts: n.emailOnActionOverdue,
          riskAlerts: n.emailOnDealAtRisk,
          weeklyDigest: n.emailDigestFrequency === "weekly",
          dealUpdates: n.emailOnStageChange,
        };
        setNotifications(nextNotif);
        setInitialNotifications(nextNotif);

        const r = await getMyRiskSettings();
        const nextRisk = {
          inactivityThresholdDays: r.inactivityThresholdDays,
          enableCompetitiveSignals: r.enableCompetitiveSignals,
        };
        setRisk(nextRisk);
        setInitialRisk(nextRisk);
        setChampionDormancy(r.enableChampionDormancy);
        setInitialChampionDormancy(r.enableChampionDormancy);
        setStageStall(r.enableStageStall);
        setInitialStageStall(r.enableStageStall);
      } catch (e) {
        console.error("Failed to bootstrap settings:", e);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    async function loadIntegrationStatuses() {
      setLoadingStatuses(true);
      try {
        const [statuses, logs] = await Promise.all([
          getAllIntegrationStatuses(),
          getIntegrationLogs(undefined, 10),
        ]);
        setIntegrationStatuses(statuses);
        setIntegrationLogs(logs);
      } catch (e) {
        console.error("Failed to load integration statuses:", e);
      } finally {
        setLoadingStatuses(false);
      }
    }
    loadIntegrationStatuses();
  }, []);

  useEffect(() => {
    async function loadPaymentMethods() {
      setLoadingPaymentMethods(true);
      try {
        const list = await getPaymentMethods();
        setPaymentMethods(list);
      } catch (e) {
        console.error("Failed to load payment methods:", e);
      } finally {
        setLoadingPaymentMethods(false);
      }
    }
    loadPaymentMethods();
  }, []);

  const [sentinelJoinedAt, setSentinelJoinedAt] = useState<string | null>(null);

  const joinedLabel = useMemo(() => {
    if (!sentinelJoinedAt) return "";
    try {
      const d = new Date(sentinelJoinedAt);
      return `JOINED ${d
        .toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
        .toUpperCase()}`;
    } catch {
      return "";
    }
  }, [sentinelJoinedAt]);

  const getInitials = useCallback(() => {
    const f = profile.name?.[0] || "";
    const l = profile.surname?.[0] || "";
    return ((f + l).toUpperCase() || "U").slice(0, 2);
  }, [profile.name, profile.surname]);

  const DEAL_LIMIT = userPlan?.maxDeals ?? 5;
  const TEAM_MEMBER_LIMIT = userPlan?.maxTeamMembers ?? 1;
  const planPriceDisplay = userPlan?.priceDisplay ?? "$0";
  const isPaidPlan = userPlan?.isPaidPlan ?? false;
  const apiCallsDisplay = userPlan?.apiCallsDisplay ?? "100";
  const planTag = (userPlan?.planType ?? "free").toUpperCase();
  const planName = userPlan?.planName ?? "Starter";

  const profileDirty = useMemo(() => {
    return (
      profile.name !== initialProfile.name ||
      profile.surname !== initialProfile.surname ||
      profile.company !== initialProfile.company ||
      profile.role !== initialProfile.role ||
      (avatarPreview ?? "") !== (initialAvatar ?? "")
    );
  }, [profile, initialProfile, avatarPreview, initialAvatar]);

  const notificationsDirty = useMemo(() => {
    return (
      notifications.emailAlerts !== initialNotifications.emailAlerts ||
      notifications.riskAlerts !== initialNotifications.riskAlerts ||
      notifications.weeklyDigest !== initialNotifications.weeklyDigest ||
      notifications.dealUpdates !== initialNotifications.dealUpdates
    );
  }, [notifications, initialNotifications]);

  const riskDirty = useMemo(() => {
    return (
      risk.inactivityThresholdDays !== initialRisk.inactivityThresholdDays ||
      risk.enableCompetitiveSignals !== initialRisk.enableCompetitiveSignals ||
      championDormancy !== initialChampionDormancy ||
      stageStall !== initialStageStall
    );
  }, [
    risk,
    initialRisk,
    championDormancy,
    initialChampionDormancy,
    stageStall,
    initialStageStall,
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const discardProfile = () => {
    setProfile(initialProfile);
    setAvatarPreview(initialAvatar);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      let imageUrl = profile.imageUrl;
      if (avatarPreview && avatarPreview.startsWith("data:")) {
        imageUrl = avatarPreview;
      } else if (avatarPreview) {
        imageUrl = avatarPreview;
      }
      await updateUserProfile({
        name: profile.name,
        surname: profile.surname,
        company: profile.company,
        role: profile.role,
        imageUrl,
      });
      toast.success("Profile updated.");
      setInitialProfile({ ...profile, imageUrl });
      setInitialAvatar(avatarPreview);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await updateMyNotificationSettings({
        emailOnActionOverdue: notifications.emailAlerts,
        emailOnDealAtRisk: notifications.riskAlerts,
        emailDigestFrequency: notifications.weeklyDigest ? "weekly" : "never",
        emailOnStageChange: notifications.dealUpdates,
      });
      toast.success("Notification preferences saved.");
      setInitialNotifications(notifications);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save notification preferences.");
    } finally {
      setSavingNotifications(false);
    }
  };

  const discardNotifications = () => setNotifications(initialNotifications);

  const saveRisk = async () => {
    if (
      risk.inactivityThresholdDays < 1 ||
      risk.inactivityThresholdDays > 30
    ) {
      setRiskError("Inactivity threshold must be between 1 and 30 days");
      toast.error("Please fix the validation errors before saving");
      return;
    }
    setSavingRisk(true);
    setRiskError(null);
    try {
      await updateMyRiskSettings({
        inactivityThresholdDays: risk.inactivityThresholdDays,
        enableCompetitiveSignals: risk.enableCompetitiveSignals,
        enableChampionDormancy: championDormancy,
        enableStageStall: stageStall,
      });
      toast.success("Risk settings saved.");
      setInitialRisk(risk);
      setInitialChampionDormancy(championDormancy);
      setInitialStageStall(stageStall);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to save risk settings";
      toast.error(msg);
      setRiskError(msg);
    } finally {
      setSavingRisk(false);
    }
  };

  const discardRisk = () => {
    setRisk(initialRisk);
    setChampionDormancy(initialChampionDormancy);
    setStageStall(initialStageStall);
  };

  const refreshIntegrationStatuses = useCallback(async () => {
    const [statuses, logs] = await Promise.all([
      getAllIntegrationStatuses(),
      getIntegrationLogs(undefined, 10),
    ]);
    setIntegrationStatuses(statuses);
    setIntegrationLogs(logs);
  }, []);

  const oauthResultHandled = useRef(false);
  useEffect(() => {
    if (oauthResultHandled.current) return;

    const gmail = searchParams.get("gmail_connected");
    const calendar = searchParams.get("calendar_connected");
    const slack = searchParams.get("slack");
    const hubspot = searchParams.get("hubspot");
    const salesforce = searchParams.get("salesforce");
    const gmailError = searchParams.get("gmail_error");
    const calendarError = searchParams.get("calendar_error");
    const wantsIntegrationsTab = searchParams.get("tab") === "integrations";

    const connected =
      gmail === "1"
        ? "Gmail"
        : calendar === "1"
          ? "Google Calendar"
          : slack === "connected"
            ? "Slack"
            : hubspot === "connected"
              ? "HubSpot"
              : salesforce === "connected"
                ? "Salesforce"
                : null;

    const failed =
      gmailError
        ? "Gmail"
        : calendarError
          ? "Google Calendar"
          : slack && slack !== "connected"
            ? "Slack"
            : hubspot && hubspot !== "connected"
              ? "HubSpot"
              : salesforce && salesforce !== "connected"
                ? "Salesforce"
                : null;

    if (!connected && !failed && !wantsIntegrationsTab) return;
    oauthResultHandled.current = true;

    if (connected) {
      toast.success(`${connected} connected.`);
      void refreshIntegrationStatuses();
    } else if (failed) {
      toast.error(`Couldn't connect ${failed}. Please try again.`);
    }

    const anchorId =
      searchParams.get("panel") === "slack"
        ? "slack-integrations-panel"
        : "settings-integrations";
    window.setTimeout(() => {
      document
        .getElementById(anchorId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, PANEL_EXPAND_SCROLL_DELAY_MS);

    if (connected || failed) {
      router.replace("/settings?tab=integrations", { scroll: false });
    }
  }, [searchParams, router, refreshIntegrationStatuses]);

  const handleConnectSalesforce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !salesforceForm.instanceUrl.trim() ||
      !salesforceForm.consumerKey.trim() ||
      !salesforceForm.consumerSecret.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    setConnectingIntegration("salesforce");
    try {
      await connectSalesforce(
        salesforceForm.consumerKey.trim(),
        salesforceForm.consumerSecret.trim(),
        salesforceForm.instanceUrl.trim()
      );
      toast.success("Salesforce connected.");
      setConnectModal(null);
      setSalesforceForm({ instanceUrl: "", consumerKey: "", consumerSecret: "" });
      await refreshIntegrationStatuses();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to connect Salesforce");
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
      toast.success("HubSpot connected.");
      setConnectModal(null);
      setHubspotForm({ apiKey: "" });
      await refreshIntegrationStatuses();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to connect HubSpot");
    } finally {
      setConnectingIntegration(null);
    }
  };

  const handleConnect = (kind: NonNullable<ConnectModalKind>) => {
    if (kind === "google_calendar") {
      window.location.href = "/api/oauth/calendar/start";
      return;
    }
    if (kind === "hubspot") {
      window.location.href = "/api/integrations/hubspot/oauth/start";
      return;
    }
    setConnectModal(kind);
  };

  const handleSync = async (integration: string) => {
    setSyncingIntegration(integration);
    try {
      let result;
      if (integration === "salesforce") result = await syncSalesforceDeals();
      else if (integration === "hubspot") result = await syncHubSpotDeals();
      else if (integration === "googleCalendar")
        result = await syncCalendar();
      else if (integration === "gmail") result = await syncGmailSignals();
      toast.success(
        `Synced successfully. ${result?.synced ?? 0} items processed`
      );
      await refreshIntegrationStatuses();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncingIntegration(null);
    }
  };

  const handleDisconnect = (integration: NonNullable<ManageModalKind>) => {
    setDisconnectTarget(integration);
    setManageModal(null);
  };

  const handleCancelDisconnect = () => {
    if (disconnecting) return;
    setManageModal(disconnectTarget);
    setDisconnectTarget(null);
  };

  const handleConfirmDisconnect = async () => {
    const integration = disconnectTarget;
    if (!integration) return;
    setDisconnecting(true);
    try {
      if (integration === "salesforce") await disconnectSalesforce();
      else if (integration === "hubspot") await disconnectHubSpot();
      else if (integration === "googleCalendar")
        await disconnectGoogleCalendar();
      else if (integration === "gmail") await disconnectGmail();
      toast.success("Disconnected.");
      setDisconnectTarget(null);
      setManageModal(null);
      await refreshIntegrationStatuses();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to disconnect");
    } finally {
      setDisconnecting(false);
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
      } else if (
        integration === "googleCalendar" &&
        integrationStatuses?.googleCalendar
      ) {
        currentEnabled = integrationStatuses.googleCalendar.syncEnabled;
        await updateGoogleCalendarSettings({ syncEnabled: !currentEnabled });
      } else if (integration === "gmail" && integrationStatuses?.gmail) {
        currentEnabled = integrationStatuses.gmail.syncEnabled;
        await updateGmailSettings({ syncEnabled: !currentEnabled });
      }
      await refreshIntegrationStatuses();
      toast.success(`Auto-sync ${!currentEnabled ? "enabled" : "disabled"}.`);
    } catch {
      toast.error("Failed to update settings");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  };

  const openAddPaymentModal = () => {
    setAddCard({
      pan: "",
      expiry: "",
      cvc: "",
      name: "",
      setAsDefault: paymentMethods.length === 0,
    });
    setAddCardErrors({});
    setPaymentModal("add");
  };

  const openEditPaymentModal = (pm: PaymentMethodItem) => {
    setPaymentForm({
      brand: pm.brand,
      last4: pm.last4,
      expMonth: pm.expMonth,
      expYear: pm.expYear,
      setAsDefault: pm.isDefault,
    });
    setPaymentModal({ type: "edit", id: pm.id });
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.last4.trim()) {
      toast.error("Please enter the last 4 digits of your card.");
      return;
    }
    setSavingPayment(true);
    try {
      if (paymentModal === "add") {
        await addPaymentMethod({
          brand: paymentForm.brand,
          last4: paymentForm.last4,
          expMonth: paymentForm.expMonth,
          expYear: paymentForm.expYear,
          setAsDefault: paymentForm.setAsDefault,
        });
        toast.success("Payment method added.");
      } else if (paymentModal && paymentModal.type === "edit") {
        await updatePaymentMethod(paymentModal.id, {
          brand: paymentForm.brand,
          last4: paymentForm.last4,
          expMonth: paymentForm.expMonth,
          expYear: paymentForm.expYear,
        });
        toast.success("Payment method updated.");
      }
      setPaymentModal(null);
      const list = await getPaymentMethods();
      setPaymentMethods(list);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to save payment method."
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const digits = addCard.pan.replace(/\D/g, "");
    const brand = detectBrand(digits);
    const errs: { pan?: string; expiry?: string; cvc?: string } = {};

    if (!digits) {
      errs.pan = "Card number is required.";
    } else if (!brand) {
      errs.pan = "We can't recognise that card brand.";
    } else if (!isPanValidForBrand(digits, brand)) {
      errs.pan = luhnValid(digits)
        ? `${brand.label} numbers are ${brand.panLengths.join(" or ")} digits.`
        : "That card number doesn't check out.";
    }

    const parsed = parseExpiry(addCard.expiry);
    if (!parsed) {
      errs.expiry = "Use MM/YY.";
    } else if (!isExpiryFuture(parsed.month, parsed.year)) {
      errs.expiry = "That expiry is in the past.";
    }

    const cvc = addCard.cvc.replace(/\D/g, "");
    if (brand) {
      if (cvc.length !== brand.cvcLength) {
        errs.cvc = `${brand.label} CVC is ${brand.cvcLength} digits.`;
      }
    } else if (cvc.length < 3 || cvc.length > 4) {
      errs.cvc = "CVC is 3 or 4 digits.";
    }

    setAddCardErrors(errs);
    if (Object.keys(errs).length > 0 || !brand || !parsed) return;

    setSavingPayment(true);
    try {
      await addPaymentMethod({
        brand: brand.key,
        last4: digits.slice(-4),
        expMonth: parsed.month,
        expYear: parsed.year,
        setAsDefault: addCard.setAsDefault,
      });
      toast.success(`${brand.label} ending in ${digits.slice(-4)} added.`);
      setPaymentModal(null);
      const list = await getPaymentMethods();
      setPaymentMethods(list);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save payment method."
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const handleRemovePaymentClick = (id: string) => {
    setRemovingPaymentId(id);
    setShowRemovePayment(true);
  };

  const handleConfirmRemovePayment = async () => {
    if (!removingPaymentId) return;
    try {
      await removePaymentMethod(removingPaymentId);
      toast.success("Payment method removed.");
      setShowRemovePayment(false);
      setRemovingPaymentId(null);
      setPaymentMethods(await getPaymentMethods());
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to remove payment method."
      );
    }
  };

  const handleSetDefaultPayment = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      toast.success("Default payment method updated.");
      setPaymentMethods(await getPaymentMethods());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to set default.");
    }
  };

  const handleCancelSubscription = () => {
    const subject = encodeURIComponent("Subscription cancellation request");
    const body = encodeURIComponent(
      `Hi,\n\nPlease cancel the Sentinel subscription on the account associated with this email.\n\nAccount: ${user?.primaryEmailAddress?.emailAddress ?? "(not signed in)"
      }\nUser ID: ${user?.id ?? "(unknown)"}\n\nThanks.`
    );
    window.location.href = `mailto:help@sentinels.in?subject=${subject}&body=${body}`;
    setShowCancelDialog(false);
    toast.message(
      "We just opened your email client. Send the message and we'll process the cancellation within 1 business day."
    );
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Type "DELETE" to confirm');
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch("/api/user/delete", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete account");
      if (user) await user.delete();
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete account. Please try again.");
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const connectedCount = useMemo(() => {
    if (!integrationStatuses) return 0;
    let n = 0;
    if (integrationStatuses.salesforce?.connected) n++;
    if (integrationStatuses.hubspot?.connected) n++;
    if (integrationStatuses.googleCalendar?.connected) n++;
    if (integrationStatuses.slack?.connected) n++;
    if (integrationStatuses.gmail?.connected) n++;
    return n;
  }, [integrationStatuses]);

  const activeNotificationChannels = useMemo(() => {
    return [
      notifications.emailAlerts,
      notifications.riskAlerts,
      notifications.weeklyDigest,
      notifications.dealUpdates,
    ].filter(Boolean).length;
  }, [notifications]);

  return (
    <>
      <SettingsHero
        issueMark="§ Set."
        accountLine="ACCOUNT"
        subLine="& PREFERENCES"
        versionLine="v1.0 · 2026"
        planName={planName + "."}
        planTag={planTag}
        planSub={planTag === "FREE" ? "for solo operators" : "your current plan"}
        dealsUsed={dealsCount}
        dealsLimit={DEAL_LIMIT}
        upgradeHref={isPaidPlan ? undefined : "/pricing"}
        onUpgrade={() => router.push("/pricing")}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) auto",
          padding: "0 32px",
          borderBottom: "1px solid var(--rule)",
          background: "var(--ink)",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <div
          style={{
            padding: "16px 24px 16px 0",
            borderRight: "1px solid var(--rule)",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          § A / <b style={{ color: "var(--cream)", fontWeight: 500 }}>ACCOUNT</b>
        </div>
        <div
          style={{
            padding: "16px 24px",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--cream)",
          }}
        >
          All preferences, in one place
        </div>
        <div
          style={{
            padding: "16px 0",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          AUTOSAVE{" "}
          <b style={{ color: "var(--ivy)", fontWeight: 500 }}>ON</b>
        </div>
      </div>

      <div
        className="sentinel-settings-body"
        style={{
          display: "grid",
          gridTemplateColumns: "260px minmax(0, 1fr)",
          minHeight: 0,
        }}
      >
        <SettingsNav sections={NAV_SECTIONS} />

        <section style={{ padding: 32, minWidth: 0 }}>
          <ProfileAndSecuritySection
            profile={profile}
            onChange={setProfile}
            avatarPreview={avatarPreview}
            fileInputRef={fileInputRef}
            onImageUpload={handleImageUpload}
            initials={getInitials()}
            joinedLabel={joinedLabel}
            dirty={profileDirty}
            saving={savingProfile}
            onSave={saveProfile}
            onDiscard={discardProfile}
            twoFactorEnabled={user?.twoFactorEnabled ?? false}
            onOpenUserProfile={() => openUserProfile()}
          />

          <NotificationsSection
            value={notifications}
            onChange={setNotifications}
            activeChannels={activeNotificationChannels}
            dirty={notificationsDirty}
            saving={savingNotifications}
            onSave={saveNotifications}
            onDiscard={discardNotifications}
          />

          <RiskSection
            value={risk}
            onChange={setRisk}
            error={riskError}
            onErrorChange={setRiskError}
            championDormancy={championDormancy}
            onChampionDormancyChange={setChampionDormancy}
            stageStall={stageStall}
            onStageStallChange={setStageStall}
            dirty={riskDirty}
            saving={savingRisk}
            onSave={saveRisk}
            onDiscard={discardRisk}
          />

          <IntegrationsSection
            statuses={integrationStatuses}
            loading={loadingStatuses}
            connectedCount={connectedCount}
            logs={integrationLogs}
            onConnect={handleConnect}
            onManage={setManageModal}
            slackPanelExpanded={slackPanelExpanded}
            onSlackPanelExpandedChange={setSlackPanelExpanded}
            onRevealSlack={revealSlackPanel}
          />

          <TeamSection
            planName={planName}
            teamMemberLimit={TEAM_MEMBER_LIMIT}
            teamMembersCount={teamMembersCount}
            onInvite={() => setShowInviteModal(true)}
          />

          <BillingSection
            planTag={planTag}
            planName={planName}
            planPriceDisplay={planPriceDisplay}
            isPaidPlan={isPaidPlan}
            dealsCount={dealsCount}
            dealLimit={DEAL_LIMIT}
            teamMembersCount={teamMembersCount}
            teamMemberLimit={TEAM_MEMBER_LIMIT}
            apiCallsDisplay={apiCallsDisplay}
            paymentMethods={paymentMethods}
            loadingPaymentMethods={loadingPaymentMethods}
            onAddPaymentMethod={openAddPaymentModal}
            onEditPaymentMethod={openEditPaymentModal}
            onRemovePaymentMethod={handleRemovePaymentClick}
            onSetDefaultPaymentMethod={handleSetDefaultPayment}
            onCancelSubscription={() => setShowCancelDialog(true)}
          />

          <DangerZoneSection
            onRequestDelete={() => {
              setDeleteConfirmText("");
              setShowDeleteDialog(true);
            }}
          />
        </section>
      </div>

      {showInviteModal && (
        <InviteMemberDialog
          email={inviteEmail}
          onEmailChange={setInviteEmail}
          role={inviteRole}
          onRoleChange={setInviteRole}
          sending={sendingInvite}
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInvite}
        />
      )}

      {connectModal === "salesforce" && (
        <ConnectSalesforceDialog
          form={salesforceForm}
          onFormChange={setSalesforceForm}
          connecting={connectingIntegration === "salesforce"}
          onClose={() => setConnectModal(null)}
          onSubmit={handleConnectSalesforce}
        />
      )}

      {connectModal === "hubspot" && (
        <ConnectHubSpotDialog
          apiKey={hubspotForm.apiKey}
          onApiKeyChange={(next) => setHubspotForm({ apiKey: next })}
          connecting={connectingIntegration === "hubspot"}
          onClose={() => setConnectModal(null)}
          onSubmit={handleConnectHubSpot}
        />
      )}

      {connectModal === "gmail" && (
        <ConnectGmailDialog
          onClose={() => setConnectModal(null)}
          onContinue={() => {
            window.location.href = "/api/oauth/gmail/start";
          }}
        />
      )}


      {manageModal && (
        <ManageIntegrationDialog
          kind={manageModal}
          statuses={integrationStatuses}
          syncingIntegration={syncingIntegration}
          onToggleAutoSync={handleToggleAutoSync}
          onSync={handleSync}
          onDisconnect={handleDisconnect}
          onClose={() => setManageModal(null)}
        />
      )}

      {disconnectTarget && (
        <DisconnectIntegrationDialog
          label={DISCONNECT_LABELS[disconnectTarget] ?? disconnectTarget}
          disconnecting={disconnecting}
          onClose={handleCancelDisconnect}
          onConfirm={handleConfirmDisconnect}
        />
      )}

      {paymentModal === "add" && (
        <EditorialModal
          onClose={() => !savingPayment && setPaymentModal(null)}
          title="Add payment method."
          subtitle={
            <>
              Enter a card the way you&apos;d expect —{" "}
              <SerifEm>your full number and CVC never leave this browser</SerifEm>.
            </>
          }
        >
          <AddCardForm
            value={addCard}
            onChange={setAddCard}
            errors={addCardErrors}
            onErrorsChange={setAddCardErrors}
            saving={savingPayment}
            onSubmit={handleAddCardSubmit}
            onCancel={() => !savingPayment && setPaymentModal(null)}
            isFirstCard={paymentMethods.length === 0}
          />
        </EditorialModal>
      )}

      {paymentModal && paymentModal !== "add" && (
        <EditPaymentDialog
          form={paymentForm}
          onFormChange={setPaymentForm}
          saving={savingPayment}
          onClose={() => setPaymentModal(null)}
          onSubmit={handleSavePayment}
        />
      )}

      {showRemovePayment && (
        <RemovePaymentDialog
          onClose={() => {
            setShowRemovePayment(false);
            setRemovingPaymentId(null);
          }}
          onConfirm={handleConfirmRemovePayment}
        />
      )}

      {showCancelDialog && (
        <CancelSubscriptionDialog
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancelSubscription}
        />
      )}

      {showDeleteDialog && (
        <DeleteAccountDialog
          confirmText={deleteConfirmText}
          onConfirmTextChange={setDeleteConfirmText}
          deleting={deleting}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </>
  );
}

interface AddCardFormValue {
  pan: string;
  expiry: string;
  cvc: string;
  name: string;
  setAsDefault: boolean;
}

interface AddCardFormProps {
  value: AddCardFormValue;
  onChange: (
    next: AddCardFormValue | ((prev: AddCardFormValue) => AddCardFormValue)
  ) => void;
  errors: { pan?: string; expiry?: string; cvc?: string };
  onErrorsChange: (next: {
    pan?: string;
    expiry?: string;
    cvc?: string;
  }) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isFirstCard: boolean;
}

function AddCardForm({
  value,
  onChange,
  errors,
  onErrorsChange,
  saving,
  onSubmit,
  onCancel,
  isFirstCard,
}: AddCardFormProps) {
  const digits = value.pan.replace(/\D/g, "");
  const brand = detectBrand(digits);
  const formatted = formatPan(digits, brand);
  const cvcMax = brand ? brand.cvcLength : 4;
  const panComplete = brand ? brand.panLengths.includes(digits.length) : false;
  const panLooksGood = panComplete && luhnValid(digits);

  const clearError = (key: "pan" | "expiry" | "cvc") => {
    if (errors[key]) {
      const next = { ...errors };
      delete next[key];
      onErrorsChange(next);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
      autoComplete="on"
    >
      <CardPreview
        brand={brand}
        panDisplay={formatted}
        expiry={value.expiry}
        name={value.name}
      />

      <Field
        label="Card number"
        note={
          brand ? (
            <span style={{ color: "var(--cream-2)" }}>{brand.label}</span>
          ) : undefined
        }
      >
        <div style={{ position: "relative" }}>
          <EditorialInput
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 1234 1234 1234"
            value={formatted}
            onChange={(e) => {
              const raw = e.target.value;
              const next = detectBrand(raw);
              onChange((v) => ({ ...v, pan: formatPan(raw, next) }));
              clearError("pan");
            }}
            invalid={Boolean(errors.pan)}
            style={{
              fontFamily: "var(--font-mono-jb)",
              letterSpacing: "0.08em",
              paddingRight: 44,
            }}
            maxLength={23}
          />
          {panLooksGood && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--ivy)",
                fontFamily: "var(--font-mono-jb)",
                fontSize: 14,
              }}
            >
              ✓
            </span>
          )}
        </div>
        {errors.pan && <FieldError>{errors.pan}</FieldError>}
      </Field>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <Field label="Expires">
          <EditorialInput
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM / YY"
            value={value.expiry}
            onChange={(e) => {
              onChange((v) => ({ ...v, expiry: formatExpiry(e.target.value) }));
              clearError("expiry");
            }}
            invalid={Boolean(errors.expiry)}
            style={{
              fontFamily: "var(--font-mono-jb)",
              letterSpacing: "0.12em",
            }}
            maxLength={5}
          />
          {errors.expiry && <FieldError>{errors.expiry}</FieldError>}
        </Field>
        <Field
          label="CVC"
          note={
            brand ? (
              <span style={{ color: "var(--cream-4)" }}>
                {brand.cvcLength} digits
              </span>
            ) : undefined
          }
        >
          <EditorialInput
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder={brand?.cvcLength === 4 ? "1234" : "123"}
            value={value.cvc}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, cvcMax);
              onChange((v) => ({ ...v, cvc: d }));
              clearError("cvc");
            }}
            invalid={Boolean(errors.cvc)}
            style={{
              fontFamily: "var(--font-mono-jb)",
              letterSpacing: "0.18em",
            }}
            maxLength={cvcMax}
          />
          {errors.cvc && <FieldError>{errors.cvc}</FieldError>}
        </Field>
      </div>

      <Field
        label="Cardholder name"
        note={
          <span style={{ color: "var(--cream-4)" }}>Optional, not stored</span>
        }
      >
        <EditorialInput
          type="text"
          autoComplete="cc-name"
          placeholder="As printed on the card"
          value={value.name}
          onChange={(e) => onChange((v) => ({ ...v, name: e.target.value }))}
        />
      </Field>

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: isFirstCard ? "var(--cream-3)" : "var(--cream-2)",
          cursor: isFirstCard ? "default" : "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={value.setAsDefault}
          disabled={isFirstCard}
          onChange={(e) =>
            onChange((v) => ({ ...v, setAsDefault: e.target.checked }))
          }
          style={{ accentColor: "var(--signal)" }}
        />
        {isFirstCard
          ? "This will be your default card"
          : "Set as default payment method"}
      </label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          border: "1px solid var(--rule)",
          background: "var(--ink-03)",
        }}
      >
        <span
          aria-hidden
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 11,
            color: "var(--signal)",
            letterSpacing: "0.08em",
          }}
        >
          ◐
        </span>
        <span
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: 11.5,
            color: "var(--cream-3)",
            lineHeight: 1.5,
          }}
        >
          Billing is handled securely through PayPal. Sentinel never sees your
          full card number or CVC - only the brand and last four, so you can
          tell which card is on file.
        </span>
      </div>

      <ModalActions>
        <EditorialButton
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </EditorialButton>
        <EditorialButton
          type="submit"
          variant="primary"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save card ⏎"}
        </EditorialButton>
      </ModalActions>
    </form>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontSize: 12.5,
        color: "var(--wine)",
        marginTop: 2,
      }}
    >
      {children}
    </div>
  );
}

function CardPreview({
  brand,
  panDisplay,
  expiry,
  name,
}: {
  brand: BrandMeta | null;
  panDisplay: string;
  expiry: string;
  name: string;
}) {
  const groups = brand?.groups ?? [4, 4, 4, 4];
  const placeholder = groups
    .map((g) => "•".repeat(g))
    .join(" ");
  const display = panDisplay || placeholder;
  const brandLabel = brand?.label ?? "Card";

  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        border: "1px solid var(--rule-strong)",
        background:
          "linear-gradient(135deg, var(--ink-02) 0%, var(--ink-03) 100%)",
        padding: "18px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -1,
          left: 16,
          width: 32,
          height: 2,
          background: "var(--signal)",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          § - NEW CARD
        </span>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 15,
            color: brand ? "var(--cream)" : "var(--cream-4)",
            letterSpacing: "-0.01em",
            transition: "color 160ms ease",
          }}
        >
          {brandLabel}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 17,
          letterSpacing: "0.14em",
          color: panDisplay ? "var(--cream)" : "var(--cream-4)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {display}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 8.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--cream-4)",
              marginBottom: 2,
            }}
          >
            Cardholder
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 13,
              color: name ? "var(--cream-2)" : "var(--cream-4)",
              fontStyle: name ? "normal" : "italic",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name || "Your name"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 8.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--cream-4)",
              marginBottom: 2,
            }}
          >
            Expires
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 13,
              color: expiry ? "var(--cream-2)" : "var(--cream-4)",
              letterSpacing: "0.1em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {expiry || "MM / YY"}
          </div>
        </div>
      </div>
    </div>
  );
}
