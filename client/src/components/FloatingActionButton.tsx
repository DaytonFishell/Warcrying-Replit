import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Users, User, Swords, ScrollText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import WarbandForm from "@/components/forms/WarbandForm";
import FighterForm from "@/components/forms/FighterForm";
import BattleForm from "@/components/forms/BattleForm";

export default function FloatingActionButton() {
  const [location, setLocation] = useLocation();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition glow-border"
              aria-label="Add new item"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setLocation("/temp-warband")}>
              <Users className="mr-2 h-4 w-4" />
              <span>Create Temp Warband</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation("/fighters")}>
              <User className="mr-2 h-4 w-4" />
              <span>New Fighter</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation("/battles")}>
              <Swords className="mr-2 h-4 w-4" />
              <span>Log Battle</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation("/rules")}>
              <ScrollText className="mr-2 h-4 w-4" />
              <span>View Rules</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Dialogs temporarily disabled for mobile compatibility */}
    </>
  );
}
