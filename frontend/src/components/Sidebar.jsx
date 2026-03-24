import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Fetch Data', icon: '🔍' },
    { path: '/candidates', label: 'Candidates', icon: '📝' },
    { path: '/materials', label: 'Materials Vault', icon: '🏦' },
  ];

  return (
    <aside className="w-72 bg-panel shadow-neumorph z-10 flex flex-col h-screen">
      <div className="p-8 pb-4 flex items-center space-x-3">
        {/* SVG Illustration Logo Placeholder */}
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="10" fill="#1A2A33" className="shadow-[inset_2px_2px_4px_#2A3A43,_inset_-2px_-2px_4px_#0B0F14]" />
          <path d="M12 28L20 12L28 28H12Z" fill="#7ED957" />
          <path d="M16 28L20 20L24 28H16Z" fill="#1A2A33" />
        </svg>
        <div>
          <h1 className="text-xl font-bold leading-tight">Material</h1>
          <h1 className="text-xl font-bold leading-tight text-accent">Intelligence</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-8 space-y-3">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/fetch');
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                ? 'bg-accent/10 border border-accent/20 text-accent shadow-[inset_0_2px_10px_rgba(126,217,87,0.1)]' 
                : 'text-textMuted hover:text-textMain hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              <span className="mr-3 text-lg opacity-80">{link.icon}</span>
              <span className="font-medium tracking-wide">{link.label}</span>
              
              {isActive && (
                <div className="ml-auto w-1.5 h-6 bg-accent rounded-full shadow-[0_0_8px_rgba(126,217,87,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6">
        <div className="glass-panel p-4 flex flex-col items-center text-center space-y-2 relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-accent/20 rounded-full blur-xl" />
          
          <div className="w-10 h-10 rounded-full bg-panel shadow-neumorph flex items-center justify-center text-accent mb-1 border border-[rgba(255,255,255,0.05)]">
             ⚡
          </div>
          <p className="text-xs text-textMuted font-medium uppercase tracking-wider">System Status</p>
          <div className="flex items-center text-sm font-semibold text-textMain">
            <span className="relative flex h-2.5 w-2.5 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            Online & Ready
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
