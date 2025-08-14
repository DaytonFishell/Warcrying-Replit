import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, Eye, Copy, Users, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Warband } from "@shared/schema";

interface PublicWarbandWithStats extends Warband {
  isLiked?: boolean;
}

export default function PublicWarbands() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);

  const { data: warbands = [], isLoading } = useQuery<PublicWarbandWithStats[]>({
    queryKey: ["/api/public/warbands"],
    retry: false,
  });

  const likeMutation = useMutation({
    mutationFn: async ({ warbandId, action }: { warbandId: number; action: 'like' | 'unlike' }) => {
      if (action === 'like') {
        return await apiRequest(`/api/warbands/${warbandId}/like`, "POST");
      } else {
        return await apiRequest(`/api/warbands/${warbandId}/like`, "DELETE");
      }
    },
    onSuccess: () => {
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
    mutationFn: async ({ warbandId, name }: { warbandId: number; name?: string }) => {
      return await apiRequest(`/api/public/warbands/${warbandId}/duplicate`, "POST", { name });
    },
    onSuccess: (newWarband) => {
      toast({
        title: "Success",
        description: isAuthenticated 
          ? "Warband copied to your collection!" 
          : "Warband template created for this session!",
      });
      setDuplicatingId(null);
      setDuplicateName("");
      // If authenticated, refresh their warbands
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/warbands"] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to duplicate warband. Please try again.",
        variant: "destructive",
      });
      setDuplicatingId(null);
    },
  });

  const handleLike = (warband: PublicWarbandWithStats) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like warbands.",
        variant: "destructive",
      });
      return;
    }

    likeMutation.mutate({
      warbandId: warband.id,
      action: warband.isLiked ? 'unlike' : 'like',
    });
  };

  const handleDuplicate = (warbandId: number) => {
    const name = duplicateName || undefined;
    duplicateMutation.mutate({ warbandId, name });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading public warbands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Public Warband Gallery</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Discover and copy warbands shared by the community
        </p>
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              <strong>Guest Mode:</strong> You can browse and copy warbands as templates for this session. 
              <Link href="/api/login" className="underline ml-1">Log in</Link> to save warbands permanently and like your favorites.
            </p>
          </div>
        )}
      </div>

      {warbands.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Public Warbands Yet</h2>
          <p className="text-muted-foreground">
            Be the first to share a warband with the community!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warbands.map((warband) => (
            <Card key={warband.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{warband.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{warband.faction}</Badge>
                      <span className="text-sm">{warband.currentPoints}/{warband.pointsLimit} pts</span>
                    </CardDescription>
                  </div>
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(warband)}
                      disabled={likeMutation.isPending}
                      className="p-1"
                    >
                      <Heart 
                        className={`h-5 w-5 ${warband.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                      />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {warband.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {warband.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{warband.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{warband.views || 0}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {duplicatingId === warband.id ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Custom name (optional)"
                        value={duplicateName}
                        onChange={(e) => setDuplicateName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleDuplicate(warband.id);
                          } else if (e.key === 'Escape') {
                            setDuplicatingId(null);
                            setDuplicateName("");
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleDuplicate(warband.id)}
                          disabled={duplicateMutation.isPending}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDuplicatingId(null);
                            setDuplicateName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setDuplicatingId(warband.id)}
                      disabled={duplicateMutation.isPending}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {isAuthenticated ? "Copy to My Collection" : "Use as Template"}
                    </Button>
                  )}
                  
                  <Link href={`/public/warbands/${warband.id}`}>
                    <Button variant="outline" className="w-full">
                      <Sword className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}