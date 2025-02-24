import { Card } from "@/components/ui/card";
import { Shipment } from "../utils/supabase";

interface Props {
  shipment: Shipment;
}

interface HistoryEntry {
  timestamp: Date;
  status: string;
  notes?: string;
}

export function ShipmentHistory({ shipment }: Props) {
  // Parse history from special_instructions
  const parseHistory = (instructions?: string): HistoryEntry[] => {
    if (!instructions) return [];

    return instructions
      .split('\n')
      .map((line) => {
        const match = line.match(/^(.+?): ([A-Z_]+)(?:\s*-\s*(.+))?$/);
        if (!match) return null;

        const [, timestamp, status, notes] = match;
        return {
          timestamp: new Date(timestamp),
          status,
          notes,
        };
      })
      .filter((entry): entry is HistoryEntry => entry !== null);
  };

  const history = parseHistory(shipment.special_instructions);

  if (history.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No status history available
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Status History</h3>
      <div className="space-y-4">
        {history.map((entry, index) => (
          <div
            key={index}
            className="relative pl-6 pb-4 last:pb-0 border-l-2 border-muted last:border-l-0"
          >
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{entry.status}</span>
                <span className="text-sm text-muted-foreground">
                  {entry.timestamp.toLocaleString()}
                </span>
              </div>
              {entry.notes && (
                <p className="text-sm text-muted-foreground">{entry.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
