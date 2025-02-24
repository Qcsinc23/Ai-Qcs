import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Event, eventService } from "../utils/supabase";
import { EventStatusBadge } from "./EventStatusBadge";

interface Props {
  eventId: string;
}

export function EventDetails({ eventId }: Props) {
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadEvent() {
    try {
      const data = await eventService.getEvent(eventId);
      setEvent(data);
    } catch (error) {
      console.error("Error loading event:", error);
      toast.error("Failed to load event");
      navigate("/events");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await eventService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      navigate("/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  }

  async function handleStatusChange(newStatus: Event["status"]) {
    try {
      await eventService.updateEvent(eventId, { status: newStatus });
      toast.success("Event status updated");
      loadEvent();
    } catch (error) {
      console.error("Error updating event status:", error);
      toast.error("Failed to update event status");
    }
  }

  if (loading) {
    return <div>Loading event details...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="space-y-6 container py-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">{event.client}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/edit-event?id=${eventId}`)}>
            Edit
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Event</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this event? This action cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all hover:bg-primary/[0.02]">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium">Status</div>
              <div className="mt-1">
                <EventStatusBadge status={event.status} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Date & Time</div>
              <div className="mt-1">
                {format(new Date(event.start_date), "PPP")} -{" "}
                {format(new Date(event.end_date), "PPP")}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Venue</div>
              <div className="mt-1">{event.venue}</div>
            </div>
            {event.description && (
              <div>
                <div className="text-sm font-medium">Description</div>
                <div className="mt-1 whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex gap-2">
              {event.status === "pending" && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("active")}
                >
                  Start Event
                </Button>
              )}
              {event.status === "active" && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("completed")}
                >
                  Complete Event
                </Button>
              )}
              {(event.status === "pending" || event.status === "active") && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("cancelled")}
                >
                  Cancel Event
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:bg-primary/[0.02]">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium">Name</div>
              <div className="mt-1">{event.contact_name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="mt-1">
                <a
                  href={`mailto:${event.contact_email}`}
                  className="text-primary hover:underline"
                >
                  {event.contact_email}
                </a>
              </div>
            </div>
            {event.contact_phone && (
              <div>
                <div className="text-sm font-medium">Phone</div>
                <div className="mt-1">
                  <a
                    href={`tel:${event.contact_phone}`}
                    className="text-primary hover:underline"
                  >
                    {event.contact_phone}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
