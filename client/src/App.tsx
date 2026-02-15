import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import NotFound from "@/pages/not-found";
import HealthTrackerPage from "@/pages/HealthTrackerPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HealthTrackerPage} />
      <Route path="/health" component={HealthTrackerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="health-tracker-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={120}>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
