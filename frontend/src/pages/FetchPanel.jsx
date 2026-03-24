import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDatasheets, getJobStatus, getStats } from '../services/api';

const FetchPanel = () => {
  const [companySelect, setCompanySelect] = useState('DuPont');
  const [companyOther, setCompanyOther] = useState('');

  const [categorySelect, setCategorySelect] = useState('Nylon');
  const [categoryOther, setCategoryOther] = useState('');

  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState({ google: 0, ddg: 0, serpapi: 0 });
  const navigate = useNavigate();

  const companies = ['DuPont', 'Covestro', 'Arkema', 'BASF', 'Lanxess', 'Sabic', 'Evonik', 'Other'];
  const categories = [
    'Nylon', 'Polycarbonate', 'TPU', 'Acetal', 'PET', 'PBT', 'ABS', 
    'POM', 'Kevlar', 'Nomex', 'Electronic Materials', 'Water Solutions', 
    'Polyurethanes', 'MDI TDI Systems', 'Coating Resins', 'Specialty Films', 
    'High Performance Polymers', 'PEKK', 'PVDF', 'Acrylics', 'PMMA', 'Other'
  ];

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  const handleFetch = async (e) => {
    e.preventDefault();
    const finalCompany = companySelect === 'Other' ? companyOther : companySelect;
    const finalCategory = categorySelect === 'Other' ? categoryOther : categorySelect;

    if (!finalCompany.trim() || !finalCategory.trim()) {
      alert("Please provide valid inputs");
      return;
    }

    try {
      const res = await fetchDatasheets(finalCompany, finalCategory);
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
            getStats().then(setStats).catch(console.error);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    if (status?.logs?.length) {
      const anchor = document.getElementById('scroll-anchor');
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status?.logs?.length]);

  return (
    <div className="animate-fade-in flex flex-col space-y-16 pb-24">
      {/* Metrics Band: Pure Minimalism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
        <div className="px-6 py-6 border border-borderDark rounded-2xl bg-panel group hover:bg-white transition-all duration-500">
          <p className="text-[10px] font-black tracking-widest text-textMuted uppercase mb-2 group-hover:text-black">SerpAPI Node</p>
          <h3 className="text-3xl font-black text-black tracking-tighter">{stats.serpapi}</h3>
        </div>
        <div className="px-6 py-6 border border-borderDark rounded-2xl bg-panel group hover:bg-white transition-all duration-500">
          <p className="text-[10px] font-black tracking-widest text-textMuted uppercase mb-2 group-hover:text-black">Google Index</p>
          <h3 className="text-3xl font-black text-black tracking-tighter">{stats.google}</h3>
        </div>
        <div className="px-6 py-6 border border-borderDark rounded-2xl bg-panel group hover:bg-white transition-all duration-500">
          <p className="text-[10px] font-black tracking-widest text-textMuted uppercase mb-2 group-hover:text-black">DDG Crawl</p>
          <h3 className="text-3xl font-black text-black tracking-tighter">{stats.ddg}</h3>
        </div>
        <div className="px-6 py-6 border border-borderDark rounded-2xl bg-black flex flex-col justify-end group transition-all duration-500 hover:scale-[1.02] shadow-xl">
          <p className="text-[10px] font-black tracking-widest text-white uppercase mb-2 opacity-60">System Status</p>
          <h3 className="text-xl font-black text-white tracking-tighter">Nominal</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
        {/* Control Interface */}
        <div className="lg:col-span-3 space-y-12">
          <header className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter text-black leading-tight">Material TDS <span className="text-borderDark/40">Scraper</span></h1>
            <p className="text-xl text-textMuted font-medium max-w-xl leading-relaxed">Select Company/Manufacturer and Material Category to start scrapping. Use Review Registry to verify fetched files and download/discard/archive</p>
          </header>

          <form onSubmit={handleFetch} className="space-y-10 group/form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black tracking-[0.2em] text-black uppercase flex justify-between px-1">Target Manufacturer</label>
                <div className="relative group">
                  <select
                    value={companySelect}
                    onChange={(e) => {
                      setCompanySelect(e.target.value);
                      if (e.target.value !== 'Other') setCompanyOther('');
                    }}
                    className="enterprise-input w-full appearance-none appearance-none cursor-pointer border-2 group-hover:border-black transition-all"
                    disabled={jobId && status?.status === 'running'}
                  >
                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black opacity-30 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {companySelect === 'Other' && (
                  <input
                    type="text"
                    value={companyOther}
                    onChange={e => setCompanyOther(e.target.value)}
                    placeholder="ENTER CUSTOM MANUFACTURER..."
                    className="enterprise-input w-full mt-2 uppercase tracking-widest text-xs border-2 border-black animate-fade-in"
                    autoFocus
                  />
                )}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black tracking-[0.2em] text-black uppercase flex justify-between px-1">Material Category</label>
                <div className="relative group">
                  <select
                    value={categorySelect}
                    onChange={(e) => {
                      setCategorySelect(e.target.value);
                      if (e.target.value !== 'Other') setCategoryOther('');
                    }}
                    className="enterprise-input w-full appearance-none cursor-pointer border-2 group-hover:border-black transition-all"
                    disabled={jobId && status?.status === 'running'}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black opacity-30 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {categorySelect === 'Other' && (
                  <input
                    type="text"
                    value={categoryOther}
                    onChange={e => setCategoryOther(e.target.value)}
                    placeholder="ENTER CUSTOM MATERIAL..."
                    className="enterprise-input w-full mt-2 uppercase tracking-widest text-xs border-2 border-black animate-fade-in"
                    autoFocus
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              className="enterprise-btn-primary w-full py-5 text-xs font-black tracking-[.3em] uppercase flex items-center justify-center space-x-4 border-2 border-black"
              disabled={jobId && status?.status === 'running'}
            >
              <span>{jobId && status?.status === 'running' ? 'PROTOCOL DEPLOYED' : 'INITIALIZE PROTOCOL'}</span>
              {jobId && status?.status === 'running' && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </button>
          </form>

          {status && (
            <div className="pt-12 border-t border-borderDark animate-fade-in overflow-hidden">
              <div className={`p-8 rounded-2xl border-2 flex items-center justify-between group transition-all duration-500 ${status.status === 'running' ? 'bg-panel border-borderDark' : 'bg-success/5 border-success/30'}`}>
                <div className="flex items-center space-x-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${status.status === 'running' ? 'bg-black text-white shadow-lg' : 'bg-success text-white'}`}>
                    {status.status === 'running' ? (
                      <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black tracking-tight">{status.status === 'running' ? 'Agent Node Busy' : 'Extraction Verified'}</h3>
                    <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest mt-1">Discovered: {status.total_found} • Confidence Maxed</p>
                  </div>
                </div>

                {status.status !== 'running' && (
                  <button
                    onClick={() => navigate(`/candidates?job_id=${jobId}`)}
                    className="enterprise-btn-primary text-[10px] py-3 tracking-widest font-black"
                  >
                    REVIEW OUTPUT →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Console / Crawler matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <span className="text-[10px] font-black tracking-widest text-textMuted uppercase flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span>Crawler Live Stream</span>
            </span>
            <span className="text-[9px] font-bold text-textMuted uppercase opacity-40">Matrix V1</span>
          </div>
          <div className="bg-panel border border-borderDark rounded-3xl p-8 h-[600px] flex flex-col shadow-inner relative overflow-hidden group hover:shadow-enterprise transition-all border-2">
            <div className="flex-1 overflow-y-auto font-mono text-[10px] text-textMuted leading-loose space-y-4 scrollbar-none pb-12">
              {status && status.logs && status.logs.length > 0 ? status.logs.map((log, i) => (
                <div key={i} className="animate-fade-in group/log border-l-2 border-borderDark/20 pl-4 py-1 hover:border-black transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded ${
                      log.event.includes('error') ? 'bg-danger text-white' : 
                      log.event.includes('search') ? 'bg-black text-white' : 'text-black/40'
                    }`}>
                      {log.event.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] font-bold opacity-30 group-hover/log:opacity-100 transition-all">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {log.query && (
                    <div className="text-black font-black text-[9px] tracking-tight py-1">
                      QUERY: <span className="opacity-60">{log.query}</span>
                    </div>
                  )}
                  {log.url && (
                    <div className="text-[9px] text-textMuted truncate opacity-60 group-hover/log:opacity-100 transition-all font-medium">
                      FETCH: {log.url}
                    </div>
                  )}
                  {log.error && (
                    <div className="text-danger font-bold mt-1 text-[8px] uppercase tracking-tighter">
                      SIGNAL_INTERRUPTED: {log.error}
                    </div>
                  )}
                </div>
              )) : (
                <div className="flex-1 h-full flex flex-col items-center justify-center opacity-10 space-y-12 select-none">
                  <div className="w-32 h-32 border-8 border-black rounded-full opacity-20 border-t-transparent animate-spin-slow" />
                  <p className="text-5xl font-black tracking-tighter text-black">AWAITING_INPUT</p>
                </div>
              )}
              {/* Invisible element to scroll to */}
              <div id="scroll-anchor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetchPanel;
