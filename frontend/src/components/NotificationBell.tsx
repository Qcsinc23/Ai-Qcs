import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotificationStore } from "../utils/store";
import { NotificationCenter } from "./NotificationCenter";
import { useEffect } from "react";
import { notificationService } from "../utils/supabase";

export function NotificationBell() {
  const { unreadCount, addNotification, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    // Fetch notifications on mount
    fetchNotifications();

    // Subscribe to new notifications
    const subscription = notificationService.subscribeToNotifications((notification) => {
      addNotification(notification);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchNotifications, addNotification]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white grid place-items-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <NotificationCenter onClose={() => {}} />
      </PopoverContent>
    </Popover>
  );
}
