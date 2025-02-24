import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  CalendarDays,
  Package,
  TrendingUp,
  Truck,
  DollarSign,
  Users,
  Clock,
} from "lucide-react";

import { MetricCard } from "../components/MetricCard";
import { ActivityFeed } from "../components/ActivityFeed";
import { CalendarView } from "../components/CalendarView";
import { Activity, Event, activityService, eventService } from "../utils/supabase";

const sampleChartData = [
  { name: "Jan", events: 40, deliveries: 24 },
  { name: "Feb", events: 30, deliveries: 13 },
  { name: "Mar", events: 20, deliveries: 38 },
  { name: "Apr", events: 27, deliveries: 39 },
  { name: "May", events: 18, deliveries: 48 },
  { name: "Jun", events: 23, deliveries: 38 },
  { name: "Jul", events: 34, deliveries: 43 },
];

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [activitiesData, eventsData] = await Promise.all([
          activityService.getActivities(),
          eventService.getEvents(),
        ]);

        setActivities(activitiesData || []);
        setEvents(eventsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Subscribe to real-time updates
    const activitySubscription = activityService.subscribeToActivities(
      (activity) => {
        setActivities((prev) => [activity, ...(prev || [])]);
      }
    );

    const eventSubscription = eventService.subscribeToEvents((event) => {
      setEvents((prev) => {
        const index = prev.findIndex((e) => e.id === event.id);
        if (index >= 0) {
          const newEvents = [...prev];
          newEvents[index] = event;
          return newEvents;
        }
        return [event, ...prev];
      });
    });

    return () => {
      activitySubscription.unsubscribe();
      eventSubscription.unsubscribe();
    };
  }, []);

  const activeEvents = events.filter((event) => event.status === "active").length;
  const pendingEvents = events.filter((event) => event.status === "pending").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricCard
            title="Active Events"
            value={activeEvents}
            description="Events in progress"
            icon={<CalendarDays className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricCard
            title="Pending Events"
            value={pendingEvents}
            description="Events awaiting start"
            icon={<CalendarDays className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MetricCard
            title="Scheduled Deliveries"
            value="12"
            description="Deliveries this week"
            icon={<Truck className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MetricCard
            title="Inventory Value"
            value="$24,500"
            description="Total value of items"
            icon={<Package className="h-4 w-4" />}
          />
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Events & Deliveries Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Events & Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sampleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="events" fill="#3b82f6" name="Events" />
                    <Bar dataKey="deliveries" fill="#10b981" name="Deliveries" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sampleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="events"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} loading={loading} error={error} />
      </div>

      {/* Calendar Section */}
      <CalendarView events={events} />
    </div>
  );
}
