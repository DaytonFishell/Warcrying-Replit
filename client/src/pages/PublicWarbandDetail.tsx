import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Heart, Eye, Copy, ArrowLeft, Sword, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Warband, Fighter } from "@shared/schema";

interface PublicWarbandWithFighters extends Warband {
  fighters?: Fighter[];
  isLiked?: boolean;
}

export default function PublicWarbandDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [duplicateName, setDuplicateName] = useState("");
  const [showDuplicateForm, setShowDuplicateForm] = useState(false);

  const { data: warband, isLoading, error } = useQuery<PublicWarbandWithFighters>({
    queryKey: [`/api/public/warbands/${id}`],
    retry: false,
    enabled: !!id,
  });

  const { data: fighters = [] } = useQuery<Fighter[]>({
    queryKey: [`/api/fighters?warbandId=${id}`],
    retry: false,
    enabled: !!id && !!warband,
  });

  const likeMutation = useMutation({
    mutationFn: async (action: 'like' | 'unlike') => {
      if (action === 'like') {
        return await apiRequest(`/api/warbands/${id}/like`, "POST");
      } else {
        return await apiRequest(`/api/warbands/${id}/like`, "DELETE");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/public/warbands/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/warbands"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (name?: string) => {
      return await apiRequest(`/api/public/warbands/${id}/duplicate`, "POST", { name });
    },
    onSuccess: (newWarband) => {
      toast({
        title: "Success",
        description: isAuthenticated 
          ? "Warband copied to your collection!" 
          : "Warband template created for this session!",
      });
      setShowDuplicateForm(false);
      setDuplicateName("");
      // If authenticated, refresh their warbands and navigate to it
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/warbands"] });
        setLocation(`/warbands/${(newWarband as any).id}`);
      } else {
        setLocation("/");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to duplicate warband. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like warbands.",
        variant: "destructive",
      });
      return;
    }

    if (!warband) return;

    likeMutation.mutate(warband.isLiked ? 'unlike' : 'like');
  };

  const handleDuplicate = () => {
    const name = duplicateName || undefined;
    duplicateMutation.mutate(name);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading warband details...</p>
        </div>
      </div>
    );
  }

  if (error || !warband) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Warband Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This warband might not be public or doesn't exist.
          </p>
          <Link href="/public/warbands">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/public/warbands">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Warband Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{warband.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-sm">{warband.faction}</Badge>
                  </CardDescription>
                </div>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={likeMutation.isPending}
                  >
                    <Heart 
                      className={`h-6 w-6 ${warband.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {warband.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{warband.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Points</h4>
                  <p className="text-2xl font-bold text-primary">
                    {warband.currentPoints}/{warband.pointsLimit}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Fighters</h4>
                  <p className="text-2xl font-bold text-primary">{fighters.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{warband.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{warband.views || 0}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {showDuplicateForm ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Custom name (optional)"
                      value={duplicateName}
                      onChange={(e) => setDuplicateName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDuplicate();
                        } else if (e.key === 'Escape') {
                          setShowDuplicateForm(false);
                          setDuplicateName("");
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleDuplicate}
                        disabled={duplicateMutation.isPending}
                        className="flex-1"
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDuplicateForm(false);
                          setDuplicateName("");
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => window.location.href = `/active-game?public=${warband.id}`}
                    >
                      <Sword className="h-4 w-4 mr-2" />
                      Play with this Warband
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setShowDuplicateForm(true)}
                      disabled={duplicateMutation.isPending}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {isAuthenticated ? "Copy to My Collection" : "Use as Template"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fighters List */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Fighters</h2>
            <p className="text-muted-foreground">
              {fighters.length} fighter{fighters.length !== 1 ? 's' : ''} in this warband
            </p>
          </div>

          {fighters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Sword className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Fighters</h3>
                <p className="text-muted-foreground">This warband doesn't have any fighters yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fighters.map((fighter) => (
                <Card key={fighter.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{fighter.name}</CardTitle>
                        <CardDescription>{fighter.type}</CardDescription>
                      </div>
                      <Badge variant="outline">{fighter.pointsCost} pts</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Move:</span>
                        <span>{fighter.move}"</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Toughness:</span>
                        <span>{fighter.toughness}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Wounds:</span>
                        <span>{fighter.wounds}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Strength:</span>
                        <span>{fighter.strength}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Attacks:</span>
                        <span>{fighter.attacks}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Damage:</span>
                        <span>{fighter.damage}/{fighter.criticalDamage}</span>
                      </div>
                    </div>

                    {fighter.abilities && Array.isArray(fighter.abilities) && fighter.abilities.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          Abilities
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {fighter.abilities.map((ability: unknown, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {String(ability)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}