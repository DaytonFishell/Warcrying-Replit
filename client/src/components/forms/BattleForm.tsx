import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertBattleSchema } from "@shared/schema";
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
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { setLocalStorage } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";

// Extend the insertBattleSchema with validation rules
const formSchema = insertBattleSchema.extend({
  name: z.string().min(2, {
    message: "Battle name must be at least 2 characters.",
  }),
  scenario: z.string().min(2, {
    message: "Scenario name must be at least 2 characters.",
  }),
  winnerId: z.number({
    required_error: "Please select a winner.",
  }),
  loserId: z.number({
    required_error: "Please select a loser.",
  })
});

interface BattleFormProps {
  battle?: any;
  onSuccess?: () => void;
}

export default function BattleForm({ battle, onSuccess }: BattleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const isEditing = !!battle;
  
  // Fetch warbands for the dropdown
  const { data: warbands, isLoading: isLoadingWarbands } = useQuery({
    queryKey: ['/api/warbands'],
  });
  
  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing 
      ? { 
          name: battle.name,
          scenario: battle.scenario,
          date: new Date(battle.date),
          mapType: battle.mapType || "",
          winnerId: battle.winnerId,
          loserId: battle.loserId,
          winnerScore: battle.winnerScore,
          loserScore: battle.loserScore,
          notes: battle.notes || ""
        } 
      : {
          name: "",
          scenario: "",
          date: new Date(),
          mapType: "",
          winnerId: 0,
          loserId: 0,
          winnerScore: 0,
          loserScore: 0,
          notes: ""
        }
  });

  // Create mutation for adding/updating battle
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (isEditing) {
        return apiRequest('PATCH', `/api/battles/${battle.id}`, values);
      } else {
        return apiRequest('POST', '/api/battles', values);
      }
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      // Update local storage
      const existingBattles = JSON.parse(localStorage.getItem('battles') || '[]');
      
      if (isEditing) {
        const updatedBattles = existingBattles.map((b: any) => 
          b.id === battle.id ? data : b
        );
        setLocalStorage('battles', updatedBattles);
      } else {
        setLocalStorage('battles', [...existingBattles, data]);
      }
      
      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ['/api/battles'] });
      
      // Update fighters stats if this is a new battle
      if (!isEditing) {
        // These queries should be invalidated to reflect battle counts
        queryClient.invalidateQueries({ queryKey: ['/api/fighters'] });
        queryClient.invalidateQueries({ queryKey: ['/api/warbands'] });
      }
      
      toast({
        title: isEditing ? "Battle Updated" : "Battle Logged",
        description: isEditing 
          ? `${data.name} has been updated successfully.`
          : `${data.name} has been added to your battle log.`,
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'log'} battle: ${error}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate that winner and loser aren't the same
    if (values.winnerId === values.loserId) {
      toast({
        title: "Invalid Selection",
        description: "Winner and loser cannot be the same warband.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    mutation.mutate(values);
  }

  const scenarios = [
    "Blood & Glory", "Ambush", "Take and Hold", "Battle for Treasure", 
    "Scavenge the Battlefield", "Ritual of the Damned", "Conquest"
  ];
  
  const mapTypes = [
    "Urban Ruins", "Forest", "Cave System", "Mountain Pass", 
    "Abandoned Temple", "Volcanic Plains", "Swampland"
  ];

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Battle" : "Log New Battle"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update your battle details below."
            : "Record the details of your battle for your chronicles."}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Battle Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. The Siege of Shadespire" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scenario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scenario</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a scenario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {scenarios.map((scenario) => (
                        <SelectItem key={scenario} value={scenario}>
                          {scenario}
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="winnerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Victorious Warband</FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : ""}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={isLoadingWarbands}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select winner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingWarbands ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : (
                        warbands?.map((warband: any) => (
                          <SelectItem 
                            key={warband.id} 
                            value={warband.id.toString()}
                            disabled={form.getValues("loserId") === warband.id}
                          >
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
            
            <FormField
              control={form.control}
              name="loserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Defeated Warband</FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : ""}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={isLoadingWarbands}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loser" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingWarbands ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : (
                        warbands?.map((warband: any) => (
                          <SelectItem 
                            key={warband.id} 
                            value={warband.id.toString()}
                            disabled={form.getValues("winnerId") === warband.id}
                          >
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="winnerScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Winner Score</FormLabel>
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
              name="loserScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loser Score</FormLabel>
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
              name="mapType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Battlefield</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select battlefield" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mapTypes.map((mapType) => (
                        <SelectItem key={mapType} value={mapType}>
                          {mapType}
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
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe how the battle went..."
                    className="resize-none min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Record key moments, heroic deeds, or tactical insights
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
              {isSubmitting ? "Saving..." : isEditing ? "Update Battle" : "Log Battle"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
