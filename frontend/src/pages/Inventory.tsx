import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Package, Plus, Search } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



import { Inventory, inventoryService } from "../utils/supabase";

export default function InventoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [piFilter, setPiFilter] = useState<string>("");

  useEffect(() => {
    loadItems();

    // Subscribe to inventory changes
    const subscription = inventoryService.subscribeToInventory((item) => {
      setItems((prev) => {
        const index = prev.findIndex((i) => i.id === item.id);
        if (index >= 0) {
          const newItems = [...prev];
          newItems[index] = item;
          return newItems;
        }
        return [item, ...prev];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadItems() {
    try {
      const data = await inventoryService.getItems();
      setItems(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  // Get unique categories for filter
  const categories = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean))
  ).sort();

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "" || item.category === categoryFilter;

    const matchesPi =
      piFilter === "" ||
      (piFilter === "pi" && item.is_pi_item) ||
      (piFilter === "non-pi" && !item.is_pi_item);

    return matchesSearch && matchesCategory && matchesPi;
  });

  return (
    <div className="container py-6 space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button onClick={() => navigate("/new-inventory")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={piFilter} onValueChange={setPiFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="pi">PI Items</SelectItem>
            <SelectItem value="non-pi">Non-PI Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Stock Level</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead>PI Item</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading inventory...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${
                        item.low_stock_threshold &&
                        item.stock_level <= item.low_stock_threshold
                          ? "text-destructive"
                          : ""
                      }`}
                    >
                      {item.stock_level}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.unit_price
                      ? `$${item.unit_price.toFixed(2)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {item.is_pi_item ? (
                      <Badge variant="default">
                        <Package className="h-3 w-3 mr-1" />
                        PI
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/edit-inventory?id=${item.id}`)
                      }
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
