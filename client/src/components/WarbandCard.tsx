import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Globe, Heart, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WarbandForm from "@/components/forms/WarbandForm";
import WarbandSharingControls from "@/components/WarbandSharingControls";
import { Warband, Fighter } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface WarbandCardProps {
  warband: Warband;
}

export default function WarbandCard({ warband }: WarbandCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: fighters = [] } = useQuery<Fighter[]>({
    queryKey: ['/api/fighters', warband.id],
    queryFn: async () => {
      const res = await fetch(`/api/fighters?warbandId=${warband.id}`);
      if (!res.ok) throw new Error('Failed to fetch fighters');
      return res.json();
    }
  });
  
  const { data: battles = [] } = useQuery<any[]>({
    queryKey: ['/api/battles'],
  });
  
  // Calculate stats
  const fighterCount = fighters.length;
  const battleCount = battles.filter(battle => 
    battle.winnerId === warband.id || battle.loserId === warband.id
  ).length;
  const winCount = battles.filter(battle => battle.winnerId === warband.id).length;
  
  // Format the date to "x days ago" format
  const formattedDate = formatDistanceToNow(new Date(warband.createdAt), { addSuffix: true });
  
  const deleteWarband = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/warbands/${warband.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warbands'] });
      toast({
        title: "Warband Deleted",
        description: `${warband.name} has been successfully deleted.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete warband: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  return (
    <>
      <div className="card overflow-hidden">
        <div className="card-header p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel font-bold text-lg">{warband.name}</h3>
                {warband.isPublic && (
                  <Badge variant="secondary" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
              <p className="text-foreground/80 text-sm mt-1">Last updated: {formattedDate}</p>
            </div>
            <span className="bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-full">
              {warband.faction} • {warband.currentPoints}/{warband.pointsLimit} pts
            </span>
          </div>
          {warband.isPublic && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{warband.likes || 0} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{warband.views || 0} views</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between mb-3">
            <div>
              <p className="text-sm text-foreground/80">Fighters:</p>
              <p className="font-medium">{fighterCount}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/80">Battles:</p>
              <p className="font-medium">{battleCount}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/80">Wins:</p>
              <p className="font-medium text-success">{winCount}</p>
            </div>
          </div>
          
          <div className="flex gap-1 mt-4">
            {fighters.length > 0 && (
              <div className="w-8 h-8 bg-background rounded-full border-2 border-primary flex items-center justify-center text-xs overflow-hidden">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4h20v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
                  <path d="M12 6v10" />
                  <path d="M8 8v6" />
                  <path d="M16 8v6" />
                </svg>
              </div>
            )}
            
            {fighters.slice(0, 5).map((fighter, index) => (
              <Link key={fighter.id} href={`/fighters/${fighter.id}`}>
                <div className="w-8 h-8 bg-background rounded-full overflow-hidden cursor-pointer" title={fighter.name}>
                  {fighter.imageUrl ? (
                    <img src={fighter.imageUrl} alt={fighter.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      {fighter.name.charAt(0)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
            
            {fighters.length > 5 && (
              <Link href={`/fighters?warbandId=${warband.id}`}>
                <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center text-xs cursor-pointer">
                  +{fighters.length - 5}
                </div>
              </Link>
            )}
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete the warband "{warband.name}" and all associated data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteWarband.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Inline Edit Form */}
      {isEditing && (
        <div className="mt-4 space-y-4">
          <div className="border rounded-lg p-4 bg-muted/50">
            <WarbandForm 
              warband={warband} 
              onSuccess={() => setIsEditing(false)} 
            />
          </div>
          <WarbandSharingControls warband={warband} />
        </div>
      )}
    </>
  );
}
