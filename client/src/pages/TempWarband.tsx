import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash, Play, Users, Sword } from "lucide-react";

// Schema for temporary warband
const tempWarbandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  faction: z.string().min(1, "Faction is required"),
});

type TempFighter = {
  id: number;
  name: string;
  role: string;
  weapons: string;
  toughness: number;
  wounds: number;
  move: number;
  points: number;
  currentWounds: number;
  isActivated: boolean;
  hasActivatedThisRound: boolean;
  treasure: number;
  statusEffects: string[];
  abilityDice: number[];
  warbandId: string;
};

type TempWarband = z.infer<typeof tempWarbandSchema> & {
  fighters: TempFighter[];
};

export default function TempWarband() {
  const [warband, setWarband] = useState<TempWarband | null>(null);
  const [currentTab, setCurrentTab] = useState("create-warband");
  const [fighters, setFighters] = useState<TempFighter[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form for creating the warband
  const warbandForm = useForm<z.infer<typeof tempWarbandSchema>>({
    resolver: zodResolver(tempWarbandSchema),
    defaultValues: {
      name: "",
      faction: "",
    },
  });

  // Load fighters from localStorage when component mounts or warband changes
  useEffect(() => {
    if (warband) {
      const savedFighters = JSON.parse(localStorage.getItem('tempFighters') || '[]');
      const warbandFighters = savedFighters.filter((f: TempFighter) => f.warbandId === warband.name);
      setFighters(warbandFighters);
    }
  }, [warband]);

  // Refresh fighters when returning from AddFighter page
  useEffect(() => {
    const handleStorage = () => {
      if (warband) {
        const savedFighters = JSON.parse(localStorage.getItem('tempFighters') || '[]');
        const warbandFighters = savedFighters.filter((f: TempFighter) => f.warbandId === warband.name);
        setFighters(warbandFighters);
      }
    };

    const intervalId = setInterval(handleStorage, 1000); // Check every second
    return () => clearInterval(intervalId);
  }, [warband]);

  // Create the warband
  const onCreateWarband = (data: z.infer<typeof tempWarbandSchema>) => {
    setWarband({
      ...data,
      fighters: [],
    });
    setCurrentTab("add-fighters");
    toast({
      title: "Temporary warband created",
      description: `${data.name} is ready for fighters.`,
    });
  };

  // Navigate to add fighter page
  const navigateToAddFighter = () => {
    if (!warband) return;
    const params = new URLSearchParams({
      warband: warband.name,
      return: '/temp-warband'
    });
    setLocation(`/add-fighter?${params.toString()}`);
  };

  // Remove a fighter
  const removeFighter = (fighterId: number) => {
    const savedFighters = JSON.parse(localStorage.getItem('tempFighters') || '[]');
    const updatedFighters = savedFighters.filter((f: TempFighter) => f.id !== fighterId);
    localStorage.setItem('tempFighters', JSON.stringify(updatedFighters));
    
    // Update local state
    setFighters(fighters.filter(f => f.id !== fighterId));
    
    toast({
      title: "Fighter removed",
      variant: "destructive",
    });
  };

  // Start a game with the temporary warband
  const startGame = () => {
    if (!warband || fighters.length === 0) return;

    // Store warband and fighters in sessionStorage for the active game
    const tempWarbandData = {
      id: Date.now(),
      name: warband.name,
      faction: warband.faction,
      pointsLimit: 1000,
      currentPoints: fighters.reduce((sum, f) => sum + f.points, 0),
      description: "Temporary warband",
      createdAt: new Date(),
    };

    sessionStorage.setItem('temp_warband', JSON.stringify(tempWarbandData));
    sessionStorage.setItem('temp_fighters', JSON.stringify(fighters));

    toast({
      title: "Temporary warband ready",
      description: "Redirecting to active game...",
    });

    // Navigate to active game with temporary warband ID
    setLocation('/active-game?temp=true');
  };

  // Clear all temporary data
  const clearAll = () => {
    localStorage.removeItem('tempFighters');
    setWarband(null);
    setFighters([]);
    setCurrentTab("create-warband");
    warbandForm.reset();
    toast({
      title: "Cleared",
      description: "All temporary data has been cleared.",
    });
  };

  return (
    <div className="w-full px-4 py-4 md:py-8 pb-20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-cinzel font-bold mb-2">Create Temporary Warband</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Create a warband for one-time use that won't be saved to your collection.
          </p>
        </div>
        {warband && (
          <Button variant="outline" onClick={clearAll} size="sm">
            Clear All
          </Button>
        )}
      </div>

      <Tabs defaultValue="create-warband" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-6 grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="create-warband" className="text-xs md:text-sm">Create Warband</TabsTrigger>
          <TabsTrigger value="add-fighters" disabled={!warband} className="text-xs md:text-sm">Add Fighters</TabsTrigger>
          <TabsTrigger value="review" disabled={!warband || fighters.length === 0} className="text-xs md:text-sm">Review & Start</TabsTrigger>
        </TabsList>

        <TabsContent value="create-warband">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Warband Details</CardTitle>
              <CardDescription>
                Enter basic information for your temporary warband.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...warbandForm}>
                <form onSubmit={warbandForm.handleSubmit(onCreateWarband)} className="space-y-6">
                  <FormField
                    control={warbandForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warband Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Red Reavers" 
                            {...field} 
                            className="text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={warbandForm.control}
                    name="faction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faction</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Chaos, Death, Order" 
                            {...field} 
                            className="text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-12 text-base">
                    Create Warband
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-fighters">
          <div className="space-y-6">
            {/* Add Fighter Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Add Fighters to {warband?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current fighters: {fighters.length}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={navigateToAddFighter}
                    className="h-12 px-6 text-base"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fighter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fighter List */}
            {fighters.length > 0 && (
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Current Fighters</h3>
                {fighters.map((fighter) => (
                  <Card key={fighter.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Sword className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{fighter.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {fighter.role} • {fighter.weapons} • {fighter.points} pts
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFighter(fighter.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {fighters.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No fighters added yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click "Add Fighter" to start building your warband
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="review">
          <div className="space-y-6">
            {/* Warband Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Ready to Start
                </CardTitle>
                <CardDescription>
                  Review your temporary warband and start the game when ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Warband:</span>
                    <p className="font-medium">{warband?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Faction:</span>
                    <p className="font-medium">{warband?.faction}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fighters:</span>
                    <p className="font-medium">{fighters.length}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Points:</span>
                    <p className="font-medium">{fighters.reduce((sum, f) => sum + f.points, 0)}</p>
                  </div>
                </div>

                <Button onClick={startGame} className="w-full h-12 text-base">
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
              </CardContent>
            </Card>

            {/* Fighter Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Fighter Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fighters.map((fighter) => (
                    <div key={fighter.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{fighter.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {fighter.role} • T{fighter.toughness} W{fighter.wounds} M{fighter.move}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{fighter.points} pts</p>
                        <p className="text-sm text-muted-foreground">{fighter.weapons}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}