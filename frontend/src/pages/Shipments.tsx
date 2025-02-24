import { ShipmentList } from "../components/ShipmentList";

export default function Shipments() {
  return (
    <main className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Shipment Management</h1>
      <ShipmentList />
    </main>
  );
}
