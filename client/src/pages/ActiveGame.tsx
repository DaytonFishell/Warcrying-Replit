import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Warband, Fighter } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

// Track ability usage, remaining wounds, and dice
type ActiveFighter = Fighter & {
  currentWounds: number;
  usedAbilities: string[];
  activationUsed: boolean;
};

type ActiveWarband = {
  warband: Warband;
  fighters: ActiveFighter[];
  dicePool: {
    single: number[];
    double: number[];
    triple: number[];
    quad: number[];
  };
};

const DiceIcon = ({ value }: { value: number }) => {
  switch (value) {
    case 1:
      return <Dice1 className="h-6 w-6" />;
    case 2:
      return <Dice2 className="h-6 w-6" />;
    case 3:
      return <Dice3 className="h-6 w-6" />;
    case 4:
      return <Dice4 className="h-6 w-6" />;
    case 5:
      return <Dice5 className="h-6 w-6" />;
    case 6:
      return <Dice6 className="h-6 w-6" />;
    default:
      return <Dice1 className="h-6 w-6" />;
  }
};

export default function ActiveGame() {
  // State for the active game
  const [activeGame, setActiveGame] = useState<{
    battleRound: number;
    warbandTurn: number;
    activeWarbands: ActiveWarband[];
  }>({
    battleRound: 1,
    warbandTurn: 0,
    activeWarbands: [],
  });

  // Selected warbands for the game
  const [selectedWarbandIds, setSelectedWarbandIds] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [usingTempWarband, setUsingTempWarband] = useState(false);

  // Check if using a temporary warband (from URL parameter)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('temp') === 'true') {
      const tempWarband = JSON.parse(sessionStorage.getItem('temp_warband') || 'null');
      const tempFighters = JSON.parse(sessionStorage.getItem('temp_fighters') || '[]');
      
      if (tempWarband) {
        setUsingTempWarband(true);
        setSelectedWarbandIds([tempWarband.id]);
        
        // Auto-start game with temp warband
        const activeWarbands: ActiveWarband[] = [{
          warband: tempWarband,
          fighters: tempFighters.map((fighter: Fighter) => ({
            ...fighter,
            currentWounds: fighter.wounds,
            usedAbilities: [],
            activationUsed: false,
          })),
          dicePool: {
            single: [],
            double: [],
            triple: [],
            quad: []
          }
        }];
        
        setActiveGame({
          battleRound: 1,
          warbandTurn: 0,
          activeWarbands,
        });
        setGameStarted(true);
      }
    }
  }, []);

  // Fetch warbands
  const { data: warbands, isLoading: isLoadingWarbands } = useQuery<Warband[]>({
    queryKey: ['/api/warbands'],
    enabled: !usingTempWarband, // Don't fetch if using temp warband
  });

  // Fetch fighters for the selected warbands
  const { data: allFighters, isLoading: isLoadingFighters } = useQuery<Fighter[]>({
    queryKey: ['/api/fighters'],
    enabled: !usingTempWarband, // Don't fetch if using temp warband
  });

  // Initialize the game
  const startGame = () => {
    if (selectedWarbandIds.length < 1) return;

    const selectedWarbands = warbands?.filter(w => selectedWarbandIds.includes(w.id)) || [];
    const activeWarbands: ActiveWarband[] = selectedWarbands.map(warband => {
      const warbandFighters = allFighters?.filter(f => f.warbandId === warband.id) || [];
      const activeFighters: ActiveFighter[] = warbandFighters.map(fighter => ({
        ...fighter,
        currentWounds: fighter.wounds,
        usedAbilities: [],
        activationUsed: false,
      }));

      return {
        warband,
        fighters: activeFighters,
        dicePool: {
          single: [],
          double: [],
          triple: [],
          quad: []
        }
      };
    });

    setActiveGame({
      battleRound: 1,
      warbandTurn: 0,
      activeWarbands,
    });
    setGameStarted(true);
  };

  // Roll dice for a warband
  const rollDice = (warbandIndex: number) => {
    const diceCount = 6; // Standard dice pool
    const newDice: number[] = Array(diceCount).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    
    // Group dice by value to find doubles, triples, etc.
    const diceCountByValue: {[key: number]: number} = {};
    newDice.forEach(die => {
      diceCountByValue[die] = (diceCountByValue[die] || 0) + 1;
    });

    // Create collections of matched dice
    const single: number[] = [];
    const double: number[] = [];
    const triple: number[] = [];
    const quad: number[] = [];

    Object.entries(diceCountByValue).forEach(([dieValue, count]) => {
      const value = parseInt(dieValue);
      
      if (count === 1) {
        single.push(value);
      } else if (count === 2) {
        double.push(value);
      } else if (count === 3) {
        triple.push(value);
      } else if (count >= 4) {
        quad.push(value);
      }
    });

    // Update the dice pool
    const updatedWarbands = [...activeGame.activeWarbands];
    updatedWarbands[warbandIndex].dicePool = {
      single,
      double,
      triple,
      quad
    };

    setActiveGame({
      ...activeGame,
      activeWarbands: updatedWarbands,
    });
  };

  // Apply damage to a fighter
  const applyDamage = (warbandIndex: number, fighterIndex: number, damage: number) => {
    const updatedWarbands = [...activeGame.activeWarbands];
    const fighter = updatedWarbands[warbandIndex].fighters[fighterIndex];
    
    fighter.currentWounds = Math.max(0, fighter.currentWounds - damage);
    
    setActiveGame({
      ...activeGame,
      activeWarbands: updatedWarbands,
    });
  };

  // Heal a fighter
  const healFighter = (warbandIndex: number, fighterIndex: number, amount: number) => {
    const updatedWarbands = [...activeGame.activeWarbands];
    const fighter = updatedWarbands[warbandIndex].fighters[fighterIndex];
    
    fighter.currentWounds = Math.min(fighter.wounds, fighter.currentWounds + amount);
    
    setActiveGame({
      ...activeGame,
      activeWarbands: updatedWarbands,
    });
  };

  // Mark a fighter's activation as used
  const toggleActivation = (warbandIndex: number, fighterIndex: number) => {
    const updatedWarbands = [...activeGame.activeWarbands];
    const fighter = updatedWarbands[warbandIndex].fighters[fighterIndex];
    
    fighter.activationUsed = !fighter.activationUsed;
    
    setActiveGame({
      ...activeGame,
      activeWarbands: updatedWarbands,
    });
  };

  // End the current warband's turn
  const endTurn = () => {
    let nextWarbandTurn = (activeGame.warbandTurn + 1) % activeGame.activeWarbands.length;
    let nextBattleRound = activeGame.battleRound;
    
    // If we've gone through all warbands, increment the battle round
    if (nextWarbandTurn === 0) {
      nextBattleRound += 1;
      
      // Reset all fighter activations for the new round
      const resetWarbands = activeGame.activeWarbands.map(warband => ({
        ...warband,
        fighters: warband.fighters.map(fighter => ({
          ...fighter,
          activationUsed: false,
        })),
      }));
      
      setActiveGame({
        battleRound: nextBattleRound,
        warbandTurn: nextWarbandTurn,
        activeWarbands: resetWarbands,
      });
    } else {
      setActiveGame({
        ...activeGame,
        battleRound: nextBattleRound,
        warbandTurn: nextWarbandTurn,
      });
    }
  };

  // Reset the game
  const resetGame = () => {
    setGameStarted(false);
    setSelectedWarbandIds([]);
  };

  if (!gameStarted) {
    return (
      <div className="container mx-auto my-8">
        <h1 className="text-3xl font-cinzel font-bold mb-6">Start New Game</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Select Warbands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="warband1">Warband 1</Label>
                <Select 
                  value={selectedWarbandIds[0]?.toString() || ""} 
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    setSelectedWarbandIds(prev => {
                      const newIds = [...prev];
                      newIds[0] = id;
                      return newIds;
                    });
                  }}
                  disabled={isLoadingWarbands}
                >
                  <SelectTrigger id="warband1">
                    <SelectValue placeholder="Select a warband" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingWarbands ? (
                      <div className="p-2">
                        <Skeleton className="h-5 w-full" />
                      </div>
                    ) : (
                      warbands?.map((warband) => (
                        <SelectItem key={warband.id} value={warband.id.toString()}>
                          {warband.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="warband2">Warband 2 (Optional)</Label>
                <Select 
                  value={selectedWarbandIds[1]?.toString() || ""} 
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    setSelectedWarbandIds(prev => {
                      const newIds = [...prev];
                      newIds[1] = id;
                      return newIds;
                    });
                  }}
                  disabled={isLoadingWarbands}
                >
                  <SelectTrigger id="warband2">
                    <SelectValue placeholder="Select a warband" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingWarbands ? (
                      <div className="p-2">
                        <Skeleton className="h-5 w-full" />
                      </div>
                    ) : (
                      warbands?.map((warband) => (
                        <SelectItem 
                          key={warband.id} 
                          value={warband.id.toString()}
                          disabled={warband.id === selectedWarbandIds[0]}
                        >
                          {warband.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={startGame} 
                disabled={selectedWarbandIds.length === 0 || isLoadingWarbands || isLoadingFighters}
                className="w-full mt-4"
              >
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Current active warband
  const activeWarband = activeGame.activeWarbands[activeGame.warbandTurn];

  return (
    <div className="container mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-cinzel font-bold">Active Game Tracker</h1>
        <div className="flex items-center space-x-2">
          <div className="bg-card px-3 py-1 rounded-md">
            <span className="text-sm text-muted-foreground">Round</span>
            <span className="ml-2 font-bold">{activeGame.battleRound}</span>
          </div>
          <Button variant="outline" onClick={resetGame}>
            End Game
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="warband">
        <TabsList className="mb-4">
          <TabsTrigger value="warband">Warband View</TabsTrigger>
          <TabsTrigger value="dice">Dice Pool</TabsTrigger>
        </TabsList>
        
        <TabsContent value="warband">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeGame.activeWarbands.map((activeWarband, warbandIndex) => (
              <Card 
                key={activeWarband.warband.id} 
                className={`${activeGame.warbandTurn === warbandIndex ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{activeWarband.warband.name}</CardTitle>
                    {activeGame.warbandTurn === warbandIndex && (
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">Active Turn</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {activeWarband.fighters.map((fighter, fighterIndex) => (
                      <div key={fighter.id} className="border p-3 rounded-md relative">
                        <div className="absolute top-2 right-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleActivation(warbandIndex, fighterIndex)}
                            className={`${fighter.activationUsed ? 'text-muted-foreground' : 'text-primary'}`}
                          >
                            {fighter.activationUsed ? <XCircle size={18} /> : <CheckCircle size={18} />}
                          </Button>
                        </div>
                        
                        <h3 className="font-bold">{fighter.name}</h3>
                        <p className="text-sm text-muted-foreground">{fighter.type}</p>
                        
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Wounds: {fighter.currentWounds}/{fighter.wounds}</span>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => applyDamage(warbandIndex, fighterIndex, 1)}
                                  className="h-7 px-2 text-xs"
                                >
                                  -1
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => healFighter(warbandIndex, fighterIndex, 1)}
                                  className="h-7 px-2 text-xs"
                                >
                                  +1
                                </Button>
                              </div>
                            </div>
                            <Progress 
                              value={(fighter.currentWounds / fighter.wounds) * 100} 
                              className="h-2"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 gap-1 text-xs text-center">
                            <div>
                              <span className="block text-muted-foreground">M</span>
                              <span>{fighter.move}"</span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground">S</span>
                              <span>{fighter.strength}</span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground">T</span>
                              <span>{fighter.toughness}</span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground">A</span>
                              <span>{fighter.attacks}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {activeGame.warbandTurn === warbandIndex && (
                      <div className="flex justify-end mt-4">
                        <Button variant="default" onClick={() => rollDice(warbandIndex)} className="mr-2">
                          Roll Dice
                        </Button>
                        <Button variant="secondary" onClick={endTurn}>
                          End Turn
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="dice">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeGame.activeWarbands.map((activeWarband, warbandIndex) => (
              <Card 
                key={activeWarband.warband.id} 
                className={`${activeGame.warbandTurn === warbandIndex ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader>
                  <CardTitle>{activeWarband.warband.name}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Singles */}
                    <div>
                      <h3 className="font-medium mb-2">Single Dice</h3>
                      <div className="flex flex-wrap gap-2">
                        {activeWarband.dicePool.single.length > 0 ? (
                          activeWarband.dicePool.single.map((die, idx) => (
                            <div key={idx} className="bg-card p-2 rounded-md">
                              <DiceIcon value={die} />
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No single dice</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Doubles */}
                    <div>
                      <h3 className="font-medium mb-2">Doubles</h3>
                      <div className="flex flex-wrap gap-2">
                        {activeWarband.dicePool.double.length > 0 ? (
                          activeWarband.dicePool.double.map((die, idx) => (
                            <div key={idx} className="bg-primary/20 p-2 rounded-md flex">
                              <DiceIcon value={die} />
                              <DiceIcon value={die} />
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No doubles</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Triples */}
                    <div>
                      <h3 className="font-medium mb-2">Triples</h3>
                      <div className="flex flex-wrap gap-2">
                        {activeWarband.dicePool.triple.length > 0 ? (
                          activeWarband.dicePool.triple.map((die, idx) => (
                            <div key={idx} className="bg-secondary/20 p-2 rounded-md flex">
                              <DiceIcon value={die} />
                              <DiceIcon value={die} />
                              <DiceIcon value={die} />
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No triples</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Quads */}
                    <div>
                      <h3 className="font-medium mb-2">Quads</h3>
                      <div className="flex flex-wrap gap-2">
                        {activeWarband.dicePool.quad.length > 0 ? (
                          activeWarband.dicePool.quad.map((die, idx) => (
                            <div key={idx} className="bg-destructive/20 p-2 rounded-md flex">
                              <DiceIcon value={die} />
                              <DiceIcon value={die} />
                              <DiceIcon value={die} />
                              <DiceIcon value={die} />
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No quads</p>
                        )}
                      </div>
                    </div>
                    
                    {activeGame.warbandTurn === warbandIndex && (
                      <Button variant="default" onClick={() => rollDice(warbandIndex)} className="w-full mt-2">
                        Roll Dice
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}