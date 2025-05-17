import { useLocation } from "wouter";

export default function HeroBanner() {
  const [location] = useLocation();
  
  // Only show on home page
  if (location !== "/") {
    return null;
  }
  
  return (
    <div className="relative h-48 md:h-64 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
      <img 
        src="https://pixabay.com/get/g07f3d978dd97bc4b53dc729eb8b05e60c59a3ec2c0a06fa3db174505565421a04c05447233404f7708c1de4b7d6afe5822ef72f330b0cb5b7ffbca086bb2df8d_1280.jpg" 
        alt="Fantasy wargaming battle scene" 
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <h2 className="font-cinzel text-3xl md:text-4xl text-white font-bold text-center drop-shadow-lg">
          Your Warcry Battle Companion
        </h2>
      </div>
    </div>
  );
}
