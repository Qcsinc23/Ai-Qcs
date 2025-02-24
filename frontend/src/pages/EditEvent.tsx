import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { EventForm } from "components/EventForm";
import { CreateEventDTO, Event, eventService } from "../utils/supabase";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function EditEvent() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/events");
      return;
    }
    loadEvent();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadEvent() {
    try {
      const data = await eventService.getEvent(id!);
      setEvent(data);
    } catch (error) {
      console.error("Error loading event:", error);
      toast.error("Failed to load event");
      navigate("/events");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: CreateEventDTO) {
    try {
      await eventService.updateEvent(id!, data);
      toast.success("Event updated successfully");
      navigate(`/event-details?id=${id}`);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  }

  if (loading) {
    return <div>Loading event...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container py-6">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <EventForm initialData={event} onSubmit={handleSubmit} />
    </div>
  );
}
