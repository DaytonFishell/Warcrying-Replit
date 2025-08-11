import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import BattleCard from "@/components/BattleCard";
import BattleForm from "@/components/forms/BattleForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";
import type { Battle, Warband } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Battles() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState<string>("all");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);
  
  const { data: battles, isLoading } = useQuery<Battle[]>({
    queryKey: ['/api/battles'],
  });
  
  const { data: warbands } = useQuery<Warband[]>({
    queryKey: ['/api/warbands'],
  });
  
  const uniqueScenarios = Array.from(new Set(battles?.map(battle => battle.scenario) || []));
  
  const filteredBattles = battles?.filter(battle => {
    const matchesSearch = battle.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScenario = scenarioFilter === "all" || battle.scenario === scenarioFilter;
    
    return matchesSearch && matchesScenario;
  });
  
  // Sort battles by date, newest first
  const sortedBattles = filteredBattles?.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-cinzel font-bold mb-2">Battle Log</h1>
        <p className="text-muted-foreground">Track your battle history and outcomes</p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search battles..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select 
            value={scenarioFilter} 
            onValueChange={setScenarioFilter}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Scenario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scenarios</SelectItem>
              {uniqueScenarios.map(scenario => (
                <SelectItem key={scenario} value={scenario}>
                  {scenario}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {showForm ? "Cancel" : "Log New Battle"}
        </Button>
      </div>
      
      {/* Inline Battle Form */}
      {showForm && (
        <div className="mb-6 border rounded-lg p-4 bg-muted/50">
          <BattleForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
      
      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="card battle-card p-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="mt-3 md:mt-0 grid grid-cols-7 gap-2 items-center">
                  <div className="col-span-3">
                    <Skeleton className="h-5 w-full mb-2" />
                    <div className="flex justify-center gap-1 mt-1">
                      {Array(3).fill(0).map((_, j) => (
                        <Skeleton key={j} className="w-6 h-6 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1 text-center">
                    <Skeleton className="h-6 w-6 mx-auto" />
                  </div>
                  <div className="col-span-3">
                    <Skeleton className="h-5 w-full mb-2" />
                    <div className="flex justify-center gap-1 mt-1">
                      {Array(3).fill(0).map((_, j) => (
                        <Skeleton key={j} className="w-6 h-6 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : sortedBattles?.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-muted inline-flex p-3 rounded-full mb-4">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No battles found</h3>
            <p className="text-muted-foreground mb-4">No battles match your search criteria.</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setScenarioFilter("all");
            }}>Clear Filters</Button>
          </div>
        ) : (
          sortedBattles?.map(battle => (
            <BattleCard 
              key={battle.id} 
              battle={battle} 
              warbands={warbands}
            />
          ))
        )}
        
        {/* Log Your First Battle card removed - use inline form instead */}
      </div>
    </div>
  );
}
