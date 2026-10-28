import Link from "next/link";
import { addDays, format, isSameDay } from "date-fns";
import { fullCurrency } from "./format";
import { TABLE_MIN_WIDTH, TOP_DEALS_COLUMNS } from "./table-columns";
import {
  Chevron,
  CountPill,
  Monogram,
  StageSteps,
  cellSubStyle,
  cellTitleStyle,
  emptyStyle,
  tableHeadStyle,
} from "./ui";

interface TopDeal {
  id: string;
  name: string;
  segment?: string;
  stage: string;
  value: number;
}

interface MeetingItem {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  location?: string | null;
  meetingLink?: string | null;
  attendees?: string[];
  associatedDealName?: string | null;
}

interface DealsPanelProps {
  topDeals: TopDeal[];
  meetings: MeetingItem[];
  calendarConnected: boolean;
  now: Date;
}

function buildSampleMeetings(now: Date): MeetingItem[] {
  const at = (dayOffset: number, hour: number, minute: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  return [
    {
      id: "sample-1",
      title: "Discovery call",
      startTime: at(0, 10, 0),
      endTime: at(0, 10, 30),
      meetingLink: "https://meet.example.com/sample-1",
      associatedDealName: "Acme Retail",
    },
    {
      id: "sample-2",
      title: "Pricing review",
      startTime: at(0, 15, 30),
      endTime: at(0, 16, 15),
      meetingLink: "https://meet.example.com/sample-2",
      associatedDealName: "Northwind Logistics",
    },
    {
      id: "sample-3",
      title: "Technical deep-dive",
      startTime: at(1, 9, 0),
      endTime: at(1, 10, 0),
      meetingLink: "https://meet.example.com/sample-3",
      associatedDealName: "Contoso Energy",
    },
    {
      id: "sample-4",
      title: "Exec debrief",
      startTime: at(1, 14, 0),
      endTime: at(1, 14, 30),
      location: "Conference room B",
      associatedDealName: "Fabrikam Health",
    },
    {
      id: "sample-5",
      title: "Kickoff",
      startTime: at(2, 11, 0),
      endTime: at(2, 11, 30),
      meetingLink: "https://meet.example.com/sample-5",
      associatedDealName: "Initech",
    },
    {
      id: "sample-6",
      title: "Quarterly review",
      startTime: at(3, 16, 0),
      endTime: at(3, 16, 45),
      meetingLink: "https://meet.example.com/sample-6",
      associatedDealName: "Globex",
    },
  ];
}

function dayName(date: Date, now: Date): string {
  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, addDays(now, 1))) return "Tomorrow";
  return format(date, "EEEE");
}

function meetingDetail(m: MeetingItem): string {
  const parts: string[] = [];
  if (m.associatedDealName) parts.push(m.associatedDealName);
  parts.push(m.meetingLink ? "Video" : m.location ?? "In person");
  if (m.endTime) {
    const minutes = Math.max(
      0,
      Math.round((m.endTime.getTime() - m.startTime.getTime()) / 60000)
    );
    parts.push(`${minutes} min`);
  }
  return parts.join(" · ");
}

function groupByDay(meetings: MeetingItem[]) {
  const groups: Array<{ key: string; date: Date; items: MeetingItem[] }> = [];
  for (const m of meetings) {
    const key = format(m.startTime, "yyyy-MM-dd");
    const group = groups[groups.length - 1];
    if (group && group.key === key) {
      group.items.push(m);
    } else {
      groups.push({ key, date: m.startTime, items: [m] });
    }
  }
  return groups;
}

function TopDeals({ deals }: { deals: TopDeal[] }) {
  const top = deals.reduce((m, d) => Math.max(m, d.value), 0);

  return (
    <section
      aria-label="Top deals"
      className="dl-two-thirds"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        className="flex flex-wrap items-center justify-between"
        style={{ gap: "6px 16px", padding: "18px var(--dl-gutter) 14px" }}
      >
        <div className="flex flex-wrap items-center" style={{ gap: "4px 9px" }}>
          <h2 style={cellTitleStyle}>Top deals</h2>
          <CountPill>{deals.length}</CountPill>
          <span style={cellSubStyle}>Active, by value</span>
        </div>
        <Link
          href="/deals"
          className="dl-link inline-flex items-center"
          style={{ gap: 3, fontSize: 13, fontWeight: 500, color: "var(--dl-ink)" }}
        >
          View pipeline
          <Chevron />
        </Link>
      </div>
      {deals.length === 0 ? (
        <div
          style={{ ...emptyStyle, flex: 1, borderTop: "1px solid var(--dl-divider)" }}
        >
          No active deals.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              minWidth: TABLE_MIN_WIDTH,
            }}
          >
            <div style={{ ...tableHeadStyle, gridTemplateColumns: TOP_DEALS_COLUMNS }}>
              <span>#</span>
              <span>Deal</span>
              <span>Stage</span>
              <span>Size</span>
              <span style={{ textAlign: "right" }}>Value</span>
            </div>
            {deals.map((deal, i) => {
              const lead = i === 0;
              const width =
                top > 0 ? Math.max(2, Math.round((deal.value / top) * 100)) : 0;
              return (
                <div
                  key={deal.id}
                  className="dl-row"
                  style={{
                    display: "grid",
                    flex: 1,
                    gridTemplateColumns: TOP_DEALS_COLUMNS,
                    columnGap: 16,
                    alignItems: "center",
                    minHeight: 54,
                    maxHeight: "var(--dl-row-max)",
                    padding: "0 var(--dl-gutter)",
                    borderBottom:
                      i === deals.length - 1
                        ? undefined
                        : "1px solid var(--dl-row)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--dl-muted)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      minWidth: 0,
                    }}
                  >
                    <Monogram name={deal.name} />
                    <Link
                      href={`/deals/${deal.id}`}
                      className="dl-link"
                      style={{
                        minHeight: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--dl-ink)",
                      }}
                    >
                      {deal.name}
                    </Link>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--dl-text-2)" }}>
                      {deal.stage}
                    </div>
                    <StageSteps stage={deal.stage} marginTop={5} />
                  </div>
                  <div
                    style={{
                      height: 5,
                      borderRadius: 3,
                      background: "var(--dl-track)",
                    }}
                  >
                    <div
                      style={{
                        width: `${width}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: lead ? "var(--dl-ink)" : "var(--dl-bar)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fullCurrency(deal.value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function Meetings({
  meetings,
  calendarConnected,
  now,
}: {
  meetings: MeetingItem[];
  calendarConnected: boolean;
  now: Date;
}) {
  const isSample = !calendarConnected && meetings.length === 0;
  const shown = (isSample ? buildSampleMeetings(now) : meetings).slice(0, 6);
  const groups = groupByDay(shown);
  const subtitle = calendarConnected
    ? "From Google Calendar"
    : isSample
      ? "Sample agenda. Connect to go live."
      : "Calendar not connected";

  return (
    <section
      aria-label="Upcoming meetings"
      className="dl-third"
      style={{ padding: "18px var(--dl-gutter) 14px" }}
    >
      <div className="flex items-start justify-between" style={{ gap: 12 }}>
        <div>
          <h2 style={cellTitleStyle}>Upcoming meetings</h2>
          <p
            style={{
              ...cellSubStyle,
              marginTop: 1,
              color: isSample ? "var(--dl-amber-text)" : "var(--dl-muted)",
            }}
          >
            {subtitle}
          </p>
        </div>
        {calendarConnected && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              height: 24,
              padding: "0 9px",
              borderRadius: 7,
              background: "var(--dl-green-tint)",
              fontSize: 12.5,
              fontWeight: 500,
              color: "var(--dl-green-text)",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--dl-green)",
              }}
            />
            Live
          </span>
        )}
      </div>
      {shown.length === 0 ? (
        <p style={{ ...emptyStyle, padding: "20px 0" }}>No meetings scheduled.</p>
      ) : (
        <div style={{ opacity: isSample ? 0.85 : 1 }}>
          {groups.map((group, gi) => {
            const today = isSameDay(group.date, now);
            return (
              <div key={group.key}>
                <div
                  className="flex items-center"
                  style={{
                    gap: 10,
                    height: 28,
                    marginTop: gi === 0 ? 8 : 4,
                    fontSize: 12.5,
                    color: "var(--dl-muted)",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: today ? "var(--dl-ink)" : "var(--dl-text-2)",
                    }}
                  >
                    {dayName(group.date, now)}
                  </span>
                  <span
                    aria-hidden
                    style={{ flex: 1, height: 1, background: "var(--dl-row)" }}
                  />
                  <span>{format(group.date, "EEE d MMM")}</span>
                </div>
                {group.items.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "46px 3px minmax(0, 1fr)",
                      columnGap: 12,
                      padding: "7px 0",
                    }}
                  >
                    <span
                      style={{
                        alignSelf: "center",
                        fontFamily: "var(--dl-font-mono)",
                        fontSize: 13,
                        fontWeight: 500,
                        color: today ? "var(--dl-ink)" : "var(--dl-text-2)",
                      }}
                    >
                      {format(m.startTime, "HH:mm")}
                    </span>
                    <span
                      aria-hidden
                      style={{
                        borderRadius: 2,
                        background: today
                          ? "var(--dl-ink)"
                          : "var(--dl-border-strong)",
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {m.title}
                      </div>
                      <div style={cellSubStyle}>{meetingDetail(m)}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      {isSample && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--dl-row)",
            fontSize: 13,
            color: "var(--dl-muted)",
          }}
        >
          This is a preview.{" "}
          <Link
            href="/settings"
            className="dl-link"
            style={{
              fontWeight: 500,
              color: "var(--dl-signal-d)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Connect Google Calendar
          </Link>
        </div>
      )}
    </section>
  );
}

export function DealsPanel({
  topDeals,
  meetings,
  calendarConnected,
  now,
}: DealsPanelProps) {
  return (
    <div className="dl-grid dl-grow">
      <TopDeals deals={topDeals} />
      <Meetings
        meetings={meetings}
        calendarConnected={calendarConnected}
        now={now}
      />
    </div>
  );
}
