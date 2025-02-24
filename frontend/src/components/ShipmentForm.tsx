import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectItems } from "./MultiSelectItems";
import {
  CreateShipmentDTO,
  Shipment,
  shipmentService,
  Event,
  eventService,
  Inventory,
  inventoryService,
} from "../utils/supabase";

interface Props {
  shipment?: Shipment;
  onSubmit: (shipment: CreateShipmentDTO) => Promise<void>;
  submitLabel?: string;
}

export function ShipmentForm({ shipment, onSubmit, submitLabel = "Create Shipment" }: Props) {
  console.log('Rendering ShipmentForm with props:', { shipment, submitLabel });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  console.log('Initializing ShipmentForm with shipment:', shipment);
  const [formData, setFormData] = useState<CreateShipmentDTO>({
    service_type: shipment?.service_type || "standard",
    pickup_address: shipment?.pickup_address || "",
    delivery_address: shipment?.delivery_address || "",
    package_weight: shipment?.package_weight,
    package_dimensions: shipment?.package_dimensions || "",
    special_instructions: shipment?.special_instructions || "",
    event_id: shipment?.event_id,
    inventory_items: Array.isArray(shipment?.inventory_items) ? shipment.inventory_items : [],
    status: shipment?.status || "processing",
  });

  useEffect(() => {
    // Load events and inventory
    const loadData = async () => {
    console.log('Loading events and inventory data...');
      setLoadingData(true);
      setError(null);
      try {
        const [eventsData, inventoryData] = await Promise.all([
          eventService.getEvents(),
          inventoryService.getItems(),
        ]);
        setEvents(eventsData.sort((a, b) => a.title.localeCompare(b.title)));
        setInventory(inventoryData.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load events and inventory. Please try again.");
        toast.error("Failed to load events and inventory");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const eventSubscription = eventService.subscribeToEvents((event) => {
      setEvents((current) => {
        const updated = current.filter((e) => e.id !== event.id);
        return [...updated, event].sort((a, b) => a.title.localeCompare(b.title));
      });
    });

    const inventorySubscription = inventoryService.subscribeToInventory((item) => {
      setInventory((current) => {
        const updated = current.filter((i) => i.id !== item.id);
        return [...updated, item].sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    // Cleanup subscriptions
    return () => {
      eventSubscription.unsubscribe();
      inventorySubscription.unsubscribe();
    };
  }, []);

  // Validate form data
  const validateForm = () => {
    console.log('Validating form data:', formData);
    if (!formData.service_type) return "Service type is required";
    if (!formData.pickup_address.trim()) return "Pickup address is required";
    if (!formData.delivery_address.trim()) return "Delivery address is required";
    if (formData.package_weight && formData.package_weight <= 0) return "Package weight must be greater than 0";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Submitting form with data:', formData);
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      toast.success(shipment ? "Shipment updated" : "Shipment created");
      navigate("/shipments");
    } catch (error) {
      console.error("Error submitting shipment:", error);
      setError("Failed to save shipment. Please try again.");
      toast.error("Failed to save shipment");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading shipment data...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-destructive mb-4">{error}</div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as Shipment['status'] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type</Label>
            <Select
              value={formData.service_type}
              onValueChange={(value) =>
                setFormData({ ...formData, service_type: value as CreateShipmentDTO['service_type'] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="same-day">Same Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Addresses */}
          <div className="space-y-2">
            <Label htmlFor="pickup_address">Pickup Address</Label>
            <Textarea
              id="pickup_address"
              value={formData.pickup_address}
              onChange={(e) =>
                setFormData({ ...formData, pickup_address: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_address">Delivery Address</Label>
            <Textarea
              id="delivery_address"
              value={formData.delivery_address}
              onChange={(e) =>
                setFormData({ ...formData, delivery_address: e.target.value })
              }
              required
            />
          </div>

          {/* Package Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="package_weight">Package Weight (kg)</Label>
              <Input
                id="package_weight"
                type="number"
                step="0.1"
                value={formData.package_weight || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    package_weight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="package_dimensions">Package Dimensions</Label>
              <Input
                id="package_dimensions"
                placeholder="L x W x H"
                value={formData.package_dimensions}
                onChange={(e) =>
                  setFormData({ ...formData, package_dimensions: e.target.value })
                }
              />
            </div>
          </div>

          {/* Event Selection */}
          <div className="space-y-2">
            <Label htmlFor="event_id">Associated Event (Optional)</Label>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events available
              </p>
            ) : (
              <Select
                value={formData.event_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, event_id: value === "none" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} ({new Date(event.start_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Inventory Items */}
          <div className="space-y-2">
            <Label htmlFor="inventory_items">Inventory Items (Optional)</Label>
            {inventory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No inventory items available
              </p>
            ) : (
              <MultiSelectItems
                options={inventory.map((item) => ({
                  value: item.id,
                  label: `${item.name} (${item.stock_level} in stock)`,
                }))}
                selected={Array.isArray(formData.inventory_items) ? formData.inventory_items : []}
                onChange={(values) =>
                  setFormData({
                    ...formData,
                    inventory_items: values,
                  })
                }
                placeholder="Select inventory items..."
              />
            )}
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  special_instructions: e.target.value,
                })
              }
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/shipments")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
