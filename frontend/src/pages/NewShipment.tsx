import { ShipmentForm } from "../components/ShipmentForm";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { CreateShipmentDTO, shipmentService } from "../utils/supabase";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function NewShipment() {
  const handleSubmit = async (shipment: CreateShipmentDTO) => {
    try {
      console.log('Creating shipment:', shipment);
      await shipmentService.createShipment(shipment);
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  };

  return (
    <main className="container mx-auto py-6 space-y-6">
      <Breadcrumbs />
      <h1 className="text-3xl font-bold">Create New Shipment</h1>
      <ErrorBoundary>
        <ShipmentForm onSubmit={handleSubmit} />
      </ErrorBoundary>
    </main>
  );
}
