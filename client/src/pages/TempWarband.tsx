import { useState } from "react";
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
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Trash } from "lucide-react";

// Schema for temporary fighter
const tempFighterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  move: z.coerce.number().min(1).max(10),
  toughness: z.coerce.number().min(1).max(10),
  wounds: z.coerce.number().min(1),
  strength: z.coerce.number().min(1).max(10),
  attacks: z.coerce.number().min(1).max(10),
  damage: z.string().min(1, "Damage is required"),
  criticalDamage: z.string().min(1, "Critical damage is required"),
  range: z.coerce.number().min(1),
});

// Schema for temporary warband
const tempWarbandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  faction: z.string().min(1, "Faction is required"),
});

type TempFighter = z.infer<typeof tempFighterSchema>;
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

  // Form for adding fighters
  const fighterForm = useForm<TempFighter>({
    resolver: zodResolver(tempFighterSchema),
    defaultValues: {
      name: "",
      type: "Warrior",
      move: 4,
      toughness: 3,
      wounds: 10,
      strength: 3,
      attacks: 2,
      damage: "1",
      criticalDamage: "2",
      range: 1,
    },
  });

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

  // Add a fighter to the warband
  const onAddFighter = (data: TempFighter) => {
    if (!warband) return;

    const newFighters = [...fighters, data];
    setFighters(newFighters);
    setWarband({
      ...warband,
      fighters: newFighters,
    });

    // Reset form for next fighter
    fighterForm.reset({
      name: "",
      type: "Warrior",
      move: 4,
      toughness: 3,
      wounds: 10,
      strength: 3,
      attacks: 2,
      damage: "1",
      criticalDamage: "2",
      range: 1,
    });

    toast({
      title: "Fighter added",
      description: `${data.name} added to ${warband.name}.`,
    });
  };

  // Remove a fighter
  const removeFighter = (index: number) => {
    if (!warband) return;

    const newFighters = fighters.filter((_, i) => i !== index);
    setFighters(newFighters);
    setWarband({
      ...warband,
      fighters: newFighters,
    });

    toast({
      title: "Fighter removed",
      variant: "destructive",
    });
  };

  // Start a game with the temporary warband
  const startGame = () => {
    if (!warband) return;

    // Here we would normally store in localStorage, but for temporary we'll use sessionStorage
    // which gets cleared when the browser closes
    const tempWarband = {
      id: Date.now(), // Use timestamp as temporary ID
      name: warband.name,
      faction: warband.faction,
      pointsLimit: 1000,
      currentPoints: 0,
      description: "Temporary warband",
      createdAt: new Date(),
    };

    const tempFighters = fighters.map((fighter, index) => ({
      id: Date.now() + index + 1,
      warbandId: tempWarband.id,
      ...fighter,
      battles: 0,
      kills: 0,
      deaths: 0,
      abilities: [],
      imageUrl: "",
    }));

    // Store in sessionStorage
    sessionStorage.setItem('temp_warband', JSON.stringify(tempWarband));
    sessionStorage.setItem('temp_fighters', JSON.stringify(tempFighters));

    toast({
      title: "Temporary warband ready",
      description: "Redirecting to active game...",
    });

    // Navigate to active game with temporary warband ID
    setLocation('/active-game?temp=true');
  };

  const fighterTypes = [
    "Champion", "Hero", "Leader", "Warrior", "Brute", "Monster", 
    "Archer", "Scout", "Assassin", "Berserker", "Mage", "Wizard"
  ];

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-cinzel font-bold mb-4 md:mb-6">Create Temporary Warband</h1>
      <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
        Create a warband for one-time use that won't be saved to your collection.
        Perfect for quick games or testing.
      </p>

      <Tabs defaultValue="create-warband" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-4 grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="create-warband" className="text-xs md:text-sm">Create Warband</TabsTrigger>
          <TabsTrigger value="add-fighters" disabled={!warband} className="text-xs md:text-sm">Add Fighters</TabsTrigger>
          <TabsTrigger value="review" disabled={!warband || fighters.length === 0} className="text-xs md:text-sm">Review & Start</TabsTrigger>
        </TabsList>

        <TabsContent value="create-warband">
          <Card>
            <CardHeader>
              <CardTitle>Warband Details</CardTitle>
              <CardDescription>
                Enter basic information for your temporary warband.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...warbandForm}>
                <form onSubmit={warbandForm.handleSubmit(onCreateWarband)} className="space-y-4">
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

                  <Button type="submit" className="w-full">
                    Create Warband
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-fighters">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Add Fighter</CardTitle>
                <CardDescription>
                  Add fighters to your temporary warband.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...fighterForm}>
                  <form onSubmit={fighterForm.handleSubmit(onAddFighter)} className="space-y-4">
                    <FormField
                      control={fighterForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fighter Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Thorgar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={fighterForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Warrior, Champion, etc." 
                              {...field} 
                              list="fighter-types"
                            />
                          </FormControl>
                          <datalist id="fighter-types">
                            {fighterTypes.map(type => (
                              <option key={type} value={type} />
                            ))}
                          </datalist>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField
                        control={fighterForm.control}
                        name="move"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Move</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fighterForm.control}
                        name="toughness"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Toughness</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
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
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fighterForm.control}
                        name="strength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strength</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField
                        control={fighterForm.control}
                        name="attacks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attacks</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fighterForm.control}
                        name="damage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Damage</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 1-3" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Format as X or X-Y
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fighterForm.control}
                        name="criticalDamage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Critical</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 3-6" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Critical damage
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fighterForm.control}
                        name="range"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Range</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              In inches
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Fighter
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div>
              <Card className="max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Warband: {warband?.name}</CardTitle>
                  <CardDescription>{warband?.faction}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fighters.length === 0 ? (
                    <div className="text-center p-4 border border-dashed rounded-md border-muted">
                      <p className="text-muted-foreground">No fighters added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fighters.map((fighter, index) => (
                        <div key={index} className="border p-3 rounded-md flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{fighter.name}</h3>
                            <p className="text-sm text-muted-foreground">{fighter.type}</p>
                            <div className="grid grid-cols-4 gap-1 text-xs text-center mt-2">
                              <div>
                                <span className="block text-muted-foreground">M</span>
                                <span>{fighter.move}"</span>
                              </div>
                              <div>
                                <span className="block text-muted-foreground">T</span>
                                <span>{fighter.toughness}</span>
                              </div>
                              <div>
                                <span className="block text-muted-foreground">W</span>
                                <span>{fighter.wounds}</span>
                              </div>
                              <div>
                                <span className="block text-muted-foreground">S</span>
                                <span>{fighter.strength}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFighter(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {fighters.length > 0 && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => setCurrentTab("review")} 
                        className="w-full"
                      >
                        Continue to Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Start Game</CardTitle>
              <CardDescription>
                Review your temporary warband details before starting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{warband?.name}</h3>
                  <p className="text-muted-foreground">{warband?.faction}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Fighters: {fighters.length}</h4>
                  <div className="border rounded-md p-4 space-y-3">
                    {fighters.map((fighter, index) => (
                      <div key={index} className="p-3 rounded-md bg-card flex justify-between">
                        <div>
                          <h3 className="font-medium">{fighter.name}</h3>
                          <p className="text-sm text-muted-foreground">{fighter.type}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs text-center">
                          <div>
                            <span className="block text-muted-foreground">M</span>
                            <span>{fighter.move}"</span>
                          </div>
                          <div>
                            <span className="block text-muted-foreground">T</span>
                            <span>{fighter.toughness}</span>
                          </div>
                          <div>
                            <span className="block text-muted-foreground">W</span>
                            <span>{fighter.wounds}</span>
                          </div>
                          <div>
                            <span className="block text-muted-foreground">A</span>
                            <span>{fighter.attacks}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentTab("add-fighters")}>
                    Back to Edit
                  </Button>
                  <Button onClick={startGame}>
                    Start Game with Temporary Warband
                  </Button>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> This warband is temporary and will only be available for this game session.
                    It will not be saved to your collection of warbands.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}