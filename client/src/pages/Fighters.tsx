import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import FighterCard from "@/components/FighterCard";
import FighterForm from "@/components/forms/FighterForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Fighter, Warband } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Fighters() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [warbandFilter, setWarbandFilter] = useState<string>("all");
  const [location, setLocation] = useLocation();
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
  
  const { data: fighters, isLoading: isLoadingFighters } = useQuery<Fighter[]>({
    queryKey: ['/api/fighters'],
  });
  
  const { data: warbands } = useQuery<Warband[]>({
    queryKey: ['/api/warbands'],
  });
  
  const filteredFighters = fighters?.filter(fighter => {
    const matchesSearch = fighter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fighter.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarband = warbandFilter === "all" || fighter.warbandId.toString() === warbandFilter;
    
    return matchesSearch && matchesWarband;
  });
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-cinzel font-bold mb-2">Your Fighters</h1>
        <p className="text-muted-foreground">Manage your fighters and their stats</p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search fighters..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select 
            value={warbandFilter} 
            onValueChange={setWarbandFilter}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Warband" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warbands</SelectItem>
              {warbands?.map(warband => (
                <SelectItem key={warband.id} value={warband.id.toString()}>
                  {warband.name}
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
          {showForm ? "Cancel" : "New Fighter"}
        </Button>
      </div>
      
      {/* Inline Fighter Form */}
      {showForm && (
        <div className="mb-6 border rounded-lg p-4 bg-muted/50">
          <FighterForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingFighters ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-40 overflow-hidden relative">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {Array(4).fill(0).map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-1/2 mb-1" />
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-6 mr-2" />
                        <Skeleton className="h-2 flex-grow" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : filteredFighters?.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <div className="bg-muted inline-flex p-3 rounded-full mb-4">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No fighters found</h3>
            <p className="text-muted-foreground mb-4">No fighters match your search criteria.</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setWarbandFilter("all");
            }}>Clear Filters</Button>
          </div>
        ) : (
          <>
            {filteredFighters?.map(fighter => (
              <FighterCard key={fighter.id} fighter={fighter} />
            ))}
            
            {/* Add New Fighter Card removed - use inline form instead */}
          </>
        )}
      </div>
    </div>
  );
}
