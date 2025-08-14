import { Link, useLocation } from "wouter";

export default function NavigationTabs() {
  const [location] = useLocation();
  
  const tabs = [
    { path: "/", label: "Dashboard", icon: "home" },
    { path: "/warbands", label: "Warbands", icon: "users" },
    { path: "/fighters", label: "Fighters", icon: "fist-raised" },
    { path: "/battles", label: "Battles", icon: "flag" },
    { path: "/active-game", label: "Active Game", icon: "activity" },
    { path: "/public/warbands", label: "Gallery", icon: "gallery" },
    { path: "/rules", label: "Rules", icon: "book-open" }
  ];
  
  return (
    <div className="bg-card py-2 px-4 sticky top-0 z-30 shadow-md">
      <div className="container mx-auto">
        <nav className="flex overflow-x-auto space-x-6 no-scrollbar">
          {tabs.map(tab => (
            <Link 
              key={tab.path}
              href={tab.path}
              className={`py-2 px-1 font-medium text-lg whitespace-nowrap transition ${location === tab.path ? 'tab-active' : 'text-foreground hover:text-primary'}`}
            >
                <span>
                  {tab.icon === 'home' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  )}
                  {tab.icon === 'users' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  )}
                  {tab.icon === 'fist-raised' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                      <path d="M4 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      <path d="M3.34 17a10 10 0 019.11-4.95" />
                      <path d="M2 8.667l.29-1.73c.18-1.058 1.055-1.87 2.124-1.937" />
                      <path d="M12 6.5l1.5-1.5c.83-.83 2.17-.83 3 0 .83.83.83 2.17 0 3L15 9.5"/>
                      <path d="M13 18.5l.5.5c.83.83 2.17.83 3 0 .83-.83.83-2.17 0-3l-3-3" />
                      <path d="M16 22c1.7-1.3 3-3.3 3-5.5 0-3-2-5.5-5-5.5-1.97 0-3.86 1-4.93 2.5" />
                    </svg>
                  )}
                  {tab.icon === 'flag' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                  )}
                  {tab.icon === 'activity' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  )}
                  {tab.icon === 'gallery' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  )}
                  {tab.icon === 'book-open' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                    </svg>
                  )}
                </span>
                {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
