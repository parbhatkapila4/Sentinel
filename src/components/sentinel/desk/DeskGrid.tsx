import { TopDealsTable } from "./TopDealsTable";
import { GlobeColumn } from "./GlobeColumn";
import { MeetingsList } from "./MeetingsList";

interface DeskGridProps {
  topDeals: Array<{
    id: string;
    name: string;
    segment?: string;
    stage: string;
    value: number;
  }>;
  countryPins: Array<{ country: string; count: number }>;
  meetings: Array<{
    id: string;
    title: string;
    startTime: Date;
    endTime?: Date;
    location?: string | null;
    meetingLink?: string | null;
    attendees?: string[];
    associatedDealName?: string | null;
  }>;
  calendarConnected: boolean;
}

export function DeskGrid(props: DeskGridProps) {
  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr] pt-8 pb-12 lg:pt-11 lg:pb-16 px-6 sm:px-10 lg:px-14"
      style={{
        gap: 0,
      }}
      aria-label="The desk"
    >
      <div className="border-b pb-10 lg:border-b-0 lg:pb-0 lg:pr-8 lg:border-r" style={{ borderColor: "var(--rule)" }}>
        <TopDealsTable deals={props.topDeals} />
      </div>
      <div className="py-10 lg:py-0 lg:px-8 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "var(--rule)" }}>
        <GlobeColumn pins={props.countryPins} />
      </div>
      <div className="pt-10 lg:pt-0 lg:pl-8">
        <MeetingsList
          meetings={props.meetings}
          calendarConnected={props.calendarConnected}
        />
      </div>
    </section>
  );
}
