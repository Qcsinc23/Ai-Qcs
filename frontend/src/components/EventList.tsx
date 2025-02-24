import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


import { Event, eventService } from "../utils/supabase";
import { EventStatusBadge } from "./EventStatusBadge";
import { MoreHorizontal, Plus } from "lucide-react";

export function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadEvents();
    const subscription = eventService.subscribeToEvents(() => {
      loadEvents();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadEvents() {
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load events");
      if (error instanceof Error && error.message.includes("does not exist")) {
        toast.error("Events table not found. Please make sure to run the database setup SQL.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventService.deleteEvent(id);
      toast.success("Event deleted successfully");
      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[180px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Button onClick={() => navigate("/new-event")}>
          <Plus className="h-4 w-4 mr-2" /> New Event
        </Button>
      </div>

      <div className="border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id} className="hover:bg-primary/[0.02] transition-colors">
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.client}</TableCell>
                  <TableCell>
                    {format(new Date(event.start_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    <EventStatusBadge status={event.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{event.contact_name}</div>
                      <div className="text-muted-foreground">
                        {event.contact_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => navigate(`/event-details?id=${event.id}`)}
                        >
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/edit-event?id=${event.id}`)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
