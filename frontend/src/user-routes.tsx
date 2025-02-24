
import { lazy } from "react";
import { RouteObject } from "react-router";
import { AuthGuard } from "./components/AuthGuard";

const App = lazy(() => import("./pages/App.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const EditEvent = lazy(() => import("./pages/EditEvent.tsx"));
const EditInventory = lazy(() => import("./pages/EditInventory.tsx"));
const EditShipment = lazy(() => import("./pages/EditShipment.tsx"));
const EventDetails = lazy(() => import("./pages/EventDetails.tsx"));
const Events = lazy(() => import("./pages/Events.tsx"));
const Inventory = lazy(() => import("./pages/Inventory.tsx"));
const NewEvent = lazy(() => import("./pages/NewEvent.tsx"));
const NewInventory = lazy(() => import("./pages/NewInventory.tsx"));
const NewShipment = lazy(() => import("./pages/NewShipment.tsx"));
const ShipmentDetails = lazy(() => import("./pages/ShipmentDetails.tsx"));
const Shipments = lazy(() => import("./pages/Shipments.tsx"));
const SignIn = lazy(() => import("./pages/SignIn.tsx"));
const SignUp = lazy(() => import("./pages/SignUp.tsx"));

// Public routes
const publicRoutes: RouteObject[] = [
  { path: "/", element: <App /> },
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
];

// Protected routes
const protectedRoutes: RouteObject[] = [
  { path: "/dashboard", element: <AuthGuard><Dashboard /></AuthGuard> },
  { path: "/edit-event", element: <AuthGuard><EditEvent /></AuthGuard> },
  { path: "/edit-inventory", element: <AuthGuard><EditInventory /></AuthGuard> },
  { path: "/edit-shipment", element: <AuthGuard><EditShipment /></AuthGuard> },
  { path: "/event-details", element: <AuthGuard><EventDetails /></AuthGuard> },
  { path: "/events", element: <AuthGuard><Events /></AuthGuard> },
  { path: "/inventory", element: <AuthGuard><Inventory /></AuthGuard> },
  { path: "/new-event", element: <AuthGuard><NewEvent /></AuthGuard> },
  { path: "/new-inventory", element: <AuthGuard><NewInventory /></AuthGuard> },
  { path: "/new-shipment", element: <AuthGuard><NewShipment /></AuthGuard> },
  { path: "/shipment-details", element: <AuthGuard><ShipmentDetails /></AuthGuard> },
  { path: "/shipments", element: <AuthGuard><Shipments /></AuthGuard> },
];

export const userRoutes: RouteObject[] = [...publicRoutes, ...protectedRoutes];
