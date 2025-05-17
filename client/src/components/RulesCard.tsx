import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RulesCardProps {
  title: string;
  steps: string[];
}

export default function RulesCard({ title, steps }: RulesCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="card">
      <div className="p-4">
        <h3 className="font-cinzel font-bold text-lg text-primary mb-2">{title}</h3>
        <ol className="list-decimal pl-5 space-y-2">
          {steps.map((step, index) => (
            <li key={index} className="text-foreground/90">{step}</li>
          ))}
        </ol>
        
        <CollapsibleTrigger asChild>
          <Button className="mt-4 w-full bg-background hover:bg-primary/20">
            {isOpen ? "Collapse" : "Expand"}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4 space-y-4">
          {title === "Combat Sequence" && (
            <>
              <h4 className="font-semibold text-primary">Advanced Combat Rules</h4>
              <p className="text-sm text-foreground/80">
                When attacking, fighters can choose to use special abilities by spending action dice.
                Double, Triple, and Quad abilities require the corresponding number of matching dice.
              </p>
              <p className="text-sm text-foreground/80">
                Critical hits ignore all modifiers and always hit regardless of the target's Toughness.
                They also deal critical damage instead of normal damage.
              </p>
            </>
          )}
          
          {title === "Movement Rules" && (
            <>
              <h4 className="font-semibold text-primary">Advanced Movement Rules</h4>
              <p className="text-sm text-foreground/80">
                When disengaging from combat, a fighter must spend half their movement.
                Jumping between platforms requires a successful initiative test if the gap is more than 2".
              </p>
              <p className="text-sm text-foreground/80">
                Climbing costs half a fighter's movement for each vertical inch climbed.
                Falling causes impact damage equal to half the distance fallen in inches.
              </p>
            </>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
