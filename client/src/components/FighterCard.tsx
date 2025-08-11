import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FighterForm from "@/components/forms/FighterForm";
import { Fighter, Warband } from "@shared/schema";

interface FighterCardProps {
  fighter: Fighter;
}

export default function FighterCard({ fighter }: FighterCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: warband } = useQuery<Warband>({
    queryKey: ['/api/warbands', fighter.warbandId],
  });
  
  const deleteFighter = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/fighters/${fighter.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fighters'] });
      toast({
        title: "Fighter Deleted",
        description: `${fighter.name} has been successfully deleted.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete fighter: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Default image if none is provided
  const fighterImage = fighter.imageUrl || "https://pixabay.com/get/g6af3e4f53f02680895d32967f4a82f170457d3b9299927642315de3b18380f3c030fc3e629d838034232eccea9973e524ca98f9537c3d9e7d811b8466df21537_1280.jpg";
  
  // Calculate ratings based on performance
  let ratingStars = "★";
  if (fighter.kills > 0) {
    const killRatio = fighter.kills / (fighter.battles || 1);
    if (killRatio >= 2) ratingStars = "★★★★★";
    else if (killRatio >= 1.5) ratingStars = "★★★★";
    else if (killRatio >= 1) ratingStars = "★★★";
    else if (killRatio >= 0.5) ratingStars = "★★";
  }
  
  const maxStat = 10; // Maximum stat value for the bars
  
  return (
    <>
      <div className="card overflow-hidden">
        <div className="h-40 overflow-hidden relative">
          <img 
            src={fighterImage}
            alt={fighter.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-cinzel font-bold text-white text-lg">{fighter.name}</h3>
                <p className="text-white/90 text-sm">
                  {warband?.name || 'Loading...'} • {fighter.type}
                </p>
              </div>
              <span className="bg-secondary text-background text-xs px-2 py-1 rounded-full font-bold">
                {ratingStars}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-foreground/80 mb-1">Move</p>
              <div className="flex items-center">
                <span className="font-medium mr-2">{fighter.move}</span>
                <div className="stat-bar flex-grow">
                  <div 
                    className="stat-fill bg-primary" 
                    style={{ width: `${(fighter.move / maxStat) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-foreground/80 mb-1">Wounds</p>
              <div className="flex items-center">
                <span className="font-medium mr-2">{fighter.wounds}</span>
                <div className="stat-bar flex-grow">
                  <div 
                    className="stat-fill bg-success" 
                    style={{ width: `${(fighter.wounds / (maxStat * 2)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-foreground/80 mb-1">Strength</p>
              <div className="flex items-center">
                <span className="font-medium mr-2">{fighter.strength}</span>
                <div className="stat-bar flex-grow">
                  <div 
                    className="stat-fill bg-warning" 
                    style={{ width: `${(fighter.strength / maxStat) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-foreground/80 mb-1">Toughness</p>
              <div className="flex items-center">
                <span className="font-medium mr-2">{fighter.toughness}</span>
                <div className="stat-bar flex-grow">
                  <div 
                    className="stat-fill bg-warning" 
                    style={{ width: `${(fighter.toughness / maxStat) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-background/40">
            <div>
              <span className="text-xs text-foreground/80">Battles: {fighter.battles}</span>
              <span className="mx-2 text-foreground/40">•</span>
              <span className="text-xs text-success">{fighter.kills} kills</span>
            </div>
            
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete the fighter "{fighter.name}" and all associated data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteFighter.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-background hover:bg-primary/20"
              >
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inline Edit Form */}
      {isEditing && (
        <div className="mt-4 border rounded-lg p-4 bg-muted/50">
          <FighterForm 
            fighter={fighter} 
            onSuccess={() => setIsEditing(false)} 
          />
        </div>
      )}
    </>
  );
}
