import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Rules() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const ruleSections = {
    combat: [
      {
        title: "Combat Sequence",
        content: [
          "Roll attack dice based on fighter's Attack value",
          "Compare Strength to target's Toughness to determine hit threshold",
          "Roll damage for each successful hit",
          "Reduce target's wound counter by damage amount"
        ]
      },
      {
        title: "Hit Roll",
        content: [
          "Roll equals to or greater than hit value (determined by Strength vs Toughness)",
          "Equal Strength and Toughness: Hit on 4+",
          "Strength higher than Toughness: Hit on 3+",
          "Strength twice or more than Toughness: Hit on 2+",
          "Strength lower than Toughness: Hit on 5+",
          "Strength half or less than Toughness: Hit on 6+"
        ]
      },
      {
        title: "Critical Hits",
        content: [
          "Natural 6 on attack dice is always a critical hit",
          "Critical hits use the critical damage value instead of normal damage",
          "Critical hits ignore modifiers to hit"
        ]
      }
    ],
    movement: [
      {
        title: "Movement Rules",
        content: [
          "Base move equals fighter's Move characteristic in inches",
          "Difficult terrain reduces movement by half",
          "Fighters cannot move through other fighters",
          "Climbing requires half movement cost per vertical inch"
        ]
      },
      {
        title: "Engagement",
        content: [
          "Fighters within 1\" of an enemy fighter are engaged",
          "Engaged fighters can only move away by disengaging",
          "Disengaging costs half the fighter's movement",
          "Engaged fighters can only attack fighters they are engaged with"
        ]
      },
      {
        title: "Jumping",
        content: [
          "Fighters can jump gaps up to their Movement value in inches",
          "For every 2\" of vertical descent, a fighter must make a falling test",
          "Failing a falling test causes impact damage"
        ]
      }
    ],
    abilities: [
      {
        title: "Ability Types",
        content: [
          "Double: Require two single actions of the same type",
          "Triple: Require three single actions of the same type",
          "Quad: Require four single actions of the same type",
          "Reaction: Can be used in response to specific triggers"
        ]
      },
      {
        title: "Ability Usage",
        content: [
          "Fighter can use one ability per activation",
          "Abilities can be used before or after moves or attacks",
          "Ability effects resolve immediately unless specified otherwise",
          "Some abilities have range limitations"
        ]
      }
    ],
    victory: [
      {
        title: "Victory Conditions",
        content: [
          "Most scenarios are won by scoring victory points",
          "Typically the first warband to reach 12 victory points wins",
          "Victory points are scored by completing objectives",
          "Some scenarios have unique victory conditions"
        ]
      },
      {
        title: "Twist Cards",
        content: [
          "Twist cards modify the battlefield or rules for the battle",
          "Draw a twist card at the start of the battle",
          "Apply the effects for the duration of the battle",
          "Some twists affect specific terrain or fighter types"
        ]
      }
    ],
    setup: [
      {
        title: "Battle Setup",
        content: [
          "Set up terrain according to the battlefield plan",
          "Draw and apply a twist card",
          "Roll for deployment zones",
          "Deploy fighters according to the scenario",
          "Determine initiative for the first battle round"
        ]
      },
      {
        title: "Battle Rounds",
        content: [
          "Each battle consists of four battle rounds",
          "Each round, players alternate activating fighters",
          "A fighter can perform two actions when activated",
          "At the end of each round, check victory conditions"
        ]
      }
    ]
  };
  
  // Filter rules based on search query
  const filterRules = () => {
    if (!searchQuery) return ruleSections;
    
    const filtered: any = {};
    
    Object.entries(ruleSections).forEach(([category, rules]) => {
      const filteredRules = rules.filter(rule => 
        rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.content.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      if (filteredRules.length > 0) {
        filtered[category] = filteredRules;
      }
    });
    
    return filtered;
  };
  
  const filteredRules = filterRules();
  const hasResults = Object.keys(filteredRules).length > 0;
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-cinzel font-bold mb-2">Rules Reference</h1>
        <p className="text-muted-foreground">Quick access to core rules and abilities</p>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search rules..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {!hasResults && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="bg-muted inline-flex p-3 rounded-full mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No rules found</h3>
            <p className="text-muted-foreground">No rules match your search criteria.</p>
          </CardContent>
        </Card>
      )}
      
      {hasResults && (
        <Tabs defaultValue="combat">
          <div className="mb-4 overflow-x-auto">
            <TabsList className="w-full justify-start">
              {Object.keys(filteredRules).map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="min-w-[120px]"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {Object.entries(filteredRules).map(([category, rules]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(rules as any[]).map((rule, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg font-cinzel text-primary">{rule.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        {rule.content.map((item: string, i: number) => (
                          <li key={i} className="text-foreground/90">{item}</li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {/* Battle Map Reference */}
      <section className="mt-8">
        <h2 className="text-xl font-cinzel font-bold mb-4">Battle Maps Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <div className="h-48 overflow-hidden relative">
              <img 
                src="https://pixabay.com/get/g9fb5bb3d0dbeaffb5ef9c01f6cc2bc80abceeda6abe38a1d2c55afe5a21c38a9cb8a642a0e580a35064fb37c6b17c87c43e3cb85ea07ca2d8dda3af3f0e85e05_1280.jpg" 
                alt="Fantasy battle map with terrain" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-cinzel font-bold text-white text-lg">Ruins of Shadespire</h3>
              </div>
            </div>
            <CardContent className="pt-4">
              <p className="text-muted-foreground mb-2">Urban ruins with plenty of cover and vertical elements.</p>
              <p><strong>Special Rules:</strong> Crumbling structures may collapse when fighters climb them.</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <div className="h-48 overflow-hidden relative">
              <img 
                src="https://pixabay.com/get/g0d5a82a5fe1a21ae989e3fe6a0bf8517bbc13a9536fd7efce9de5e18da1eafd0c86c9e3c0af53f76cd46fbdeefb85ef43d4c1f7fb54fcf9f4d49a3d3a8cfd3bd_1280.jpg" 
                alt="Fantasy forest battle map" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-cinzel font-bold text-white text-lg">Bloodroot Forest</h3>
              </div>
            </div>
            <CardContent className="pt-4">
              <p className="text-muted-foreground mb-2">Dense forest with difficult terrain and limited line of sight.</p>
              <p><strong>Special Rules:</strong> Forest areas count as difficult terrain and provide cover.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
