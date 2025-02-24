import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShipmentStatusBadge } from "./ShipmentStatusBadge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Shipment, shipmentService } from "../utils/supabase";

export function ShipmentList() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Shipment>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadShipments();

    // Subscribe to shipment changes
    const subscription = shipmentService.subscribeToShipments((shipment) => {
      setShipments((prev) => {
        const index = prev.findIndex((s) => s.id === shipment.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = shipment;
          return updated;
        }
        return [shipment, ...prev];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter and sort shipments
  const filteredShipments = useMemo(() => {
    return shipments
      .filter((shipment) => {
        const matchesSearch = 
          shipment.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
          shipment.delivery_address.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = 
          statusFilter === "all" || shipment.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return sortDirection === "asc" 
          ? (aValue > bValue ? 1 : -1)
          : (bValue > aValue ? 1 : -1);
      });
  }, [shipments, search, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Shipment) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const loadShipments = async () => {
    try {
      const data = await shipmentService.getShipments();
      setShipments(data);
    } catch (error) {
      console.error("Error loading shipments:", error);
      setError("Failed to load shipments. Please try again.");
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Shipment["status"]) => {
    try {
      await shipmentService.updateShipment(id, { status });
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
            <p className="text-muted-foreground">Loading shipments...</p>
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
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Shipments</h2>
          <Button onClick={() => navigate("/new-shipment")}>
            New Shipment
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by tracking number or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Filter by Status</Label>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("tracking_number")} className="cursor-pointer hover:bg-accent">
              Tracking Number {sortField === "tracking_number" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead onClick={() => handleSort("service_type")} className="cursor-pointer hover:bg-accent">
              Service Type {sortField === "service_type" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead onClick={() => handleSort("status")} className="cursor-pointer hover:bg-accent">
              Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead onClick={() => handleSort("delivery_address")} className="cursor-pointer hover:bg-accent">
              Delivery Address {sortField === "delivery_address" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead onClick={() => handleSort("created_at")} className="cursor-pointer hover:bg-accent">
              Created At {sortField === "created_at" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredShipments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No shipments found
              </TableCell>
            </TableRow>
          ) : (
            filteredShipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="font-medium">
                  {shipment.tracking_number}
                </TableCell>
                <TableCell className="capitalize">
                  {shipment.service_type.replace("_", " ")}
                </TableCell>
                <TableCell>
                  <ShipmentStatusBadge status={shipment.status} />
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {shipment.delivery_address}
                </TableCell>
                <TableCell>
                  {new Date(shipment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/shipment/${shipment.id}`)
                        }
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/edit-shipment/${shipment.id}`)
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      {/* Status Update Options */}
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusUpdate(shipment.id, "picked_up")
                        }
                        disabled={shipment.status !== "processing"}
                      >
                        Mark as Picked Up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusUpdate(shipment.id, "in_transit")
                        }
                        disabled={shipment.status !== "picked_up"}
                      >
                        Mark as In Transit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusUpdate(shipment.id, "out_for_delivery")
                        }
                        disabled={shipment.status !== "in_transit"}
                      >
                        Mark as Out for Delivery
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusUpdate(shipment.id, "delivered")
                        }
                        disabled={shipment.status !== "out_for_delivery"}
                      >
                        Mark as Delivered
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusUpdate(shipment.id, "delayed")
                        }
                        disabled={shipment.status === "delivered"}
                      >
                        Mark as Delayed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
