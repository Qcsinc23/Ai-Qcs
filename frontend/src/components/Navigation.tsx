import { Link, useLocation, useNavigate } from "react-router-dom";
import { startTransition, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { shipmentService } from "../utils/supabase";
import { cn } from "@/lib/utils";
import { NotificationBell } from "../components/NotificationBell";
import { SignInButton, UserButton, useAuth } from "@clerk/clerk-react";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrackingSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) return;

    try {
      const shipment = await shipmentService.getShipmentByTracking(trackingNumber);
      startTransition(() => {
        navigate(`/shipment-details?id=${shipment.id}`);
      });
    } catch (error) {
      console.error("Error finding shipment:", error);
    }
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/inventory", label: "Inventory" },
    { href: "/shipments", label: "Shipments" },
  ];

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="mr-8">
            <Link to="/" className="text-xl font-bold">
              QCS Command
            </Link>
          </div>
          {isSignedIn && links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <form onSubmit={handleTrackingSearch} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-48"
                />
                <Button type="submit" variant="outline" size="sm">
                  Track
                </Button>
              </form>
              <NotificationBell />
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  }
                }}
              />
            </>
          ) : (
            <SignInButton mode="modal">
              <Button variant="default">Sign In</Button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}
