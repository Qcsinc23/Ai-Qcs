import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { InventoryForm } from "@/components/InventoryForm";
import { CreateInventoryDTO, Inventory, inventoryService } from "../utils/supabase";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function EditInventory() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');
  const [item, setItem] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/inventory");
      return;
    }
    loadItem();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadItem() {
    try {
      const data = await inventoryService.getItem(id!);
      setItem(data);
    } catch (error) {
      console.error("Error loading item:", error);
      toast.error("Failed to load item");
      navigate("/inventory");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: CreateInventoryDTO) {
    try {
      await inventoryService.updateItem(id!, data);
      toast.success("Item updated successfully");
      navigate("/inventory");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  }

  if (loading) {
    return <div>Loading item...</div>;
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="container py-6">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-6">Edit Inventory Item</h1>
      <div className="max-w-3xl">
        <InventoryForm initialData={item} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
