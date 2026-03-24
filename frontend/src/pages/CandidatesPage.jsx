import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCandidates, acceptCandidate, rejectCandidate } from '../services/api';

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState(''); // Default empty to show all candidates
  
  // Custom hook for URL params
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const paramJobId = searchParams.get('job_id');

  useEffect(() => {
    if (paramJobId) {
      setJobId(parseInt(paramJobId, 10));
    }
  }, [paramJobId]);

  const fetchCands = async () => {
    setLoading(true);
    try {
      const data = await getCandidates(jobId);
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCands();
  }, [jobId]);

  const handleAction = async (id, action) => {
    try {
      if (action === 'accept') {
        const res = await acceptCandidate(id);
        alert(res.message);
      } else {
        await rejectCandidate(id);
      }
      fetchCands(); // Refresh list after action
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action}`);
    }
  };

  const getScoreColor = (score) => {
    if (score > 0.8) return 'text-success bg-success/10 border-success/30';
    if (score > 0.5) return 'text-warning bg-warning/10 border-warning/30';
    return 'text-danger bg-danger/10 border-danger/30';
  };

  return (
    <div className="py-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Candidates</h1>
          <p className="text-textMuted mt-1">
            {jobId ? `Found documents awaiting your approval for Job #${jobId}` : 'All recent candidate documents awaiting your approval'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="text-sm text-textMuted">Job ID Filter:</label>
          <input 
            type="number" 
            value={jobId} 
            onChange={(e) => setJobId(e.target.value)}
            className="neumorph-input w-24 text-center py-2 bg-background/50"
            placeholder="All"
            min="1"
          />
          <button onClick={fetchCands} className="neumorph-btn px-4 py-2 hover:text-accent">
             ↻
          </button>
        </div>
      </div>

      <div className="glass-panel flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <svg className="animate-spin h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-textMuted text-lg tracking-wide uppercase">Scanning Database...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-textMuted p-8 text-center space-y-4">
             <div className="w-24 h-24 rounded-full bg-panel shadow-neumorph-inset flex items-center justify-center opacity-50 mb-4">
               📄
             </div>
             <p className="text-xl">No candidates found for this job yet.</p>
             <p className="text-sm opacity-60 max-w-md">Verify the job ID or wait for the worker to finish retrieving documents from search results.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto rounded-xl scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-20 bg-panel shadow-sm">
                <tr>
                  <th className="table-header w-1/4">Product Name</th>
                  <th className="table-header">Source URL</th>
                  <th className="table-header w-32 text-center">Score</th>
                  <th className="table-header w-24">Status</th>
                  <th className="table-header w-48 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderDark/30">
                {candidates.map(cand => (
                  <tr key={cand.id} className="table-row group">
                    <td className="table-cell font-medium text-textMain max-w-[200px] truncate" title={cand.product_name || "Unknown Document"}>
                      {cand.product_name || <span className="text-textMuted italic">Unknown PDF Document</span>}
                      <div className="text-xs text-textMuted mt-1">{cand.company} • {cand.material_category}</div>
                    </td>
                    
                    <td className="table-cell max-w-[300px]">
                      <a 
                        href={cand.source_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="truncate block text-accent hover:underline text-xs"
                        title={cand.source_url}
                      >
                        {cand.source_url}
                      </a>
                    </td>
                    
                    <td className="table-cell text-center">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getScoreColor(cand.confidence_score)}`}>
                        {(cand.confidence_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    
                    <td className="table-cell">
                      <span className={`text-xs px-2 py-1 rounded-md bg-panel shadow-neumorph-inset uppercase tracking-wider font-semibold 
                        ${cand.status === 'accepted' || cand.status === 'downloaded' ? 'text-success' : cand.status === 'rejected' ? 'text-danger' : 'text-textMuted'}`}>
                        {cand.status}
                      </span>
                    </td>
                    
                    <td className="table-cell text-right space-x-2">
                      <a href={cand.pdf_url} target="_blank" rel="noreferrer" className="inline-block p-2 rounded-lg text-textMuted hover:text-textMain hover:bg-panel shadow-neumorph-inset border border-borderDark/20 transition" title="Preview PDF">
                        👁️
                      </a>
                      
                      {cand.status === 'discovered' && (
                        <>
                          <button onClick={() => handleAction(cand.id, 'accept')} className="p-2 rounded-lg text-success hover:bg-success/10 border border-transparent hover:border-success/30 transition shadow-neumorph" title="Accept & Download">
                            ✓
                          </button>
                          <button onClick={() => handleAction(cand.id, 'reject')} className="p-2 rounded-lg text-danger hover:bg-danger/10 border border-transparent hover:border-danger/30 transition shadow-neumorph" title="Reject">
                            ✕
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatesPage;
