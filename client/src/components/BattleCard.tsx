import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Warband, Fighter } from "@shared/schema";

interface BattleCardProps {
  battle: {
    id: number;
    name: string;
    scenario: string;
    date: string;
    winnerId: number;
    loserId: number;
    winnerScore: number;
    loserScore: number;
    notes?: string;
    mapType?: string;
  };
  warbands?: Warband[];
}

export default function BattleCard({ battle, warbands = [] }: BattleCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const { data: winnerFighters = [] } = useQuery<Fighter[]>({
    queryKey: ['/api/fighters', battle.winnerId],
    queryFn: async () => {
      const res = await fetch(`/api/fighters?warbandId=${battle.winnerId}`);
      if (!res.ok) throw new Error('Failed to fetch fighters');
      return res.json();
    },
    enabled: !!battle.winnerId
  });
  
  const { data: loserFighters = [] } = useQuery<Fighter[]>({
    queryKey: ['/api/fighters', battle.loserId],
    queryFn: async () => {
      const res = await fetch(`/api/fighters?warbandId=${battle.loserId}`);
      if (!res.ok) throw new Error('Failed to fetch fighters');
      return res.json();
    },
    enabled: !!battle.loserId
  });
  
  const { data: battleStats = [] } = useQuery<any[]>({
    queryKey: ['/api/battles', battle.id, 'stats'],
    queryFn: async () => {
      const res = await fetch(`/api/battles/${battle.id}/stats`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: showDetails
  });
  
  const formattedDate = format(new Date(battle.date), 'MMMM d, yyyy');
  
  const winnerWarband = warbands?.find(w => w.id === battle.winnerId);
  const loserWarband = warbands?.find(w => w.id === battle.loserId);
  
  return (
    <>
      <div className="card battle-card p-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-success mr-2"></span>
              <h3 className="font-cinzel font-bold text-lg">{battle.name}</h3>
            </div>
            <p className="text-foreground/80 text-sm">{battle.scenario} • {formattedDate}</p>
          </div>
          
          <div className="mt-3 md:mt-0 grid grid-cols-7 gap-2 items-center">
            <div className="col-span-3">
              <p className="text-center font-medium">{winnerWarband?.name || 'Unknown Warband'}</p>
              <div className="flex justify-center gap-1 mt-1">
                {winnerFighters.slice(0, 3).map(fighter => (
                  <div 
                    key={fighter.id}
                    className="w-6 h-6 bg-background rounded-full flex items-center justify-center text-xs overflow-hidden"
                    title={fighter.name}
                  >
                    {fighter.imageUrl ? (
                      <img src={fighter.imageUrl} alt={fighter.name} className="w-full h-full object-cover" />
                    ) : fighter.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="col-span-1 text-center">
              <span className="font-bold text-lg">VS</span>
            </div>
            
            <div className="col-span-3">
              <p className="text-center font-medium text-foreground/80">{loserWarband?.name || 'Unknown Warband'}</p>
              <div className="flex justify-center gap-1 mt-1">
                {loserFighters.slice(0, 3).map(fighter => (
                  <div 
                    key={fighter.id}
                    className="w-6 h-6 bg-background rounded-full flex items-center justify-center text-xs overflow-hidden"
                    title={fighter.name}
                  >
                    {fighter.imageUrl ? (
                      <img src={fighter.imageUrl} alt={fighter.name} className="w-full h-full object-cover" />
                    ) : fighter.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-3 md:mt-0 md:ml-4 flex items-center text-sm">
            <button 
              className="text-foreground hover:text-primary transition"
              onClick={() => setShowDetails(true)}
              aria-label="View battle details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-cinzel">{battle.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="bg-primary/10 p-4 rounded">
                <h3 className="font-bold mb-1 text-primary flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  Victor
                </h3>
                <p className="text-lg font-cinzel">{winnerWarband?.name}</p>
                <p className="text-sm text-foreground/70">Score: {battle.winnerScore}</p>
              </div>
              
              <div className="bg-muted p-4 rounded">
                <h3 className="font-bold mb-1 text-foreground/70 flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Defeated
                </h3>
                <p className="text-lg font-cinzel">{loserWarband?.name}</p>
                <p className="text-sm text-foreground/70">Score: {battle.loserScore}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">Scenario</h3>
                <p>{battle.scenario}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Battlefield</h3>
                <p>{battle.mapType || 'Standard'}</p>
              </div>
            </div>
            
            {battle.notes && (
              <div>
                <h3 className="font-bold mb-2">Battle Notes</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-line">{battle.notes}</p>
              </div>
            )}
            
            {battleStats.length > 0 && (
              <div>
                <h3 className="font-bold mb-2">Fighter Achievements</h3>
                <div className="space-y-2">
                  {battleStats.map((stat: any) => {
                    const fighter = [...winnerFighters, ...loserFighters].find(f => f.id === stat.fighterId);
                    return (
                      <div key={stat.id} className="flex justify-between items-center p-2 bg-card rounded">
                        <span className="font-medium">{fighter?.name || 'Unknown Fighter'}</span>
                        <div className="flex items-center gap-2">
                          {stat.kills > 0 && (
                            <span className="text-success text-sm">
                              {stat.kills} kills
                            </span>
                          )}
                          {stat.wasKilled && (
                            <span className="text-destructive text-sm">
                              Died in battle
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
