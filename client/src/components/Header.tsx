import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SunMoon, Settings, FileDown, FileUp, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getLocalStorage, setLocalStorage } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleExport = async () => {
    try {
      // Fetch all user data from the database
      const response = await fetch("/api/export", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Create filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `warcry-data-${date}.json`;
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast({
        title: "Export Successful",
        description: `Your Warcry data (${data.metadata.totalWarbands} warbands, ${data.metadata.totalFighters} fighters, ${data.metadata.totalBattles} battles) has been exported successfully.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.warbands) setLocalStorage("warbands", data.warbands);
        if (data.fighters) setLocalStorage("fighters", data.fighters);
        if (data.battles) setLocalStorage("battles", data.battles);
        if (data.battleFighterStats) setLocalStorage("battleFighterStats", data.battleFighterStats);
        
        toast({
          title: "Import Successful",
          description: "Your Warcry data has been imported successfully.",
        });
        
        // Reload the page to reflect the imported data
        window.location.reload();
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "There was an error importing your data. Make sure the file is a valid Warcry export.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    e.target.value = ""; // Reset for future imports
  };
  
  return (
    <header className="bg-card p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-primary text-2xl mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20.59c1.83 0 3.93-1.54 3.5-3-3 1.5-4-1-4-1h-2.5" />
              <path d="M21 4.01v1a10 10 0 01-4 7.9l-1 .9" />
              <path d="M21 4c-3.5-1-12-.7-12 4v1" />
              <path d="M3 4.26C3 4.09 3 4 3 4c-3.5 0-3 3.5-2 4.5C3 10 5 7.5 5 7.5l1-3.24z" />
              <path d="M10 18a2 2 0 01-1.7-1l-1.6-2.4A1 1 0 016 14v-.5h.5a2 2 0 011.5.5l.5.5M10 7.99L12 14l-1 .5" />
              <path d="M12 13a5.5 5.5 0 105.5 5.5M19 19a2 2 0 103.5 0A2 2 0 0019 19z" />
            </svg>
          </div>
          <h1 className="text-2xl font-cinzel font-bold">Warcry Companion</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="icon" onClick={toggleTheme} title="Toggle theme">
            <SunMoon className="h-4 w-4" />
          </Button>
          
          {isAuthenticated && (
            <>
              <Button onClick={handleExport} variant="secondary" size="sm" className="hidden sm:flex">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()} className="hidden sm:flex">
                <FileUp className="mr-2 h-4 w-4" />
                Import
              </Button>
              <input 
                id="import-file" 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleImport}
              />
              
            </>
          )}
          
          {isAuthenticated ? (
            <Button variant="ghost" onClick={() => window.location.href = '/api/logout'}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button onClick={() => window.location.href = '/api/login'}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
          
          {isAuthenticated && (
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Configure your Warcry Companion app preferences.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                  </div>
                  <Button variant="outline" onClick={toggleTheme}>
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-muted-foreground">Save your data as a JSON file</p>
                  </div>
                  <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Import Data</h4>
                    <p className="text-sm text-muted-foreground">Load data from a JSON file</p>
                  </div>
                  <Button variant="outline" onClick={() => document.getElementById('settings-import-file')?.click()}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                  <input 
                    id="settings-import-file" 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleImport}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}
