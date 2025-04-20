import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { isAuthenticated } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/auth");
    }
  }, [setLocation]);

  // If not authenticated, render nothing while redirecting
  if (!isAuthenticated()) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
}
