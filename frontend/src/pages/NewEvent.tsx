import { EventForm } from "components/EventForm";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function NewEvent() {
  return (
    <div className="container py-6">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-6">New Event</h1>
      <EventForm />
    </div>
  );
}
