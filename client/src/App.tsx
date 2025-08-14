import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Warbands from "@/pages/Warbands";
import Fighters from "@/pages/Fighters";
import Battles from "@/pages/Battles";
import Rules from "@/pages/Rules";
import ActiveGame from "@/pages/ActiveGame";
import TempWarband from "@/pages/TempWarband";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import PublicWarbands from "@/pages/PublicWarbands";
import PublicWarbandDetail from "@/pages/PublicWarbandDetail";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import NavigationTabs from "@/components/NavigationTabs";
import Footer from "@/components/Footer";
import FloatingActionButton from "@/components/FloatingActionButton";
import NotFound from "@/pages/not-found";

function Router({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/public/warbands" component={PublicWarbands} />
        <Route path="/public/warbands/:id" component={PublicWarbandDetail} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/warbands" component={Warbands} />
      <Route path="/fighters" component={Fighters} />
      <Route path="/battles" component={Battles} />
      <Route path="/rules" component={Rules} />
      <Route path="/active-game" component={ActiveGame} />
      <Route path="/temp-warband" component={TempWarband} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/public/warbands" component={PublicWarbands} />
      <Route path="/public/warbands/:id" component={PublicWarbandDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthenticatedWrapper 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={toggleSidebar} 
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AuthenticatedWrapper({ isSidebarOpen, onToggleSidebar }: { isSidebarOpen: boolean; onToggleSidebar: () => void }) {
  const { isAuthenticated, isLoading, error } = useAuth();

  // If there's an auth error or we're not authenticated, show the unauthenticated view
  const authenticated = !error && isAuthenticated;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Router isAuthenticated={false} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroBanner />
      <NavigationTabs />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Router isAuthenticated={true} />
      </main>
      <FloatingActionButton />
      <Footer />
    </div>
  );
}

export default App;
