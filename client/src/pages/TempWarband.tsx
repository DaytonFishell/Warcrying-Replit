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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash, Play, Users, Sword } from "lucide-react";

// Schemas
const tempWarbandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  faction: z.string().min(1, "Faction is required"),
});

const fighterSchema = z.object({
  name: z.string().min(1, 'Fighter name is required'),
  role: z.string().min(1, 'Role is required'),
  weapons: z.string().min(1, 'Weapons are required'),
  toughness: z.number().min(1).max(10),
  wounds: z.number().min(1).max(50),
  move: z.number().min(1).max(20),
  points: z.number().min(1, 'Points must be at least 1'),
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

type TempWarband = z.infer<typeof tempWarbandSchema>;

export default function TempWarband() {
  const [warband, setWarband] = useState<TempWarband | null>(null);
  const [fighters, setFighters] = useState<TempFighter[]>([]);
  const [showFighterForm, setShowFighterForm] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Warband form
  const warbandForm = useForm<z.infer<typeof tempWarbandSchema>>({
    resolver: zodResolver(tempWarbandSchema),
    defaultValues: { name: "", faction: "" },
  });

  // Fighter form
  const fighterForm = useForm<z.infer<typeof fighterSchema>>({
    resolver: zodResolver(fighterSchema),
    defaultValues: {
      name: '',
      role: '',
      weapons: '',
      toughness: 3,
      wounds: 10,
      move: 4,
      points: 1,
    },
  });

  // Create warband
  const onCreateWarband = (data: z.infer<typeof tempWarbandSchema>) => {
    setWarband(data);
    toast({
      title: "Temporary warband created",
      description: `${data.name} is ready for fighters.`,
    });
  };

  // Add fighter
  const onAddFighter = (data: z.infer<typeof fighterSchema>) => {
    if (!warband) return;

    const newFighter: TempFighter = {
      id: Date.now(),
      ...data,
      currentWounds: data.wounds,
      isActivated: false,
      hasActivatedThisRound: false,
      treasure: 0,
      statusEffects: [],
      abilityDice: [],
      warbandId: warband.name,
    };

    const updatedFighters = [...fighters, newFighter];
    setFighters(updatedFighters);
    setShowFighterForm(false);
    fighterForm.reset();

    toast({
      title: "Fighter added",
      description: `${data.name} has been added to ${warband.name}`,
    });
  };

  // Remove fighter
  const removeFighter = (fighterId: number) => {
    setFighters(fighters.filter(f => f.id !== fighterId));
    toast({
      title: "Fighter removed",
      variant: "destructive",
    });
  };

  // Start game
  const startGame = () => {
    if (!warband || fighters.length === 0) return;

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

    setLocation('/active-game?temp=true');
  };

  const roles = [
    "Champion", "Hero", "Leader", "Warrior", "Brute", "Monster", 
    "Archer", "Scout", "Assassin", "Berserker", "Mage", "Wizard"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-cinzel font-bold mb-2">Create Temporary Warband</h1>
        <p className="text-muted-foreground">
          Create a warband for one-time use that won't be saved to your collection.
        </p>
      </div>

      {/* Step 1: Create Warband */}
      {!warband && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Warband Details</CardTitle>
            <CardDescription>Enter basic information for your temporary warband</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...warbandForm}>
              <form onSubmit={warbandForm.handleSubmit(onCreateWarband)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={warbandForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warband Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Red Reavers" {...field} />
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
                          <Input placeholder="e.g. Chaos, Death, Order" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">Create Warband</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add Fighters */}
      {warband && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Step 2: Add Fighters to {warband.name}</span>
                <Button 
                  onClick={() => setShowFighterForm(!showFighterForm)}
                  variant={showFighterForm ? "outline" : "default"}
                  size="sm"
                >
                  {showFighterForm ? "Cancel" : <><Plus className="h-4 w-4 mr-1" />Add Fighter</>}
                </Button>
              </CardTitle>
              <CardDescription>Current fighters: {fighters.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fighter Form - Only visible when toggled */}
              {showFighterForm && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <Form {...fighterForm}>
                    <form onSubmit={fighterForm.handleSubmit(onAddFighter)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={fighterForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fighter Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter fighter name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={fighterForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {role}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={fighterForm.control}
                        name="weapons"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weapons</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Sword and Shield, Bow, Spear" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                          control={fighterForm.control}
                          name="toughness"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Toughness</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={fighterForm.control}
                          name="wounds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Wounds</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="50" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={fighterForm.control}
                          name="move"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Move</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="20" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={fighterForm.control}
                          name="points"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Points</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Fighter
                      </Button>
                    </form>
                  </Form>
                </div>
              )}

              {/* Fighter List */}
              {fighters.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Current Fighters</h4>
                  {fighters.map((fighter) => (
                    <div key={fighter.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Sword className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{fighter.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {fighter.role} • {fighter.weapons} • T{fighter.toughness} W{fighter.wounds} M{fighter.move} • {fighter.points} pts
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
                  ))}
                </div>
              )}

              {fighters.length === 0 && !showFighterForm && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No fighters added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Start Game */}
          {fighters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Step 3: Ready to Start
                </CardTitle>
                <CardDescription>
                  Review your warband and start the game when ready
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Warband:</span>
                    <p className="font-medium">{warband.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Faction:</span>
                    <p className="font-medium">{warband.faction}</p>
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
                <Button onClick={startGame} className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}