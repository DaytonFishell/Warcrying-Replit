import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const fighterSchema = z.object({
  name: z.string().min(1, 'Fighter name is required'),
  role: z.string().min(1, 'Role is required'),
  weapons: z.string().min(1, 'Weapons are required'),
  toughness: z.number().min(1).max(10),
  wounds: z.number().min(1).max(50),
  move: z.number().min(1).max(20),
  points: z.number().min(1, 'Points must be at least 1'),
});

type FighterFormData = z.infer<typeof fighterSchema>;

export default function AddFighter() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get warband data from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const warbandName = urlParams.get('warband') || 'Unknown Warband';
  const returnPath = urlParams.get('return') || '/temp-warband';

  const form = useForm<FighterFormData>({
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

  const onSubmit = (data: FighterFormData) => {
    try {
      // Get existing fighters from localStorage
      const existingFighters = JSON.parse(localStorage.getItem('tempFighters') || '[]');
      
      // Create new fighter
      const newFighter = {
        id: Date.now(), // Simple ID generation for temp fighters
        ...data,
        currentWounds: data.wounds, // Start with full health
        isActivated: false,
        hasActivatedThisRound: false,
        treasure: 0,
        statusEffects: [],
        abilityDice: [],
        warbandId: warbandName, // Use warband name as ID for temp fighters
      };

      // Add to fighters list
      const updatedFighters = [...existingFighters, newFighter];
      localStorage.setItem('tempFighters', JSON.stringify(updatedFighters));

      toast({
        title: "Fighter Added",
        description: `${data.name} has been added to ${warbandName}`,
      });

      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add fighter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const roles = [
    "Champion", "Hero", "Leader", "Warrior", "Brute", "Monster", 
    "Archer", "Scout", "Assassin", "Berserker", "Mage", "Wizard"
  ];

  return (
    <div className="w-full px-4 py-4 md:py-8 pb-20">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation(returnPath)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-cinzel font-bold">Add Fighter</h1>
          <p className="text-muted-foreground">Adding to: {warbandName}</p>
        </div>
      </div>

      {/* Fighter Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Fighter
          </CardTitle>
          <CardDescription>
            Enter the fighter's details to add them to your warband.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fighter Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter fighter name" 
                        {...field} 
                        className="text-base" // Better for mobile
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
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

              {/* Weapons */}
              <FormField
                control={form.control}
                name="weapons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weapons</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Sword and Shield, Bow, Spear" 
                        {...field} 
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
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
                          className="text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                          className="text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                          className="text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                          className="text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 text-base"
                  disabled={form.formState.isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fighter
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation(returnPath)}
                  className="flex-1 h-12 text-base"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}