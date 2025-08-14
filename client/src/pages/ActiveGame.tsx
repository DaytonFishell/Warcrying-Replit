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
import { CheckCircle, XCircle, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Crown, Zap, Heart, Shield, Sword, RotateCcw, ArrowRight, Users, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import LazyWarbandSetup from "@/components/LazyWarbandSetup";

// Enhanced fighter tracking with treasure and status effects
type ActiveFighter = Fighter & {
  currentWounds: number;
  usedAbilities: string[];
  activationUsed: boolean;
  hasTreasure: boolean;
  statusEffects: string[];
  abilityDice: {
    [abilityName: string]: {
      used: boolean;
      diceValue?: number;
    };
  };
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
  totalTreasures: number;
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
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
  const [usingPublicWarband, setUsingPublicWarband] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showLazySetup, setShowLazySetup] = useState(false);

  // Check if using a temporary or public warband (from URL parameters)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for temporary warband
    if (urlParams.get('temp') === 'true') {
      const tempWarband = JSON.parse(sessionStorage.getItem('temp_warband') || 'null');
      const tempFighters = JSON.parse(sessionStorage.getItem('temp_fighters') || '[]');
      
      if (tempWarband) {
        setUsingTempWarband(true);
        setIsGuestMode(!isAuthenticated);
        setSelectedWarbandIds([tempWarband.id]);
        
        // Auto-start game with temp warband
        const activeWarbands: ActiveWarband[] = [{
          warband: tempWarband,
          fighters: tempFighters.map((fighter: Fighter) => ({
            ...fighter,
            currentWounds: fighter.wounds,
            usedAbilities: [],
            activationUsed: false,
            hasTreasure: false,
            statusEffects: [],
            abilityDice: {},
          })),
          dicePool: {
            single: [],
            double: [],
            triple: [],
            quad: []
          },
          totalTreasures: 0
        }];
        
        setActiveGame({
          battleRound: 1,
          warbandTurn: 0,
          activeWarbands,
        });
        setGameStarted(true);
      }
    }
    
    // Check for public warband ID
    const publicWarbandId = urlParams.get('public');
    if (publicWarbandId) {
      setUsingPublicWarband(true);
      setIsGuestMode(!isAuthenticated);
      // Will be handled by the public warband fetch
    }
  }, [isAuthenticated]);

  // Fetch authenticated user's warbands
  const { data: warbands, isLoading: isLoadingWarbands } = useQuery<Warband[]>({
    queryKey: ['/api/warbands'],
    enabled: isAuthenticated && !usingTempWarband && !usingPublicWarband,
  });

  // Fetch fighters for authenticated user's warbands
  const { data: allFighters, isLoading: isLoadingFighters } = useQuery<Fighter[]>({
    queryKey: ['/api/fighters'],
    enabled: isAuthenticated && !usingTempWarband && !usingPublicWarband,
  });

  // Fetch public warband if specified
  const urlParams = new URLSearchParams(window.location.search);
  const publicWarbandId = urlParams.get('public');
  const { data: publicWarband, isLoading: isLoadingPublicWarband } = useQuery<Warband>({
    queryKey: ['/api/public/warbands', publicWarbandId],
    enabled: !!publicWarbandId && usingPublicWarband,
  });

  // Fetch fighters for public warband
  const { data: publicFighters, isLoading: isLoadingPublicFighters } = useQuery<Fighter[]>({
    queryKey: ['/api/public/warbands', publicWarbandId, 'fighters'],
    enabled: !!publicWarbandId && usingPublicWarband,
  });

  // Auto-start game with public warband when data is loaded
  useEffect(() => {
    if (usingPublicWarband && publicWarband && publicFighters) {
      const activeWarbands: ActiveWarband[] = [{
        warband: publicWarband,
        fighters: publicFighters.map((fighter: Fighter) => ({
          ...fighter,
          currentWounds: fighter.wounds,
          usedAbilities: [],
          activationUsed: false,
          hasTreasure: false,
          statusEffects: [],
          abilityDice: {},
        })),
        dicePool: {
          single: [],
          double: [],
          triple: [],
          quad: []
        },
        totalTreasures: 0
      }];
      
      setActiveGame({
        battleRound: 1,
        warbandTurn: 0,
        activeWarbands,
      });
      setGameStarted(true);
    }
  }, [usingPublicWarband, publicWarband, publicFighters]);

  // Initialize the game with authenticated user's warbands
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
        hasTreasure: false,
        statusEffects: [],
        abilityDice: {},
      }));

      return {
        warband,
        fighters: activeFighters,
        dicePool: {
          single: [],
          double: [],
          triple: [],
          quad: []
        },
        totalTreasures: 0
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
      
      // Reset all fighter activations and ability dice for the new round
      const resetWarbands = activeGame.activeWarbands.map(warband => ({
        ...warband,
        fighters: warband.fighters.map(fighter => ({
          ...fighter,
          activationUsed: false,
          abilityDice: {}, // Clear ability dice for new round
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

  // Toggle treasure for a fighter
  const toggleTreasure = (warbandIndex: number, fighterIndex: number) => {
    const updatedWarbands = [...activeGame.activeWarbands];
    const fighter = updatedWarbands[warbandIndex].fighters[fighterIndex];
    
    fighter.hasTreasure = !fighter.hasTreasure;
    
    // Update warband treasure count
    if (fighter.hasTreasure) {
      updatedWarbands[warbandIndex].totalTreasures += 1;
    } else {
      updatedWarbands[warbandIndex].totalTreasures -= 1;
    }
    
    setActiveGame({
      ...activeGame,
      activeWarbands: updatedWarbands,
    });
  };

  // Add/remove status effect
  const toggleStatusEffect = (warbandIndex: number, fighterIndex: number, effect: string) => {
    const updatedWarbands = [...activeGame.activeWarbands];
    const fighter = updatedWarbands[warbandIndex].fighters[fighterIndex];
    
    if (fighter.statusEffects.includes(effect)) {
      fighter.statusEffects = fighter.statusEffects.filter(e => e !== effect);
    } else {
      fighter.statusEffects.push(effect);
    }
    
    setActiveGame({
      ...activeGame,
      activeWarbands: updatedWarbands,
    });
  };

  // Track ability dice usage
  const setAbilityDice = (warbandIndex: number, fighterIndex: number, ability: string, diceValue: number) => {
    const updatedWarbands = [...activeGame.activeWarbands];
    const fighter = updatedWarbands[warbandIndex].fighters[fighterIndex];
    
    fighter.abilityDice[ability] = {
      used: true,
      diceValue: diceValue,
    };
    
    setActiveGame({
      ...activeGame,
      activeWarbands: updatedWarbands,
    });
  };

  // Clear ability dice for new round
  const clearAbilityDice = (warbandIndex: number, fighterIndex: number) => {
    const updatedWarbands = [...activeGame.activeWarbands];
    const fighter = updatedWarbands[warbandIndex].fighters[fighterIndex];
    
    fighter.abilityDice = {};
    
    setActiveGame({
      ...activeGame,
      activeWarbands: updatedWarbands,
    });
  };

  // Reset the game
  const resetGame = () => {
    setGameStarted(false);
    setSelectedWarbandIds([]);
    setUsingTempWarband(false);
    
    // Clear temporary warband data
    sessionStorage.removeItem('temp_warband');
    sessionStorage.removeItem('temp_fighters');
  };

  // Fetch public warbands for guest users
  const { data: publicWarbands, isLoading: isLoadingPublicWarbands } = useQuery<Warband[]>({
    queryKey: ['/api/public/warbands'],
    enabled: !isAuthenticated && !usingTempWarband && !usingPublicWarband && !showLazySetup,
  });

  // Handle lazy setup completion
  const handleLazySetupComplete = (warbandData: any) => {
    setUsingTempWarband(true);
    setIsGuestMode(true);
    setShowLazySetup(false);
    
    // Start game with lazy warband
    const activeWarbands: ActiveWarband[] = [{
      warband: warbandData.warband,
      fighters: warbandData.fighters.map((fighter: Fighter) => ({
        ...fighter,
        currentWounds: fighter.wounds,
        usedAbilities: [],
        activationUsed: false,
        hasTreasure: false,
        statusEffects: [],
        abilityDice: {},
      })),
      dicePool: {
        single: [],
        double: [],
        triple: [],
        quad: []
      },
      totalTreasures: 0
    }];
    
    setActiveGame({
      battleRound: 1,
      warbandTurn: 0,
      activeWarbands,
    });
    setGameStarted(true);
  };

  // Show lazy setup if requested
  if (showLazySetup) {
    return (
      <div className="container mx-auto my-8">
        <LazyWarbandSetup 
          onComplete={handleLazySetupComplete}
          onCancel={() => setShowLazySetup(false)}
        />
      </div>
    );
  }

  if (!gameStarted) {
    // If not authenticated and no temp/public warband, show guest options
    if (!isAuthenticated && !usingTempWarband && !usingPublicWarband) {
      return (
        <div className="container mx-auto my-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-cinzel font-bold mb-4">Welcome to Active Game Tracker</h1>
            <p className="text-muted-foreground mb-6">
              Experience the full battle tracking features! Choose how you'd like to play:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Quick Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Fastest way to start! Just enter fighter names and wounds - perfect for casual games.
                </p>
                <Button 
                  onClick={() => setShowLazySetup(true)}
                  className="w-full"
                >
                  Quick Setup
                </Button>
              </CardContent>
            </Card>

            {/* Create Temporary Warband */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Full Temporary Warband
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a detailed temporary warband with full stats and abilities for this session.
                </p>
                <Button 
                  onClick={() => window.location.href = "/temp-warband"}
                  className="w-full"
                  variant="outline"
                >
                  Create Detailed Warband
                </Button>
              </CardContent>
            </Card>

            {/* Browse Public Warbands */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Use Public Warband
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse community-shared warbands and start playing immediately.
                </p>
                {isLoadingPublicWarbands ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : publicWarbands && publicWarbands.length > 0 ? (
                  <div className="space-y-2">
                    <Select 
                      onValueChange={(value) => {
                        const id = parseInt(value);
                        window.location.href = `/active-game?public=${id}`;
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a public warband" />
                      </SelectTrigger>
                      <SelectContent>
                        {publicWarbands.map((warband) => (
                          <SelectItem key={warband.id} value={warband.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{warband.name}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {warband.faction}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => window.location.href = "/public-warbands"}
                      variant="outline"
                      className="w-full"
                    >
                      Browse All Public Warbands
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">No public warbands available</p>
                    <Button 
                      onClick={() => window.location.href = "/public-warbands"}
                      variant="outline"
                      className="w-full"
                    >
                      Explore Community
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Want to save your progress and access all features?
            </p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Sign In to Continue
            </Button>
          </div>
        </div>
      );
    }

    // Authenticated user warband selection
    return (
      <div className="container mx-auto my-8">
        <h1 className="text-3xl font-cinzel font-bold mb-6">Start New Game</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Select Your Warbands</CardTitle>
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
    <div className="w-full px-4 py-4 md:py-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl md:text-3xl font-cinzel font-bold">Active Game Tracker</h1>
        <div className="flex items-center space-x-2">
          <div className="bg-card px-3 py-1 rounded-md">
            <span className="text-sm text-muted-foreground">Round</span>
            <span className="ml-2 font-bold">{activeGame.battleRound}</span>
          </div>
          <Button variant="outline" onClick={resetGame} size="sm">
            End Game
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="warband">
        <TabsList className="mb-4 grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="warband" className="text-xs md:text-sm">Warband View</TabsTrigger>
          <TabsTrigger value="dice" className="text-xs md:text-sm">Dice Pool</TabsTrigger>
          <TabsTrigger value="battle-tools" className="text-xs md:text-sm">Battle Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="warband">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                  {/* Warband Status */}
                  <div className="flex justify-between items-center mb-4 p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Treasures: {activeWarband.totalTreasures}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {activeWarband.fighters.map((fighter, fighterIndex) => (
                      <div key={fighter.id} className="border p-4 rounded-md relative">
                        {/* Activation Status */}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {fighter.hasTreasure && (
                            <Badge variant="secondary" className="h-6 px-2">
                              <Crown className="h-3 w-3 mr-1" />
                              Treasure
                            </Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleActivation(warbandIndex, fighterIndex)}
                            className={`${fighter.activationUsed ? 'text-muted-foreground' : 'text-primary'}`}
                          >
                            {fighter.activationUsed ? <XCircle size={18} /> : <CheckCircle size={18} />}
                          </Button>
                        </div>
                        
                        {/* Fighter Info */}
                        <div className="mb-3">
                          <h3 className="font-bold text-lg">{fighter.name}</h3>
                          <p className="text-sm text-muted-foreground">{fighter.type}</p>
                        </div>

                        {/* Status Effects */}
                        {fighter.statusEffects.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {fighter.statusEffects.map((effect, effectIndex) => (
                                <Badge 
                                  key={effectIndex} 
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => toggleStatusEffect(warbandIndex, fighterIndex, effect)}
                                >
                                  {effect} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Health Management */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-red-500" />
                              Wounds: {fighter.currentWounds}/{fighter.wounds}
                            </span>
                            <div className="flex space-x-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => applyDamage(warbandIndex, fighterIndex, 5)}
                                className="h-7 px-2 text-xs"
                              >
                                -5
                              </Button>
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
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => healFighter(warbandIndex, fighterIndex, 5)}
                                className="h-7 px-2 text-xs"
                              >
                                +5
                              </Button>
                            </div>
                          </div>
                          <Progress 
                            value={(fighter.currentWounds / fighter.wounds) * 100} 
                            className="h-3"
                          />
                        </div>

                        {/* Fighter Stats */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs text-center mb-3">
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="block text-muted-foreground">Move</span>
                            <span className="font-medium">{fighter.move}"</span>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="block text-muted-foreground">Str</span>
                            <span className="font-medium">{fighter.strength}</span>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="block text-muted-foreground">Tough</span>
                            <span className="font-medium">{fighter.toughness}</span>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="block text-muted-foreground">Atks</span>
                            <span className="font-medium">{fighter.attacks}</span>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="block text-muted-foreground">Dam</span>
                            <span className="font-medium">{fighter.damage}</span>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="block text-muted-foreground">Crit</span>
                            <span className="font-medium">{fighter.criticalDamage}</span>
                          </div>
                        </div>

                        {/* Abilities & Dice Tracking */}
                        {Array.isArray(fighter.abilities) && fighter.abilities.length > 0 && (
                          <div className="mb-3">
                            <Label className="text-xs text-muted-foreground mb-1 block">Abilities</Label>
                            <div className="grid grid-cols-2 gap-1">
                              {fighter.abilities.map((ability: string, abilityIndex: number) => (
                                <div key={abilityIndex} className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs">
                                  <span className="truncate">{ability}</span>
                                  <div className="flex items-center gap-1">
                                    {fighter.abilityDice[ability] ? (
                                      <Badge variant="secondary" className="h-5 px-1 text-xs">
                                        <DiceIcon value={fighter.abilityDice[ability].diceValue || 1} />
                                      </Badge>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0"
                                        onClick={() => {
                                          const diceValue = Math.floor(Math.random() * 6) + 1;
                                          setAbilityDice(warbandIndex, fighterIndex, ability, diceValue);
                                        }}
                                      >
                                        <Zap className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTreasure(warbandIndex, fighterIndex)}
                            className={`h-7 text-xs ${fighter.hasTreasure ? 'bg-yellow-100 border-yellow-300' : ''}`}
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Treasure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatusEffect(warbandIndex, fighterIndex, 'Stunned')}
                            className={`h-7 text-xs ${fighter.statusEffects.includes('Stunned') ? 'bg-red-100 border-red-300' : ''}`}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Stunned
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatusEffect(warbandIndex, fighterIndex, 'Flying')}
                            className={`h-7 text-xs ${fighter.statusEffects.includes('Flying') ? 'bg-blue-100 border-blue-300' : ''}`}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Flying
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearAbilityDice(warbandIndex, fighterIndex)}
                            className="h-7 text-xs"
                          >
                            Clear Dice
                          </Button>
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

        <TabsContent value="battle-tools">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Battle Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Battle Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-md">
                      <div className="text-2xl font-bold">{activeGame.battleRound}</div>
                      <div className="text-sm text-muted-foreground">Current Round</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-md">
                      <div className="text-2xl font-bold">
                        {activeGame.activeWarbands.reduce((total, warband) => total + warband.totalTreasures, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Treasures</div>
                    </div>
                  </div>

                  {/* Warband Status Overview */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Warband Status</h4>
                    {activeGame.activeWarbands.map((warband, index) => {
                      const activeFighters = warband.fighters.filter(f => f.currentWounds > 0);
                      const totalFighters = warband.fighters.length;
                      const treasureHolders = warband.fighters.filter(f => f.hasTreasure);
                      
                      return (
                        <div key={warband.warband.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                          <div>
                            <span className="font-medium">{warband.warband.name}</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              activeGame.warbandTurn === index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              {activeGame.warbandTurn === index ? 'Active' : 'Waiting'}
                            </span>
                          </div>
                          <div className="text-sm text-right">
                            <div>{activeFighters.length}/{totalFighters} fighters active</div>
                            <div className="text-yellow-600">{treasureHolders.length} with treasure</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Round Management */}
                  <div>
                    <h4 className="font-medium mb-2">Round Management</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          // Reset all activations
                          const resetWarbands = activeGame.activeWarbands.map(warband => ({
                            ...warband,
                            fighters: warband.fighters.map(fighter => ({
                              ...fighter,
                              activationUsed: false,
                              abilityDice: {},
                            })),
                          }));
                          
                          setActiveGame({
                            ...activeGame,
                            activeWarbands: resetWarbands,
                            warbandTurn: 0,
                          });
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Round
                      </Button>
                      <Button variant="outline" onClick={endTurn}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        End Turn
                      </Button>
                    </div>
                  </div>

                  {/* Status Effects Management */}
                  <div>
                    <h4 className="font-medium mb-2">Common Status Effects</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['Stunned', 'Flying', 'Inspired', 'Downed'].map(effect => (
                        <div key={effect} className="text-center">
                          <div className="text-sm font-medium">{effect}</div>
                          <div className="text-xs text-muted-foreground">
                            {activeGame.activeWarbands.reduce((count, warband) => 
                              count + warband.fighters.filter(f => f.statusEffects.includes(effect)).length, 0
                            )} affected
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mass Actions */}
                  <div>
                    <h4 className="font-medium mb-2">Mass Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => {
                          // Clear all status effects
                          const clearedWarbands = activeGame.activeWarbands.map(warband => ({
                            ...warband,
                            fighters: warband.fighters.map(fighter => ({
                              ...fighter,
                              statusEffects: [],
                            })),
                          }));
                          
                          setActiveGame({
                            ...activeGame,
                            activeWarbands: clearedWarbands,
                          });
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Clear All Status Effects
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Clear all ability dice
                          const clearedWarbands = activeGame.activeWarbands.map(warband => ({
                            ...warband,
                            fighters: warband.fighters.map(fighter => ({
                              ...fighter,
                              abilityDice: {},
                            })),
                          }));
                          
                          setActiveGame({
                            ...activeGame,
                            activeWarbands: clearedWarbands,
                          });
                        }}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Clear All Ability Dice
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}