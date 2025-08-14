import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Sword, Users, Trophy, ArrowRight, Image } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Warcry Companion
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Your ultimate tabletop companion for Warcry games. Track battles, manage warbands, 
            and enhance your gameplay experience with real-time battle management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/public/warbands">
              <Button 
                size="lg" 
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3 text-lg"
              >
                <Image className="mr-2 h-5 w-5" />
                Browse Public Warbands
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Sword className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Battle Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Real-time fighter health, abilities, and status effect management during active battles.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Warband Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Create and manage your warbands with detailed fighter statistics and customization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Trophy className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Battle History</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Track your victories, defeats, and fighter performance across multiple battles.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Image className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Community Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Discover and copy warbands shared by other players, or share your own creations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Community Showcase */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Community Warbands</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Browse warbands shared by the community. As a guest, you can copy any warband as a template 
              for this session. Sign in to save permanently and like your favorites.
            </p>
          </div>
          <div className="text-center">
            <Link href="/public/warbands">
              <Button 
                size="lg" 
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3 text-lg"
              >
                <Image className="mr-2 h-5 w-5" />
                Explore Public Gallery
              </Button>
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-slate-800 border-slate-700 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Ready to Command Your Warband?</CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Join thousands of players enhancing their Warcry experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                onClick={() => window.location.href = '/api/login'}
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}