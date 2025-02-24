import { EventList } from "components/EventList";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function Events() {
  return (
    <div className="container py-6">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      <EventList />
    </div>
  );
}
