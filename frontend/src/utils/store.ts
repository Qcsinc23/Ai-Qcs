import { create } from "zustand";
import { Notification, notificationService } from './supabase';
// Temporary auth state management until Clerk is implemented
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    // Temporary mock sign in
    setTimeout(() => {
      set({
        user: { id: '1', email, name: 'Test User' },
        loading: false
      });
    }, 1000);
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });
    // Temporary mock sign up
    setTimeout(() => {
      set({
        user: { id: '1', email, name: 'Test User' },
        loading: false
      });
    }, 1000);
  },

  signOut: async () => {
    set({ loading: true, error: null });
    // Temporary mock sign out
    setTimeout(() => {
      set({
        user: null,
        loading: false
      });
    }, 500);
  },

  clearError: () => set({ error: null }),
}));

// Initialize with no user
useAuthStore.setState({ user: null, loading: false });

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const notifications = await notificationService.getNotifications();
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        loading: false,
      });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const updatedNotification = await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? updatedNotification : n
        ),
        unreadCount: state.notifications.filter((n) => !n.read).length - 1,
      }));
    } catch (error) {
      set({ error: error as Error });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: error as Error });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: state.notifications.filter(
          (n) => !n.read && n.id !== id
        ).length,
      }));
    } catch (error) {
      set({ error: error as Error });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    }));
  },
}));
