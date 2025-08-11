import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword, Users, Trophy, Plus, LogOut } from "lucide-react";
import { Link } from "wouter";
import { User } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return first + last || '?';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
            {getInitials((user as any)?.firstName, (user as any)?.lastName)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back{(user as any)?.firstName ? `, ${(user as any).firstName}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              Ready to lead your warband to victory?
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/warbands">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Warbands
              </CardTitle>
              <CardDescription>
                Create and customize your fighting forces
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/active-game">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sword className="h-5 w-5" />
                Start Battle
              </CardTitle>
              <CardDescription>
                Begin tracking an active game session
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/battles">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Battle History
              </CardTitle>
              <CardDescription>
                Review past victories and defeats
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Activity or Getting Started */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              New to the Warcry Companion? Follow these steps to begin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Create Your First Warband</p>
                <p className="text-sm text-muted-foreground">
                  Set up your faction and add fighters with their statistics
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Start Your First Battle</p>
                <p className="text-sm text-muted-foreground">
                  Use the Active Game tracker to monitor fighter health and abilities
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Review Battle Results</p>
                <p className="text-sm text-muted-foreground">
                  Track your warband's performance and improve your strategy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your warbands and battles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/warbands">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create New Warband
              </Button>
            </Link>
            <Link href="/temp-warband">
              <Button variant="outline" className="w-full justify-start">
                <Sword className="h-4 w-4 mr-2" />
                Quick Battle Setup
              </Button>
            </Link>
            <Link href="/fighters">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Fighters
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}