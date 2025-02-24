import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { ShipmentStatusBadge } from "../components/ShipmentStatusBadge";
import { ShipmentHistory } from "../components/ShipmentHistory";
import { ShipmentActions } from "../components/ShipmentActions";
import { Shipment, shipmentService, Event, eventService, Inventory, inventoryService } from "../utils/supabase";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function ShipmentDetails() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const shipmentData = await shipmentService.getShipment(id);
        setShipment(shipmentData);

        // Load associated data in parallel
        const promises = [];

        if (shipmentData.event_id) {
          promises.push(
            eventService.getEvent(shipmentData.event_id)
              .then(eventData => setEvent(eventData))
              .catch(error => console.error("Error loading event:", error))
          );
        }

        if (shipmentData.inventory_items?.length) {
          promises.push(
            inventoryService.getItems()
              .then(items => {
                const selectedItems = items.filter(item => 
                  shipmentData.inventory_items?.includes(item.id)
                );
                setInventory(selectedItems);
              })
              .catch(error => console.error("Error loading inventory:", error))
          );
        }

        await Promise.all(promises);
      } catch (error) {
        console.error("Error loading shipment:", error);
        setError("Failed to load shipment details. Please try again.");
        toast.error("Failed to load shipment details");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to shipment updates
    const subscription = shipmentService.subscribeToShipments((updatedShipment) => {
      if (updatedShipment.id === id) {
        setShipment(updatedShipment);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const handleStatusUpdate = async (status: Shipment["status"]) => {
    if (!shipment) return;

    try {
      await shipmentService.updateShipment(shipment.id, { status });
      toast.success("Shipment status updated");
    } catch (error) {
      console.error("Error updating shipment status:", error);
      toast.error("Failed to update shipment status");
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading shipment details...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !shipment) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-destructive mb-4">
            {error || "Shipment not found"}
          </div>
          <Button onClick={() => navigate("/shipments")} variant="outline">
            Back to Shipments
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <main className="container mx-auto py-6 space-y-6">
      <Breadcrumbs />
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/shipments")}
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold">Shipment Details</h1>
        </div>
        <div className="flex items-center space-x-4">
          <ShipmentStatusBadge status={shipment.status} />
          <ShipmentActions shipment={shipment} onUpdate={() => setShipment(null)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tracking Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Tracking Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Tracking Number:</span>
              <span>{shipment.tracking_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Service Type:</span>
              <span className="capitalize">
                {shipment.service_type.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Created At:</span>
              <span>
                {new Date(shipment.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Package Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Package Information</h2>
          <div className="space-y-2">
            {shipment.package_weight && (
              <div className="flex justify-between">
                <span className="font-medium">Weight:</span>
                <span>{shipment.package_weight} kg</span>
              </div>
            )}
            {shipment.package_dimensions && (
              <div className="flex justify-between">
                <span className="font-medium">Dimensions:</span>
                <span>{shipment.package_dimensions}</span>
              </div>
            )}
            {shipment.special_instructions && (
              <div className="space-y-1">
                <span className="font-medium">Special Instructions:</span>
                <p className="text-gray-600">
                  {shipment.special_instructions}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Addresses */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Pickup Address</h2>
          <p className="text-gray-600 whitespace-pre-line">
            {shipment.pickup_address}
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Delivery Address</h2>
          <p className="text-gray-600 whitespace-pre-line">
            {shipment.delivery_address}
          </p>
        </Card>

        {/* Inventory Items */}
        {inventory.length > 0 && (
          <Card className="p-6 space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold">Inventory Items</h2>
            <div className="space-y-2">
              {inventory.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.sku}</div>
                  </div>
                  <div className="text-sm">
                    {item.stock_level} in stock
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tracking History */}
        <Card className="p-6 space-y-4 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tracking History</h2>
            <ShipmentActions shipment={shipment} onUpdate={() => setShipment(null)} hideViewAction />
          </div>
          <ShipmentHistory shipment={shipment} />
        </Card>

        {/* Associated Event */}
        {event && (
          <Card className="p-6 space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold">Associated Event</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Event Title:</span>
                <span>{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Event Date:</span>
                <span>
                  {new Date(event.start_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Venue:</span>
                <span>{event.venue}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
