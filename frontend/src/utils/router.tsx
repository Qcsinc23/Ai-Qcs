import { UserGuard } from "app"
import { createBrowserRouter } from "react-router-dom"
import { Suspense, lazy } from "react"
import { mode, Mode, APP_BASE_PATH } from "app"

const App = lazy(() => import("../pages/App.tsx"))
const Dashboard = lazy(() => import("../pages/Dashboard.tsx"))
const EditEvent = lazy(() => import("../pages/EditEvent.tsx"))
const EditInventory = lazy(() => import("../pages/EditInventory.tsx"))
const EditShipment = lazy(() => import("../pages/EditShipment.tsx"))
const EventDetails = lazy(() => import("../pages/EventDetails.tsx"))
const Events = lazy(() => import("../pages/Events.tsx"))
const Inventory = lazy(() => import("../pages/Inventory.tsx"))
const NewEvent = lazy(() => import("../pages/NewEvent.tsx"))
const NewInventory = lazy(() => import("../pages/NewInventory.tsx"))
const NewShipment = lazy(() => import("../pages/NewShipment.tsx"))
const ShipmentDetails = lazy(() => import("../pages/ShipmentDetails.tsx"))
const Shipments = lazy(() => import("../pages/Shipments.tsx"))
const SignIn = lazy(() => import("../pages/SignIn.tsx"))
const SignUp = lazy(() => import("../pages/SignUp.tsx"))

export const router = () => createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Suspense>
          <UserGuard>
            <App />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/dashboard",
      element: (
        <Suspense>
          <UserGuard>
            <Dashboard />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/edit-event",
      element: (
        <Suspense>
          <UserGuard>
            <EditEvent />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/edit-inventory",
      element: (
        <Suspense>
          <UserGuard>
            <EditInventory />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/edit-shipment",
      element: (
        <Suspense>
          <UserGuard>
            <EditShipment />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/event-details",
      element: (
        <Suspense>
          <UserGuard>
            <EventDetails />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/events",
      element: (
        <Suspense>
          <UserGuard>
            <Events />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/inventory",
      element: (
        <Suspense>
          <UserGuard>
            <Inventory />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/new-event",
      element: (
        <Suspense>
          <UserGuard>
            <NewEvent />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/new-inventory",
      element: (
        <Suspense>
          <UserGuard>
            <NewInventory />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/new-shipment",
      element: (
        <Suspense>
          <UserGuard>
            <NewShipment />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/shipment-details",
      element: (
        <Suspense>
          <UserGuard>
            <ShipmentDetails />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/shipments",
      element: (
        <Suspense>
          <UserGuard>
            <Shipments />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/sign-in",
      element: (
        <Suspense>
          <UserGuard>
            <SignIn />
          </UserGuard>
        </Suspense>
      )
    },
    {
      path: "/sign-up",
      element: (
        <Suspense>
          <UserGuard>
            <SignUp />
          </UserGuard>
        </Suspense>
      )
    }
  ],
  {
    basename: APP_BASE_PATH
  }
)
