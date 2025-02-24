import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShipmentForm } from "../components/ShipmentForm";
import { CreateShipmentDTO, Shipment, shipmentService } from "../utils/supabase";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function EditShipment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShipment = async () => {
      if (!id) return;
      try {
        const data = await shipmentService.getShipment(id);
        setShipment(data);
      } catch (error) {
        console.error("Error loading shipment:", error);
      } finally {
        setLoading(false);
      }
    };

    loadShipment();
  }, [id]);

  const handleSubmit = async (data: CreateShipmentDTO) => {
    if (!id) return;
    await shipmentService.updateShipment(id, data);
  };

  if (loading) {
    return (
      <main className="container mx-auto py-6 space-y-6">
      <Breadcrumbs />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading shipment...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!shipment) {
    return (
      <main className="container mx-auto py-6 space-y-6">
        <div className="text-center py-8">
          <div className="text-destructive mb-4">
            Shipment not found
          </div>
          <Button onClick={() => navigate("/shipments")} variant="outline">
            Back to Shipments
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Edit Shipment</h1>
      <ShipmentForm
        shipment={shipment}
        onSubmit={handleSubmit}
        submitLabel="Update Shipment"
      />
    </main>
  );
}
