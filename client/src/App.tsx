import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ExercisesPage from "@/pages/ExercisesPage";
import ExercisePreviewPage from "@/pages/ExercisePreviewPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ExercisesPage} />
      <Route path="/harjutused" component={ExercisesPage} />
      <Route path="/harjutused/:id" component={ExercisePreviewPage} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

import { ThemeProvider } from "@/components/theme/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="teacher-app-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={120}>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
