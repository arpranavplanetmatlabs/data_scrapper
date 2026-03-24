import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-white relative overflow-hidden font-sans text-black">
      {/* Pristine subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto h-screen p-16 relative z-10 selection:bg-black selection:text-white">
        <div className="max-w-7xl mx-auto min-h-full relative overflow-y-visible page-transition flex flex-col items-stretch space-y-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
