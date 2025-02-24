import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

const breadcrumbConfig: BreadcrumbConfig = {
  "/": { label: "Home" },
  "/dashboard": { label: "Dashboard", parent: "/" },
  "/events": { label: "Events", parent: "/" },
  "/new-event": { label: "New Event", parent: "/events" },
  "/edit-event": { label: "Edit Event", parent: "/events" },
  "/event-details": { label: "Event Details", parent: "/events" },
  "/inventory": { label: "Inventory", parent: "/" },
  "/new-inventory": { label: "New Item", parent: "/inventory" },
  "/edit-inventory": { label: "Edit Item", parent: "/inventory" },
  "/shipments": { label: "Shipments", parent: "/" },
  "/new-shipment": { label: "New Shipment", parent: "/shipments" },
  "/edit-shipment": { label: "Edit Shipment", parent: "/shipments" },
  "/shipment-details": { label: "Shipment Details", parent: "/shipments" },
  "/sign-in": { label: "Sign In", parent: "/" },
  "/sign-up": { label: "Sign Up", parent: "/" },
};

function getBreadcrumbs(path: string): Array<{ label: string; path: string }> {
  const breadcrumbs: Array<{ label: string; path: string }> = [];
  let currentPath = path;

  while (currentPath) {
    const config = breadcrumbConfig[currentPath];
    if (!config) break;

    breadcrumbs.unshift({
      label: config.label,
      path: currentPath,
    });

    if (config.parent && config.parent !== currentPath) {
      currentPath = config.parent;
    } else {
      break;
    }
  }

  return breadcrumbs;
}

export function Breadcrumbs() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        {breadcrumbs.map((breadcrumb, index) => (
          <BreadcrumbItem key={breadcrumb.path}>
            {index === breadcrumbs.length - 1 ? (
              <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
