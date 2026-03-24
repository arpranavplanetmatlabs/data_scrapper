import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Fetch Protocol', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    ) },
    { path: '/candidates', label: 'Review Registry', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    ) },
    { path: '/materials', label: 'Archive Vault', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
    ) },
  ];

  return (
    <aside className="w-80 bg-panel border-r border-borderDark z-20 flex flex-col h-screen relative shadow-sm">
      <div className="p-10 pb-6 flex items-center space-x-4">
        {/* Elite Monolithic Logo */}
        <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer">
          <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45 transform" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-[.25em] text-black uppercase leading-none">Material</h1>
          <h2 className="text-[10px] font-bold tracking-[.15em] text-textMuted uppercase mt-1">Intelligence</h2>
        </div>
      </div>

      <nav className="flex-1 px-6 mt-12 space-y-2">
        <div className="px-4 mb-4 text-[9px] font-black tracking-[.3em] text-textMuted uppercase">System Modules</div>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/fetch');
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                isActive 
                ? 'bg-black text-white font-bold translate-x-1 shadow-enterprise' 
                : 'text-textMuted hover:text-black hover:bg-panelHover hover:translate-x-1 font-semibold'
              }`}
            >
              <div className={`mr-4 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'}`}>{link.icon}</div>
              <span className="tracking-widest text-[11px] uppercase">{link.label}</span>
              
              {isActive && (
                <div className="ml-auto w-1 h-1 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-10">
        <div className="bg-white border border-borderDark rounded-2xl p-6 flex flex-col space-y-4 shadow-enterprise hover:shadow-enterprise-lg transition-all cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-textMuted font-black uppercase tracking-widest leading-none">Network</span>
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-black tracking-tight leading-none">Elite Mode</span>
          </div>
          <p className="text-[10px] text-textMuted font-medium leading-relaxed uppercase tracking-wider">Node Alpha Operational • V 2.4.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
