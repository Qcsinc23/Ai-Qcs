import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shipment, shipmentService } from "../utils/supabase";

interface Props {
  shipment: Shipment;
  onUpdate?: () => void;
  hideViewAction?: boolean;
}

interface Props {
  shipment: Shipment;
  onUpdate?: () => void;
  hideViewAction?: boolean;
}

type StatusTransition = {
  from: Shipment["status"];
  to: Shipment["status"];
  label: string;
  requiresNotes?: boolean;
  confirmationMessage?: string;
};

const STATUS_TRANSITIONS: StatusTransition[] = [
  {
    from: "processing",
    to: "picked_up",
    label: "Mark as Picked Up",
    requiresNotes: true,
    confirmationMessage: "Are you sure you want to mark this shipment as picked up?",
  },
  {
    from: "picked_up",
    to: "in_transit",
    label: "Mark as In Transit",
    requiresNotes: true,
    confirmationMessage: "Are you sure you want to mark this shipment as in transit?",
  },
  {
    from: "in_transit",
    to: "out_for_delivery",
    label: "Mark as Out for Delivery",
    requiresNotes: true,
    confirmationMessage:
      "Are you sure you want to mark this shipment as out for delivery?",
  },
  {
    from: "out_for_delivery",
    to: "delivered",
    label: "Mark as Delivered",
    requiresNotes: true,
    confirmationMessage: "Are you sure you want to mark this shipment as delivered?",
  },
  {
    from: "*",
    to: "delayed",
    label: "Mark as Delayed",
    requiresNotes: true,
    confirmationMessage: "Are you sure you want to mark this shipment as delayed?",
  },
];

export function ShipmentActions({ shipment, onUpdate, hideViewAction }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<StatusTransition | null>(null);
  const [notes, setNotes] = useState("");

  // Get available transitions for current status
  const availableTransitions = STATUS_TRANSITIONS.filter(
    (transition) =>
      (transition.from === "*" || transition.from === shipment.status) &&
      transition.to !== shipment.status
  );

  const handleStatusUpdate = async () => {
    if (!selectedTransition) return;

    setLoading(true);
    try {
      await shipmentService.updateShipmentStatus(shipment.id, {
        status: selectedTransition.to,
        notes: notes.trim(),
      });
      toast.success("Shipment status updated");
      setSelectedTransition(null);
      setNotes("");
      onUpdate?.();
    } catch (error) {
      console.error("Error updating shipment status:", error);
      toast.error("Failed to update shipment status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!hideViewAction && (
            <DropdownMenuItem onSelect={() => navigate(`/shipment-details?id=${shipment.id}`)}>View Details</DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => navigate(`/edit-shipment?id=${shipment.id}`)}>
            Edit Details
          </DropdownMenuItem>
          {availableTransitions.map((transition) => (
            <DropdownMenuItem
              key={transition.to}
              onSelect={() => setSelectedTransition(transition)}
            >
              {transition.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!selectedTransition} onOpenChange={() => setSelectedTransition(null)}>
        {selectedTransition && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTransition.label}</DialogTitle>
              <DialogDescription>
                {selectedTransition.confirmationMessage}
              </DialogDescription>
            </DialogHeader>

            {selectedTransition.requiresNotes && (
              <div className="space-y-2">
                <label
                  htmlFor="notes"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Enter any relevant notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedTransition(null)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={loading}>
                {loading ? "Updating..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
