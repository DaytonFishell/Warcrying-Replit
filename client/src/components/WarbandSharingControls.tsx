import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Share2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Warband } from "@shared/schema";

interface WarbandSharingControlsProps {
  warband: Warband;
}

export default function WarbandSharingControls({ warband }: WarbandSharingControlsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPublic, setIsPublic] = useState(warband.isPublic);

  const updateSharingMutation = useMutation({
    mutationFn: async (isPublicValue: boolean) => {
      return await apiRequest(`/api/warbands/${warband.id}`, "PATCH", { isPublic: isPublicValue });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warbands"] });
      queryClient.invalidateQueries({ queryKey: [`/api/warbands/${warband.id}`] });
      toast({
        title: isPublic ? "Warband Made Public" : "Warband Made Private",
        description: isPublic 
          ? "Your warband is now visible in the public gallery for others to discover and copy."
          : "Your warband is now private and only visible to you.",
      });
    },
    onError: (error) => {
      setIsPublic(!isPublic); // Revert the switch
      toast({
        title: "Error",
        description: "Failed to update sharing settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSharingToggle = (value: boolean) => {
    setIsPublic(value);
    updateSharingMutation.mutate(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Sharing Settings
        </CardTitle>
        <CardDescription>
          Control who can see and copy this warband
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="public-sharing" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public Warband
            </Label>
            <p className="text-sm text-muted-foreground">
              Allow others to discover and copy this warband
            </p>
          </div>
          <Switch
            id="public-sharing"
            checked={isPublic}
            onCheckedChange={handleSharingToggle}
            disabled={updateSharingMutation.isPending}
          />
        </div>

        {isPublic && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{warband.likes || 0} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{warband.views || 0} views</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
              {warband.isTemplate && (
                <Badge variant="outline" className="text-xs">
                  Template
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Your warband is visible in the public gallery. Others can copy it but cannot modify your original.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}