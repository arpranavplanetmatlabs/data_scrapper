import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Background ambient light effects */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen p-8 relative z-10">
        <div className="max-w-6xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
