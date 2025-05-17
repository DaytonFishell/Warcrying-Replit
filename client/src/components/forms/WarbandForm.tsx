import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertWarbandSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { setLocalStorage } from "@/lib/storage";

// Extend the insertWarbandSchema with validation rules
const formSchema = insertWarbandSchema.extend({
  name: z.string().min(2, {
    message: "Warband name must be at least 2 characters.",
  }),
  faction: z.string().min(2, {
    message: "Faction name must be at least 2 characters.",
  })
});

interface WarbandFormProps {
  warband?: any;
  onSuccess?: () => void;
}

export default function WarbandForm({ warband, onSuccess }: WarbandFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const isEditing = !!warband;
  
  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing 
      ? { 
          name: warband.name,
          faction: warband.faction,
          pointsLimit: warband.pointsLimit,
          currentPoints: warband.currentPoints,
          description: warband.description || ""
        } 
      : {
          name: "",
          faction: "",
          pointsLimit: 1000,
          currentPoints: 0,
          description: ""
        }
  });

  // Create mutation for adding/updating warband
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (isEditing) {
        return apiRequest('PATCH', `/api/warbands/${warband.id}`, values);
      } else {
        return apiRequest('POST', '/api/warbands', values);
      }
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      // Update local storage
      const existingWarbands = JSON.parse(localStorage.getItem('warbands') || '[]');
      
      if (isEditing) {
        const updatedWarbands = existingWarbands.map((w: any) => 
          w.id === warband.id ? data : w
        );
        setLocalStorage('warbands', updatedWarbands);
      } else {
        setLocalStorage('warbands', [...existingWarbands, data]);
      }
      
      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ['/api/warbands'] });
      
      toast({
        title: isEditing ? "Warband Updated" : "Warband Created",
        description: isEditing 
          ? `${data.name} has been updated successfully.`
          : `${data.name} has been added to your warbands.`,
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} warband: ${error}`,
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

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Warband" : "Create New Warband"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update your warband details below."
            : "Fill in the details to create a new warband."}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warband Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Iron Serpents" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
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
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pointsLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points Limit</FormLabel>
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
              name="currentPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Points</FormLabel>
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
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add some notes about your warband..."
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
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
              {isSubmitting ? "Saving..." : isEditing ? "Update Warband" : "Create Warband"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
