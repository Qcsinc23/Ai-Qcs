import { Badge } from "@/components/ui/badge";

interface Props {
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

export function EventStatusBadge({ status }: Props) {
  const variants = {
    pending: "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-600/20 hover:bg-amber-50",
    active: "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-50",
    completed: "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/20 hover:bg-blue-50",
    cancelled: "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-600/20 hover:bg-rose-50",
  };

  return (
    <Badge
      variant="outline"
      className={`${variants[status]} border-none capitalize`}
    >
      {status}
    </Badge>
  );
}
