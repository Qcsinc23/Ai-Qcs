import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { CreateInventoryDTO, Inventory } from "../utils/supabase";

const inventoryFormSchema = z.object({
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(20, "SKU must be at most 20 characters")
    .regex(/^[A-Za-z0-9-]+$/, "SKU must only contain letters, numbers, and hyphens"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  category: z.string().max(50, "Category must be at most 50 characters").optional(),
  stock_level: z.coerce
    .number()
    .min(0, "Stock level must be at least 0")
    .max(999999, "Stock level must be at most 999,999"),
  unit_price: z.coerce
    .number()
    .min(0, "Unit price must be at least 0")
    .max(999999.99, "Unit price must be at most 999,999.99")
    .optional(),
  is_pi_item: z.boolean(),
  low_stock_threshold: z.coerce
    .number()
    .min(0, "Low stock threshold must be at least 0")
    .max(999999, "Low stock threshold must be at most 999,999")
    .optional(),
});

type Props = {
  initialData?: Inventory;
  onSubmit: (data: CreateInventoryDTO) => Promise<void>;
};

export function InventoryForm({ initialData, onSubmit }: Props) {
  const form = useForm<z.infer<typeof inventoryFormSchema>>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      sku: initialData?.sku || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      stock_level: initialData?.stock_level || 0,
      unit_price: initialData?.unit_price || undefined,
      is_pi_item: initialData?.is_pi_item || false,
      low_stock_threshold: initialData?.low_stock_threshold || undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* SKU */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter SKU"
                    {...field}
                    disabled={!!initialData}
                  />
                </FormControl>
                <FormDescription>
                  Unique identifier for the item (e.g., PRJ-001)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stock Level */}
          <FormField
            control={form.control}
            name="stock_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Level</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter stock level"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit Price */}
          <FormField
            control={form.control}
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter unit price"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Low Stock Threshold */}
          <FormField
            control={form.control}
            name="low_stock_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter low stock threshold"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Alert when stock level falls below this number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter description"
                  className="h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PI Item */}
        <FormField
          control={form.control}
          name="is_pi_item"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    PI Item
                  </div>
                </FormLabel>
                <FormDescription>
                  Mark this item as a PI (Perpetual Inventory) item
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? "Update Item" : "Add Item"}
        </Button>
      </form>
    </Form>
  );
}
