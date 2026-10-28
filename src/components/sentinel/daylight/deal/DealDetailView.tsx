"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteDeal, updateDealStage } from "@/app/actions/deals";
import {
  PageHero,
  RiskMark,
  kpiLabelStyle,
  kpiValueStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  unitStyle,
} from "../blocks";
import { ConfirmDialog } from "../ConfirmDialog";
import { SelectField } from "../controls";
import { STAGE_STEP_COUNT } from "../format";
import { StageSteps } from "../ui";
import { FollowUpDialog, type FollowUpDraft } from "./FollowUpDialog";
import { MeetingDialog } from "./MeetingDialog";
import {
  ActivitySection,
  DeleteSection,
  DetailsSection,
  ForecastSection,
  MeetingsSection,
  NextStepSection,
} from "./sections";
import { SummarySection } from "./SummarySection";
import { closedOutcome, dealStageLabel, stageChoices, type DealView, type MeetingView } from "./model";

type DialogKind = "email" | "meeting" | "delete";

interface DialogState {
  kind: DialogKind;
  host: Element;
  trigger: HTMLElement | null;
}

const captionStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 12.5,
  color: "var(--dl-muted)",
};

function ClosedSteps({ outcome }: { outcome: "won" | "lost" }) {
  return (
    <div
      role="img"
      aria-label={outcome === "won" ? "Closed won" : "Closed lost"}
      style={{ display: "flex", gap: 3, marginTop: 8 }}
    >
      {Array.from({ length: STAGE_STEP_COUNT }, (_, i) => (
        <span
          key={i}
          style={{
            width: 18,
            height: 3,
            borderRadius: 2,
            background: outcome === "won" ? "var(--dl-green)" : "var(--dl-guide)",
          }}
        />
      ))}
    </div>
  );
}

export interface DealDetailViewProps {
  view: DealView;
  initialSummary?: string;
  loadSummary?: (dealId: string) => Promise<string>;
  initialDialog?: "email" | "meeting";
  initialDraft?: FollowUpDraft;
}

export function DealDetailView({
  view,
  initialSummary,
  loadSummary,
  initialDialog,
  initialDraft,
}: DealDetailViewProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [addedMeetings, setAddedMeetings] = useState<MeetingView[]>([]);

  const [pendingStage, setPendingStage] = useState<string | null>(null);
  const [savingStage, setSavingStage] = useState(false);
  const [seenStage, setSeenStage] = useState(view.stage);
  if (seenStage !== view.stage) {
    setSeenStage(view.stage);
    setPendingStage(null);
  }
  const stage = pendingStage ?? view.stage;
  const outcome = closedOutcome(stage);

  const open = (kind: DialogKind, trigger: HTMLElement | null) => {
    const host = (trigger ?? rootRef.current)?.closest(".sentinel-daylight");
    if (!host) return;
    setDeleteError(null);
    setDialog({ kind, host, trigger });
  };

  useEffect(() => {
    if (initialDialog) open(initialDialog, null);
  }, []);

  async function changeStage(next: string) {
    if (next === stage || savingStage) return;
    setPendingStage(next);
    setSavingStage(true);
    try {
      await updateDealStage(view.id, next);
      toast.success(`Moved to ${dealStageLabel(next)}`);
      router.refresh();
    } catch (err) {
      setPendingStage(null);
      toast.error(
        err instanceof Error && err.message
          ? `The stage did not change: ${err.message}`
          : "The stage did not change. Try again."
      );
    } finally {
      setSavingStage(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteDeal(view.id);
      setDialog(null);
      router.push("/deals");
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error && err.message ? err.message : "The deal could not be deleted. Try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  const meetings = [
    ...view.meetings,
    ...addedMeetings.filter((m) => !view.meetings.some((v) => v.id === m.id)),
  ].sort((a, b) => a.startMs - b.startMs);

  return (
    <div ref={rootRef} className="dl-fill">
      <PageHero
        label="Deal"
        back={{ href: "/deals", label: "All deals" }}
        chip={view.hero.chips}
        headline={view.name}
        clause={view.hero.clause}
        deck={view.hero.deck}
        actions={
          <>
            <button
              type="button"
              onClick={(e) => open("email", e.currentTarget)}
              className="dl-btn-primary"
              style={primaryButtonStyle}
            >
              Draft follow-up
            </button>
            <button
              type="button"
              onClick={(e) => open("meeting", e.currentTarget)}
              className="dl-btn-secondary"
              style={secondaryButtonStyle}
            >
              Add meeting
            </button>
          </>
        }
      />

      <div className="dl-grid" aria-label="At a glance" role="group">
        <div className="dl-kpi dl-quarter">
          <label htmlFor={`deal-stage-${view.id}`} style={{ ...kpiLabelStyle, display: "block" }}>
            Stage
          </label>
          <SelectField
            id={`deal-stage-${view.id}`}
            value={stage}
            disabled={savingStage}
            aria-busy={savingStage || undefined}
            onChange={(e) => void changeStage(e.target.value)}
          >
            {stageChoices(view.stage).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
          {outcome ? <ClosedSteps outcome={outcome} /> : <StageSteps stage={stage} marginTop={8} />}
        </div>
        <div className="dl-kpi dl-quarter">
          <div style={kpiLabelStyle}>Value</div>
          <div className="dl-kpi-value" style={kpiValueStyle}>
            {view.valueText}
          </div>
          <div style={captionStyle}>{view.kpis.valueCaption}</div>
        </div>
        <div className="dl-kpi dl-quarter">
          <div style={kpiLabelStyle}>Risk score</div>
          <div className="dl-kpi-value" style={kpiValueStyle}>
            {view.kpis.riskPercent}
            <span style={unitStyle}>%</span>
          </div>
          <div style={captionStyle}>
            <RiskMark tier={view.kpis.riskTier} label={view.kpis.riskCaption} />
          </div>
        </div>
        <div className="dl-kpi dl-quarter">
          <div style={kpiLabelStyle}>Last activity</div>
          <div className="dl-kpi-value" style={kpiValueStyle}>
            {view.kpis.lastActivity}
          </div>
          <div style={captionStyle}>{view.kpis.lastActivityCaption}</div>
        </div>
      </div>

      <div className="dl-grid dl-grow">
        <div className="dl-two-thirds dl-dd-col">
          <NextStepSection step={view.nextStep} />
          <SummarySection dealId={view.id} initialSummary={initialSummary} load={loadSummary} />
          <ActivitySection dealId={view.id} entries={view.activity} />
        </div>
        <div className="dl-third dl-dd-col">
          <ForecastSection forecast={view.forecast} />
          <MeetingsSection
            meetings={meetings}
            calendarConnected={view.calendarConnected}
            onAdd={(trigger) => open("meeting", trigger)}
          />
          <DetailsSection details={view.details} grow={view.isDemo} />
          {!view.isDemo && <DeleteSection onDelete={(trigger) => open("delete", trigger)} />}
        </div>
      </div>

      {dialog?.kind === "email" && (
        <FollowUpDialog
          host={dialog.host}
          returnFocus={dialog.trigger}
          dealId={view.id}
          dealName={view.name}
          sub={view.emailSub}
          initialDraft={initialDraft}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "meeting" && (
        <MeetingDialog
          host={dialog.host}
          returnFocus={dialog.trigger}
          dealId={view.id}
          dealName={view.name}
          onAdded={(meeting) => {
            setDialog(null);
            if (meeting.startMs >= Date.now()) {
              setAddedMeetings((list) => [...list, meeting]);
            }
            toast.success("Meeting added");
            router.refresh();
          }}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "delete" && (
        <ConfirmDialog
          host={dialog.host}
          kicker="Delete deal"
          title={
            <>
              Delete <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>{view.name}</em>?
            </>
          }
          body="The deal goes, along with its timeline, events and risk history. This cannot be undone."
          requireText="DELETE"
          confirmLabel="Delete deal"
          busyLabel="Deleting"
          busy={deleting}
          error={deleteError}
          returnFocus={dialog.trigger}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
