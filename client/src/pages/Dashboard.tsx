import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import WarbandCard from "@/components/WarbandCard";
import FighterCard from "@/components/FighterCard";
import BattleCard from "@/components/BattleCard";
import QuickActionCard from "@/components/QuickActionCard";
import RulesCard from "@/components/RulesCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Warband, Fighter, Battle } from "@shared/schema";

export default function Dashboard() {
  const { data: warbands, isLoading: isLoadingWarbands } = useQuery<Warband[]>({
    queryKey: ['/api/warbands'],
  });
  
  const { data: fighters, isLoading: isLoadingFighters } = useQuery<Fighter[]>({
    queryKey: ['/api/fighters'],
  });
  
  const { data: battles, isLoading: isLoadingBattles } = useQuery<Battle[]>({
    queryKey: ['/api/battles'],
  });
  
  const quickActions = [
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
  ];
  
  const ruleCategories = [
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
    }
  ];
  
  return (
    <div>
      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map(action => (
          <QuickActionCard 
            key={action.id}
            title={action.title}
            icon={action.icon}
            link={action.link}
          />
        ))}
      </div>
      
      {/* Recent Warbands Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-cinzel font-bold">Your Warbands</h2>
          <Link href="/warbands" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingWarbands ? (
            Array(3).fill(0).map((_, i) => (
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
          ) : (
            <>
              {warbands?.slice(0, 2).map(warband => (
                <WarbandCard key={warband.id} warband={warband} />
              ))}
              
              <Link href="/warbands/new" className="card border-2 border-dashed border-foreground/20 flex items-center justify-center p-10 cursor-pointer hover:border-primary/50">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="font-medium">Add New Warband</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </section>
      
      {/* Recent Battles Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-cinzel font-bold">Recent Battles</h2>
          <Link href="/battles" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Link>
        </div>
        
        <div className="space-y-4">
          {isLoadingBattles ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="card battle-card p-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="mt-3 md:mt-0 grid grid-cols-7 gap-2 items-center">
                    <div className="col-span-3">
                      <Skeleton className="h-5 w-full mb-2" />
                      <div className="flex justify-center gap-1 mt-1">
                        {Array(3).fill(0).map((_, j) => (
                          <Skeleton key={j} className="w-6 h-6 rounded-full" />
                        ))}
                      </div>
                    </div>
                    <div className="col-span-1 text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </div>
                    <div className="col-span-3">
                      <Skeleton className="h-5 w-full mb-2" />
                      <div className="flex justify-center gap-1 mt-1">
                        {Array(3).fill(0).map((_, j) => (
                          <Skeleton key={j} className="w-6 h-6 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            battles?.slice(0, 2).map(battle => (
              <BattleCard key={battle.id} battle={battle} />
            ))
          )}
        </div>
      </section>
      
      {/* Top Fighters Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-cinzel font-bold">Top Fighters</h2>
          <Link href="/fighters" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingFighters ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="h-40 overflow-hidden relative">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {Array(4).fill(0).map((_, j) => (
                      <div key={j}>
                        <Skeleton className="h-4 w-1/2 mb-1" />
                        <div className="flex items-center">
                          <Skeleton className="h-4 w-6 mr-2" />
                          <Skeleton className="h-2 flex-grow" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            fighters?.slice(0, 3)
              .sort((a, b) => b.kills - a.kills)
              .map(fighter => (
                <FighterCard key={fighter.id} fighter={fighter} />
              ))
          )}
        </div>
      </section>
      
      {/* Quick Rules Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-cinzel font-bold">Quick Rules Reference</h2>
          <Link href="/rules" className="text-primary hover:text-primary/80 text-sm font-medium">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg> 
            Full Rulebook
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ruleCategories.map(category => (
            <RulesCard key={category.id} title={category.title} steps={category.steps} />
          ))}
        </div>
      </section>
    </div>
  );
}
