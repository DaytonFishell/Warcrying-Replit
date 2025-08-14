import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const lazyFighterSchema = z.object({
  name: z.string().min(1, "Fighter name is required"),
  wounds: z.number().min(1, "Wounds must be at least 1").max(100, "Wounds cannot exceed 100")
});

const lazyWarbandSchema = z.object({
  name: z.string().min(1, "Warband name is required"),
  fighters: z.array(lazyFighterSchema).min(1, "At least one fighter is required")
});

type LazyFighter = z.infer<typeof lazyFighterSchema>;
type LazyWarband = z.infer<typeof lazyWarbandSchema>;

interface LazyWarbandSetupProps {
  onComplete: (warband: any) => void;
  onCancel: () => void;
}

export default function LazyWarbandSetup({ onComplete, onCancel }: LazyWarbandSetupProps) {
  const { toast } = useToast();
  const [fighters, setFighters] = useState<LazyFighter[]>([
    { name: "", wounds: 1 }
  ]);

  const form = useForm<LazyWarband>({
    resolver: zodResolver(lazyWarbandSchema),
    defaultValues: {
      name: "",
      fighters: fighters
    }
  });

  const addFighter = () => {
    const newFighters = [...fighters, { name: "", wounds: 1 }];
    setFighters(newFighters);
    form.setValue("fighters", newFighters);
  };

  const removeFighter = (index: number) => {
    if (fighters.length > 1) {
      const newFighters = fighters.filter((_, i) => i !== index);
      setFighters(newFighters);
      form.setValue("fighters", newFighters);
    }
  };

  const updateFighter = (index: number, field: keyof LazyFighter, value: string | number) => {
    const newFighters = [...fighters];
    newFighters[index] = { ...newFighters[index], [field]: value };
    setFighters(newFighters);
    form.setValue("fighters", newFighters);
  };

  const onSubmit = (data: LazyWarband) => {
    // Convert lazy warband to full warband format
    const fullWarband = {
      id: Date.now(), // Temporary ID for session storage
      name: data.name,
      faction: "Mixed", // Default faction for lazy setup
      pointsLimit: 1000,
      currentPoints: data.fighters.length * 100, // Rough estimate
      description: "Quick setup warband",
      isPublic: false,
      isTemplate: false,
      templateSourceId: null,
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: null // Temporary warband
    };

    // Convert lazy fighters to full fighter format
    const fullFighters = data.fighters.map((fighter, index) => ({
      id: Date.now() + index, // Temporary ID
      warbandId: fullWarband.id,
      name: fighter.name,
      type: "Fighter", // Default type
      pointsCost: 100, // Default cost
      move: 4, // Default stats
      toughness: 4,
      wounds: fighter.wounds, // User-specified wounds
      strength: 4,
      attacks: 2,
      damage: "2",
      criticalDamage: "4",
      range: 1,
      abilities: [],
      imageUrl: null,
      battles: 0,
      kills: 0,
      deaths: 0
    }));

    // Store in session storage for temporary use
    const tempWarbandData = {
      warband: fullWarband,
      fighters: fullFighters
    };

    sessionStorage.setItem('tempWarbandData', JSON.stringify(tempWarbandData));

    toast({
      title: "Quick Warband Created!",
      description: `${data.name} is ready for battle with ${data.fighters.length} fighters.`
    });

    onComplete(tempWarbandData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Warband Setup
        </CardTitle>
        <CardDescription>
          Create a warband quickly - just enter names and wounds for your fighters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warband Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter warband name..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Fighters</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFighter}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Fighter
                </Button>
              </div>

              <div className="space-y-3">
                {fighters.map((fighter, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label className="text-sm">Fighter Name</Label>
                        <Input
                          placeholder={`Fighter ${index + 1}`}
                          value={fighter.name}
                          onChange={(e) => updateFighter(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-sm">Wounds</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={fighter.wounds}
                          onChange={(e) => updateFighter(index, "wounds", parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFighter(index)}
                        disabled={fighters.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-1">Note:</p>
                <p>Default stats will be applied: Move 4", Toughness 4, Strength 4, Attacks 2, Damage 2/4</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                Create & Start Game
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}