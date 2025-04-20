import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import ProtectedRoute from "@/pages/protected";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      {/* Redirect root to auth or dashboard based on auth status */}
      <Route path="/">
        <Redirect />
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Helper component to redirect from root based on auth state
function Redirect() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem("savings_app_token") || sessionStorage.getItem("savings_app_token");
    if (token) {
      setLocation("/dashboard");
    } else {
      setLocation("/auth");
    }
  }, [setLocation]);
  
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
