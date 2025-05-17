import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Warbands from "@/pages/Warbands";
import Fighters from "@/pages/Fighters";
import Battles from "@/pages/Battles";
import Rules from "@/pages/Rules";
import ActiveGame from "@/pages/ActiveGame";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import NavigationTabs from "@/components/NavigationTabs";
import Footer from "@/components/Footer";
import FloatingActionButton from "@/components/FloatingActionButton";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroBanner />
      <NavigationTabs />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/warbands" component={Warbands} />
          <Route path="/fighters" component={Fighters} />
          <Route path="/battles" component={Battles} />
          <Route path="/active-game" component={ActiveGame} />
          <Route path="/rules" component={Rules} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <FloatingActionButton />
      <Footer />
    </div>
  );
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
