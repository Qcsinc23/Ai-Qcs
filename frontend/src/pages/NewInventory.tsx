import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { InventoryForm } from "@/components/InventoryForm";
import { CreateInventoryDTO, inventoryService } from "../utils/supabase";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function NewInventory() {
  const navigate = useNavigate();

  async function handleSubmit(data: CreateInventoryDTO) {
    try {
      await inventoryService.createItem(data);
      toast.success("Item added successfully");
      navigate("/inventory");
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    }
  }

  return (
    <div className="container py-6">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-6">Add Inventory Item</h1>
      <div className="max-w-3xl">
        <InventoryForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
