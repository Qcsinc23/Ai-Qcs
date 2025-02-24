
import { EventDetails as EventDetailsComponent } from "components/EventDetails";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function EventDetails() {
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');

  if (!id) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container py-6">
      <Breadcrumbs />
      <EventDetailsComponent eventId={id} />
    </div>
  );
}
