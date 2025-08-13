import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useMemo } from "react";
import MemoizedWarbandCard from "@/components/optimized/MemoizedWarbandCard";
import MemoizedFighterCard from "@/components/optimized/MemoizedFighterCard";
import BattleCard from "@/components/BattleCard";
import QuickActionCard from "@/components/QuickActionCard";
import RulesCard from "@/components/RulesCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Warband, Fighter, Battle } from "@shared/schema";

export default function OptimizedDashboard() {
  // Staggered data loading for better perceived performance
  const { data: warbands, isLoading: isLoadingWarbands } = useQuery<Warband[]>({
    queryKey: ['/api/warbands'],
  });
  
  const { data: fighters, isLoading: isLoadingFighters } = useQuery<Fighter[]>({
    queryKey: ['/api/fighters'],
    enabled: !!warbands, // Only load fighters after warbands are loaded
  });
  
  const { data: battles, isLoading: isLoadingBattles } = useQuery<Battle[]>({
    queryKey: ['/api/battles'],
    enabled: !!fighters, // Only load battles after fighters are loaded
  });
  
  // Memoized calculations to prevent unnecessary re-renders
  const stats = useMemo(() => {
    const totalWarbands = warbands?.length || 0;
    const totalFighters = fighters?.length || 0;
    const totalBattles = battles?.length || 0;
    const recentBattles = battles?.slice(-3) || [];
    const topWarbands = warbands?.slice(0, 3) || [];
    const recentFighters = fighters?.slice(-3) || [];
    
    return {
      totalWarbands,
      totalFighters,
      totalBattles,
      recentBattles,
      topWarbands,
      recentFighters
    };
  }, [warbands, fighters, battles]);
  
  const quickActions = useMemo(() => [
    { 
      id: 1, 
      title: "New Warband", 
      icon: "plus", 
      link: "/warbands/new" 
    },
    { 
      id: 2, 
      title: "Add Fighter", 
      icon: "user-plus", 
      link: "/fighters/new" 
    },
    { 
      id: 3, 
      title: "Log Battle", 
      icon: "swords", 
      link: "/battles/new" 
    },
    { 
      id: 4, 
      title: "Temp Warband", 
      icon: "zap", 
      link: "/temp-warband" 
    },
    { 
      id: 5, 
      title: "Quick Rules", 
      icon: "scroll", 
      link: "/rules" 
    }
  ], []);
  
  const ruleCategories = useMemo(() => [
    {
      id: 1,
      title: "Combat Sequence",
      steps: [
        "Roll attack dice based on fighter's Attack value",
        "Compare Strength to target's Toughness to determine hit threshold",
        "Roll damage for each successful hit",
        "Reduce target's wound counter by damage amount"
      ]
    },
    {
      id: 2,
      title: "Movement Rules",
      steps: [
        "Base move equals fighter's Move characteristic in inches",
        "Difficult terrain reduces movement by half",
        "Fighters cannot move through other fighters",
        "Climbing requires half movement cost per vertical inch"
      ]
    },
    {
      id: 3,
      title: "Ability Dice",
      steps: [
        "Roll 6 dice at start of each battle round",
        "Group dice by value (singles, doubles, triples, quads)",
        "Spend dice to activate abilities during the round",
        "Unused dice are lost at end of round"
      ]
    }
  ], []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Your Warcry gaming hub</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Warbands</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalWarbands}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Fighters</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalFighters}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Battles</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalBattles}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <QuickActionCard 
              key={action.id} 
              title={action.title}
              icon={action.icon}
              link={action.link}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Warbands */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Warbands</h2>
            <Link href="/warbands" className="text-primary hover:text-primary/80">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {isLoadingWarbands ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : stats.topWarbands.length > 0 ? (
              stats.topWarbands.map((warband) => (
                <MemoizedWarbandCard key={warband.id} warband={warband} />
              ))
            ) : (
              <p className="text-muted-foreground">No warbands yet. Create your first one!</p>
            )}
          </div>
        </div>

        {/* Recent Fighters */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Fighters</h2>
            <Link href="/fighters" className="text-primary hover:text-primary/80">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {isLoadingFighters ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : stats.recentFighters.length > 0 ? (
              stats.recentFighters.map((fighter) => (
                <MemoizedFighterCard key={fighter.id} fighter={fighter} />
              ))
            ) : (
              <p className="text-muted-foreground">No fighters yet. Add some to your warbands!</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Battles */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Battles</h2>
          <Link href="/battles" className="text-primary hover:text-primary/80">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingBattles ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : stats.recentBattles.length > 0 ? (
            stats.recentBattles.map((battle) => (
              <BattleCard key={battle.id} battle={battle} />
            ))
          ) : (
            <p className="text-muted-foreground col-span-3">No battles logged yet. Start tracking your games!</p>
          )}
        </div>
      </div>

      {/* Quick Rules Reference */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Rules Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ruleCategories.map((category) => (
            <RulesCard 
              key={category.id} 
              title={category.title}
              steps={category.steps}
            />
          ))}
        </div>
      </div>
    </div>
  );
}