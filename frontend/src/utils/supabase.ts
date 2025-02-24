import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umoowjntqpslcjbhhgst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtb293am50cXBzbGNqYmhoZ3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTQxNjcsImV4cCI6MjA1NDk5MDE2N30.AOF2AeD7YqTq3tPByXjq_LTT_u_0p8NAHQanpN7V7aY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Activity types
export interface Activity {
  id: string;
  description: string;
  type: 'event' | 'delivery' | 'inventory' | 'user';
  created_at: string;
  updated_at: string;
}

export interface CreateActivityDTO {
  description: string;
  type: 'event' | 'delivery' | 'inventory' | 'user';
}

// Activity service functions
export const activityService = {
  // Create a new activity
  async createActivity(activity: CreateActivityDTO) {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single();

    if (error) throw error;
    return data as Activity;
  },

  // Get all activities
  async getActivities() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Activity[];
  },

  // Subscribe to activity changes
  subscribeToActivities(callback: (activity: Activity) => void) {
    return supabase
      .channel('activities_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        (payload) => {
          callback(payload.new as Activity);
        }
      )
      .subscribe();
  },
};

// Event types
export interface Event {
  id: string;
  title: string;
  client: string;
  start_date: string;
  end_date: string;
  venue: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateEventDTO {
  title: string;
  client: string;
  start_date: string;
  end_date: string;
  venue: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  description?: string;
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
}

// Event service functions
// Inventory types
export interface Inventory {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  stock_level: number;
  unit_price?: number;
  is_pi_item: boolean;
  low_stock_threshold?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryDTO {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  stock_level: number;
  unit_price?: number;
  is_pi_item: boolean;
  low_stock_threshold?: number;
}

// Inventory service functions
export const inventoryService = {
  // Check for low stock and create notification
  async checkLowStock(item: Inventory) {
    if (
      item.low_stock_threshold &&
      item.stock_level <= item.low_stock_threshold
    ) {
      await notificationService.createNotification({
        title: "Low Stock Alert",
        message: `${item.name} is running low on stock (${item.stock_level} remaining)`,
        type: "warning",
      });
    }
  },
  // Create a new inventory item
  async createItem(item: CreateInventoryDTO) {
    const { data, error } = await supabase
      .from('inventory')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    const newItem = data as Inventory;
    await this.checkLowStock(newItem);
    return newItem;
  },

  // Get all inventory items
  async getItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Inventory[];
  },

  // Get a single inventory item by ID
  async getItem(id: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Inventory;
  },

  // Update an inventory item
  async updateItem(id: string, updates: Partial<CreateInventoryDTO>) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const updatedItem = data as Inventory;
    await this.checkLowStock(updatedItem);
    return updatedItem;
  },

  // Delete an inventory item
  async deleteItem(id: string) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to inventory changes
  subscribeToInventory(callback: (item: Inventory) => void) {
    return supabase
      .channel('inventory_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          callback(payload.new as Inventory);
        }
      )
      .subscribe();
  },
};

// Shipment types
export interface Shipment {
  id: string;
  tracking_number: string;
  service_type: 'standard' | 'express' | 'same-day';
  pickup_address: string;
  delivery_address: string;
  package_weight?: number;
  package_dimensions?: string;
  special_instructions?: string;
  event_id?: string;
  inventory_items: string[];
  status: 'processing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed';
  created_at: string;
  updated_at: string;
}

export interface CreateShipmentDTO {
  tracking_number?: string; // Optional as it will be generated
  service_type: 'standard' | 'express' | 'same-day';
  pickup_address: string;
  delivery_address: string;
  package_weight?: number;
  package_dimensions?: string;
  special_instructions?: string;
  event_id?: string;
  inventory_items: string[];
  status?: 'processing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed';
}

// Shipment service functions
export const shipmentService = {
  // Generate tracking number
  generateTrackingNumber() {
    const prefix = 'QCS';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  },

  // Create a new shipment
  async createShipment(shipment: CreateShipmentDTO) {
    console.log('Creating shipment with data:', shipment);
    // Ensure inventory_items is always an array
    const inventory_items = Array.isArray(shipment.inventory_items) ? shipment.inventory_items : [];
    const shipmentWithTracking = {
      ...shipment,
      tracking_number: shipment.tracking_number || this.generateTrackingNumber(),
      status: shipment.status || 'processing',
      inventory_items
    };

    console.log('Inserting shipment with data:', shipmentWithTracking);
    const { data, error } = await supabase
      .from('shipments')
      .insert([shipmentWithTracking])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
    
    console.log('Created shipment:', data);

    if (error) throw error;
    return data as Shipment;
  },

  // Get all shipments
  async getShipments() {
    console.log('Fetching shipments...');
    try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shipments:', error);
      throw error;
    }
    console.log('Fetched shipments:', data);
    return data as Shipment[];
    } catch (error) {
      console.error('Error in getShipments:', error);
      throw error;
    }
  },

  // Get a single shipment by ID
  async getShipment(id: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Shipment;
  },

  // Get a shipment by tracking number
  async getShipmentByTracking(trackingNumber: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .single();

    if (error) throw error;
    return data as Shipment;
  },

  // Create notification for shipment status update
  async createShipmentNotification(shipment: Shipment, oldStatus?: string) {
    const statusMessages = {
      processing: "Shipment is being processed",
      picked_up: "Shipment has been picked up",
      in_transit: "Shipment is in transit",
      out_for_delivery: "Shipment is out for delivery",
      delivered: "Shipment has been delivered",
      delayed: "Shipment has been delayed",
    };

    await notificationService.createNotification({
      title: `Shipment ${shipment.tracking_number} Update`,
      message: statusMessages[shipment.status],
      type: shipment.status === "delayed" ? "warning" : "info",
    });
  },

  // Update shipment status with history tracking
  async updateShipmentStatus(id: string, update: { status: Shipment['status']; notes?: string }) {
    console.log('Updating shipment status:', { id, update });
    
    // Get current shipment to append to history
    const { data: currentShipment, error: fetchError } = await supabase
      .from('shipments')
      .select('special_instructions')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current shipment:', fetchError);
      throw fetchError;
    }

    // Create history entry
    const timestamp = new Date().toISOString();
    const historyEntry = `${timestamp}: ${update.status.toUpperCase()}${update.notes ? ` - ${update.notes}` : ''}`;
    const updatedInstructions = currentShipment.special_instructions
      ? `${historyEntry}\n${currentShipment.special_instructions}`
      : historyEntry;

    // Update shipment
    const { data, error } = await supabase
      .from('shipments')
      .update({
        status: update.status,
        special_instructions: updatedInstructions,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating shipment status:', error);
      throw error;
    }

    console.log('Updated shipment:', data);
    const updatedShipment = data as Shipment;
    await this.createShipmentNotification(updatedShipment);
    return updatedShipment;
  },

  // Update a shipment
  async updateShipment(id: string, updates: Partial<CreateShipmentDTO>) {
    const { data, error } = await supabase
      .from('shipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Shipment;
  },

  // Delete a shipment
  async deleteShipment(id: string) {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to shipments changes
  subscribeToShipments(callback: (shipment: Shipment) => void) {
    return supabase
      .channel('shipments_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        (payload) => {
          callback(payload.new as Shipment);
        }
      )
      .subscribe();
  },
};

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationDTO {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

// Notification service functions
export const notificationService = {
  // Create a new notification
  async createNotification(notification: CreateNotificationDTO) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...notification, read: false }])
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  // Get all notifications
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  },

  // Mark notification as read
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
      .select();

    if (error) throw error;
    return data as Notification[];
  },

  // Delete a notification
  async deleteNotification(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  },
};

export const eventService = {
  // Create notification for event
  async createEventNotification(event: Event, action: 'created' | 'updated' | 'cancelled') {
    const actionMessages = {
      created: `New event "${event.title}" has been created`,
      updated: `Event "${event.title}" has been updated`,
      cancelled: `Event "${event.title}" has been cancelled`,
    };

    await notificationService.createNotification({
      title: `Event ${action}`,
      message: actionMessages[action],
      type: action === 'cancelled' ? 'warning' : 'info',
    });
  },
  // Create a new event
  async createEvent(event: CreateEventDTO) {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    const newEvent = data as Event;
    await this.createEventNotification(newEvent, 'created');
    return newEvent;
  },

  // Get all events
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data as Event[];
  },

  // Get a single event by ID
  async getEvent(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Event;
  },

  // Update an event
  async updateEvent(id: string, updates: Partial<CreateEventDTO>) {
    // Check if event is being cancelled
    const isBeingCancelled = updates.status === 'cancelled';
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const updatedEvent = data as Event;
    await this.createEventNotification(
      updatedEvent,
      isBeingCancelled ? 'cancelled' : 'updated'
    );
    return updatedEvent;
  },

  // Delete an event
  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to events changes
  subscribeToEvents(callback: (event: Event) => void) {
    return supabase
      .channel('events_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          callback(payload.new as Event);
        }
      )
      .subscribe();
  },
};
