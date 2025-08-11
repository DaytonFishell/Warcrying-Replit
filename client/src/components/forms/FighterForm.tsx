import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertFighterSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed Dialog imports - using inline forms instead
import { setLocalStorage } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";

// Extend the insertFighterSchema with validation rules
const formSchema = insertFighterSchema.extend({
  name: z.string().min(2, {
    message: "Fighter name must be at least 2 characters.",
  }),
  type: z.string().min(2, {
    message: "Fighter type must be at least 2 characters.",
  }),
  warbandId: z.number({
    required_error: "Please select a warband.",
  }),
  move: z.number().min(1, {
    message: "Move must be at least 1.",
  }).max(10, {
    message: "Move cannot exceed 10.",
  }),
  toughness: z.number().min(1, {
    message: "Toughness must be at least 1.",
  }).max(10, {
    message: "Toughness cannot exceed 10.",
  }),
  wounds: z.number().min(1, {
    message: "Wounds must be at least 1.",
  }),
  strength: z.number().min(1, {
    message: "Strength must be at least 1.",
  }).max(10, {
    message: "Strength cannot exceed 10.",
  }),
  attacks: z.number().min(1, {
    message: "Attacks must be at least 1.",
  }).max(10, {
    message: "Attacks cannot exceed 10.",
  }),
  damage: z.string().min(1, {
    message: "Damage is required.",
  }),
  criticalDamage: z.string().min(1, {
    message: "Critical damage is required.",
  }),
  range: z.number().min(1, {
    message: "Range must be at least 1.",
  })
});

interface FighterFormProps {
  fighter?: any;
  onSuccess?: () => void;
}

export default function FighterForm({ fighter, onSuccess }: FighterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const isEditing = !!fighter;
  
  // Fetch warbands for the dropdown
  const { data: warbands, isLoading: isLoadingWarbands } = useQuery({
    queryKey: ['/api/warbands'],
  });
  
  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing 
      ? { 
          name: fighter.name,
          warbandId: fighter.warbandId,
          type: fighter.type,
          pointsCost: fighter.pointsCost,
          move: fighter.move,
          toughness: fighter.toughness,
          wounds: fighter.wounds,
          strength: fighter.strength,
          attacks: fighter.attacks,
          damage: fighter.damage,
          criticalDamage: fighter.criticalDamage,
          range: fighter.range,
          abilities: fighter.abilities || [],
          imageUrl: fighter.imageUrl || "",
          battles: fighter.battles || 0,
          kills: fighter.kills || 0,
          deaths: fighter.deaths || 0
        } 
      : {
          name: "",
          warbandId: 0,
          type: "",
          pointsCost: 0,
          move: 4,
          toughness: 3,
          wounds: 10,
          strength: 3,
          attacks: 2,
          damage: "1",
          criticalDamage: "2",
          range: 1,
          abilities: [],
          imageUrl: "",
          battles: 0,
          kills: 0,
          deaths: 0
        }
  });

  // Create mutation for adding/updating fighter
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Make sure abilities is an array even if empty
      const finalValues = {
        ...values,
        abilities: values.abilities || []
      };
      
      if (isEditing) {
        return apiRequest('PATCH', `/api/fighters/${fighter.id}`, finalValues);
      } else {
        return apiRequest('POST', '/api/fighters', finalValues);
      }
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      // Update local storage
      const existingFighters = JSON.parse(localStorage.getItem('fighters') || '[]');
      
      if (isEditing) {
        const updatedFighters = existingFighters.map((f: any) => 
          f.id === fighter.id ? data : f
        );
        setLocalStorage('fighters', updatedFighters);
      } else {
        setLocalStorage('fighters', [...existingFighters, data]);
      }
      
      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ['/api/fighters'] });
      
      // If this is a new fighter, update the warband's fighter count in UI cache
      if (!isEditing) {
        queryClient.invalidateQueries({ queryKey: ['/api/warbands'] });
      }
      
      toast({
        title: isEditing ? "Fighter Updated" : "Fighter Created",
        description: isEditing 
          ? `${data.name} has been updated successfully.`
          : `${data.name} has been added to your fighters.`,
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} fighter: ${error}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    mutation.mutate(values);
  }

  const fighterTypes = [
    "Champion", "Hero", "Leader", "Warrior", "Brute", "Monster", 
    "Archer", "Scout", "Assassin", "Berserker", "Mage", "Wizard"
  ];

  return (
    <div>
      <div className="space-y-1.5 pb-4">
        <h2 className="text-lg font-semibold">{isEditing ? "Edit Fighter" : "Create New Fighter"}</h2>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Update your fighter's stats and details below."
            : "Fill in the details to create a new fighter for your warband."}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fighter Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grunak the Destroyer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="warbandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warband</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={isLoadingWarbands}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a warband" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingWarbands ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : (
                        warbands?.map((warband: any) => (
                          <SelectItem key={warband.id} value={warband.id.toString()}>
                            {warband.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fighter Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fighterTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pointsCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points Cost</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="move"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="toughness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Toughness</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))} 
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
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="strength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strength</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="attacks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attacks</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
              name="range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Range</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    In inches
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/fighter-image.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  Provide a URL to an image of your fighter
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update Fighter" : "Create Fighter"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
