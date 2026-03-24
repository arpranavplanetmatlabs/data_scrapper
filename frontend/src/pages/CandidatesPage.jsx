import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCandidates, acceptCandidate, rejectCandidate } from '../services/api';

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState('');

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
        await acceptCandidate(id);
      } else {
        await rejectCandidate(id);
      }
      fetchCands();
    } catch (err) {
      console.error(err);
    }
  };

  const getScoreColor = (score) => {
    if (score > 0.8) return 'text-success bg-success/5 border-success/20';
    if (score > 0.5) return 'text-warning bg-warning/5 border-warning/20';
    return 'text-danger bg-danger/5 border-danger/20';
  };

  return (
    <div className="animate-fade-in flex flex-col space-y-12 pb-24">
      <header className="flex justify-between items-end border-b-2 border-black pb-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-black">Review <span className="text-borderDark/40 font-black">Candidates</span></h1>
          <p className="text-xl text-textMuted font-medium flex items-center space-x-3">
            <span>{jobId ? `ISOLATED_POOL: JOB_${jobId}` : 'CANDIDATE_POOL: PENDING_VERIFICATION'}</span>
            {candidates.length > 0 && <span className="bg-black text-white px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest leading-none translate-y-[-2px]">{candidates.length} Entities</span>}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-panel border-2 border-black rounded-xl p-1 shadow-enterprise transition-all hover:translate-y-[-2px]">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 pl-4 py-2">Job_ID</label>
          <input
            type="number"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-24 text-center py-2 bg-white border-2 border-borderDark rounded-lg text-xs font-black outline-none focus:border-black transition-all"
            placeholder="ALL"
            min="1"
          />
          <button onClick={fetchCands} className="group p-2.5 rounded-lg bg-white border-2 border-borderDark text-black hover:border-black transition-all active:scale-95 shadow-sm">
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </header>

      <div className="table-container shadow-enterprise-lg border-2 border-black">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-32 space-y-6">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-black tracking-[.4em] uppercase">Querying Matrix...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-32 text-center space-y-6 opacity-30 select-none">
            <div className="w-24 h-24 border-8 border-black rounded-full opacity-10 flex items-center justify-center font-black text-4xl">?</div>
            <p className="text-3xl font-black text-black tracking-tighter">Null_Discovery_Signal</p>
            <p className="text-sm max-w-sm leading-relaxed text-textMuted uppercase tracking-widest font-black">Update Task ID or Await Protocol Termination</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="table-header border-r border-borderDark/50">Nomenclature</th>
                  <th className="table-header border-r border-borderDark/50">Origin Source</th>
                  <th className="table-header w-32 text-center border-r border-borderDark/50">Discovery_Clarity</th>
                  <th className="table-header w-32 border-r border-borderDark/50">Node_Status</th>
                  <th className="table-header w-48 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderDark/50">
                {candidates.map(cand => (
                  <tr key={cand.id} className="table-row group">
                    <td className="table-cell border-r border-borderDark/20 py-8">
                      <div className="flex flex-col space-y-2">
                        <span className="font-black text-black text-base max-w-[280px] truncate" title={cand.product_name}>
                          {cand.product_name || "UNLABELED_ENTITY"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black text-textMuted uppercase tracking-widest">{cand.company}</span>
                          <div className="w-1 h-1 bg-borderDark rounded-full" />
                          <span className="text-[10px] font-black text-black uppercase tracking-widest">{cand.material_category}</span>
                        </div>
                      </div>
                    </td>

                    <td className="table-cell max-w-[300px] border-r border-borderDark/20">
                      <a
                        href={cand.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate block text-black font-black font-mono text-[10px] hover:underline opacity-40 hover:opacity-100 transition-opacity"
                        title={cand.source_url}
                      >
                        {cand.source_url}
                      </a>
                    </td>

                    <td className="table-cell text-center border-r border-borderDark/20">
                      <span className={`px-3 py-1 font-black rounded-md border-2 shadow-sm text-xs tracking-tighter transition-all group-hover:scale-110 inline-block ${getScoreColor(cand.confidence_score)}`}>
                        {(cand.confidence_score * 100).toFixed(0)}%
                      </span>
                    </td>

                    <td className="table-cell border-r border-borderDark/20">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full shadow-sm animate-pulse ${cand.status === 'accepted' || cand.status === 'downloaded' ? 'bg-success shadow-success/40' : cand.status === 'rejected' ? 'bg-danger shadow-danger/40' : 'bg-black opacity-20'}`} />
                        <span className="text-[10px] uppercase font-black tracking-widest text-textMuted">
                          {cand.status}
                        </span>
                      </div>
                    </td>

                    <td className="table-cell text-right group-hover:bg-panel transition-all p-6">
                      <div className="flex items-center justify-end space-x-3">
                        <a href={cand.pdf_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl border-2 border-black/10 text-black hover:bg-black hover:text-white transition-all shadow-sm active:scale-90" title="Preview Extracted File">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </a>

                        {cand.status === 'discovered' && (
                          <>
                            <button onClick={() => handleAction(cand.id, 'accept')} className="p-2.5 rounded-xl border-2 border-black bg-black text-white hover:bg-white hover:text-black hover:border-black transition-all shadow-lg active:scale-90" title="Commit Extraction">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => handleAction(cand.id, 'reject')} className="p-2.5 rounded-xl border-2 border-danger text-danger hover:bg-danger hover:text-white transition-all shadow-sm active:scale-90" title="Reject Extraction">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        )}
                      </div>
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
