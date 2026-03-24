import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDatasheets, getJobStatus } from '../services/api';

const FetchPanel = () => {
  const [company, setCompany] = useState('DuPont');
  const [category, setCategory] = useState('Nylon');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const companies = ['DuPont', 'Covestro', 'Arkema', 'BASF', 'Lanxess', 'Sabic', 'Evonik'];
  const categories = ['Nylon', 'Polycarbonate', 'TPU', 'Acetal', 'PET', 'PBT', 'ABS'];

  const handleFetch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchDatasheets(company, category);
      setJobId(res.job_id);
    } catch (err) {
      console.error(err);
      alert('Failed to start job');
    }
  };

  useEffect(() => {
    let interval;
    if (jobId) {
      interval = setInterval(async () => {
        try {
          const res = await getJobStatus(jobId);
          setStatus(res);
          if (res.status !== 'running') {
            clearInterval(interval);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="max-w-6xl mx-auto pt-6 flex flex-col h-full">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Initialize Data Retrieval</h1>
        <p className="text-textMuted text-lg">Select manufacturer and material category to search for technical specifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1">
        {/* LEFT WINDOW: Live Crawler Feed */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-[520px]">
           <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
             <span className="text-accent">⚡</span> <span>Live Crawler Feed</span>
           </h2>
           <div className="flex-1 bg-background/80 rounded-lg p-4 font-mono text-[11px] text-textMuted overflow-y-auto border border-borderDark/30 scrollbar-thin shadow-neumorph-inset relative">
             {status && status.logs && status.logs.length > 0 ? status.logs.map((log, i) => (
                <div key={i} className="mb-3 border-b border-borderDark/10 pb-2">
                  <span className="text-accent/80 font-semibold tracking-wider">[{new Date(log.timestamp).toLocaleTimeString()}]</span> 
                  <span className="text-textMain ml-2 font-semibold">{log.event.toUpperCase()}</span>
                  {log.url && <div className="truncate text-xs text-textMuted mt-1 break-all whitespace-pre-wrap">↳ {log.url}</div>}
                  {log.error && <div className="text-danger font-semibold mt-1">✗ {log.error}</div>}
                </div>
             )) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 space-y-4">
                  <div className={`text-5xl text-accent ${jobId && status?.status === 'running' ? 'animate-pulse' : ''}`}>📡</div>
                  <p className="text-sm uppercase tracking-widest font-sans font-semibold">
                    {jobId && status?.status === 'running' ? 'Initializing Workers...' : 'Awaiting Fetch Protocol'}
                  </p>
                </div>
             )}
           </div>
        </div>

        {/* RIGHT WINDOW: Control Panel */}
        <div className="lg:col-span-3 glass-panel p-10 relative overflow-hidden h-fit">
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[80px]" />
          
          <form onSubmit={handleFetch} className="relative z-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold tracking-wide text-textMuted uppercase">Manufacturer</label>
                <div className="relative">
                  <select 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)}
                    className="neumorph-input w-full appearance-none cursor-pointer text-lg font-medium bg-background/50"
                    disabled={jobId && status?.status === 'running'}
                  >
                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-accent">▼</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold tracking-wide text-textMuted uppercase">Material Category</label>
                <div className="relative">
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="neumorph-input w-full appearance-none cursor-pointer text-lg font-medium bg-background/50"
                    disabled={jobId && status?.status === 'running'}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-accent">▼</div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="neumorph-btn-accent w-full py-4 text-lg tracking-wider flex items-center justify-center space-x-3"
              disabled={jobId && status?.status === 'running'}
            >
              <span>{jobId && status?.status === 'running' ? 'Scanning Sources...' : 'Initiate Fetch Protocol'}</span>
              {jobId && status?.status === 'running' && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          </form>

          {status && (
            <div className="mt-8 pt-6 border-t border-borderDark/30">
              <div className={`p-5 rounded-xl flex items-center justify-between ${status.status === 'running' ? 'bg-panel shadow-neumorph-inset' : 'glass-panel border-accent/30'}`}>
                 <div className="flex items-center space-x-4">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status.status === 'running' ? 'bg-background' : 'bg-accent/20 text-accent text-xl'}`}>
                     {status.status === 'running' ? '📡' : '✅'}
                   </div>
                   <div>
                     <h3 className="text-lg font-medium">{status.status === 'running' ? 'Job in Progress' : 'Job Completed'}</h3>
                     <p className="text-textMuted text-sm">Found: {status.total_found} candidates</p>
                   </div>
                 </div>
                 
                 {status.status !== 'running' && (
                   <button 
                     onClick={() => navigate(`/candidates?job_id=${jobId}`)}
                     className="neumorph-btn px-6 py-2 border border-accent/20 text-accent hover:text-textMain hover:bg-accent hover:border-accent font-semibold tracking-wide shadow-neumorph"
                   >
                     Review Matches →
                   </button>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FetchPanel;
