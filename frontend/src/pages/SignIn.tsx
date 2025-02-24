import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <Card className="w-full max-w-md p-6">
        <ClerkSignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          onError={(error) => {
            toast.error(`Sign-in failed: ${error.message}`);
          }}
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-none p-0",
              headerTitle: "text-2xl font-bold text-center mb-6",
              headerSubtitle: "text-center text-muted-foreground",
              socialButtonsBlockButton: "w-full",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              footerAction: "text-sm text-muted-foreground",
              footerActionLink: "text-primary hover:text-primary/90"
            }
          }}
        />
      </Card>
    </div>
  );
}
