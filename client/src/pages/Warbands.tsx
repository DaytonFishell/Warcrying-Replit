import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import WarbandCard from "@/components/WarbandCard";
import WarbandForm from "@/components/forms/WarbandForm";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Warband } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Warbands() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
  
  const { data: warbands, isLoading } = useQuery<Warband[]>({
    queryKey: ['/api/warbands'],
  });
  
  const filteredWarbands = warbands?.filter(warband => 
    warband.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warband.faction.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-cinzel font-bold mb-2">Your Warbands</h1>
        <p className="text-muted-foreground">Manage your warbands and fighters</p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search warbands..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {showForm ? "Cancel" : "New Warband"}
        </Button>
      </div>
      
      {/* Inline Warband Form */}
      {showForm && (
        <div className="mb-6 border rounded-lg p-4 bg-muted/50">
          <WarbandForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="card">
              <div className="card-header p-4">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="p-4">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-12 w-16" />
                  <Skeleton className="h-12 w-16" />
                  <Skeleton className="h-12 w-16" />
                </div>
                <div className="flex gap-1 mt-4">
                  {Array(6).fill(0).map((_, j) => (
                    <Skeleton key={j} className="w-8 h-8 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : filteredWarbands?.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <div className="bg-muted inline-flex p-3 rounded-full mb-4">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No warbands found</h3>
            <p className="text-muted-foreground mb-4">No warbands match your search criteria.</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
          </div>
        ) : (
          <>
            {filteredWarbands?.map(warband => (
              <WarbandCard key={warband.id} warband={warband} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
