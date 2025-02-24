import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "../utils/supabase";

interface Props {
  events: Event[];
}

export function CalendarView({ events }: Props) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Convert events to dates for the calendar
  const eventDates = events.map((event) => new Date(event.start_date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{
            event: eventDates,
          }}
          modifiersStyles={{
            event: {
              fontWeight: "bold",
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
