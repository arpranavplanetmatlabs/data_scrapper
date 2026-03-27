import { useState, useEffect } from 'react';
import { getMaterials, getDownloadUrl, bulkDownload } from '../services/api';

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  const fetchMats = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMats();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDownloading(true);
    try {
      await bulkDownload(selectedIds);
      alert(`Bulk Archive protocol initiated for ${selectedIds.length} entities.`);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBulkDownloading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col space-y-12 pb-32 relative">
      <header className="flex justify-between items-end border-b-2 border-black pb-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-black">Arch <span className="text-borderDark/40">ived</span></h1>
          <p className="text-xl text-textMuted font-medium flex items-center space-x-3">
            <span className="uppercase text-[10px] font-black tracking-widest bg-black text-white px-3 py-1 rounded-md shadow-lg translate-y-[-1px]">STORAGE</span>
            <span>Archived pdfs awaiting download</span>
          </p>
        </div>
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => setSelectedIds(selectedIds.length === materials.length ? [] : materials.map(m => m.id))}
            className="text-[10px] font-black uppercase tracking-widest text-black hover:underline px-4 py-2 border border-black/10 rounded-lg hover:bg-black/5 transition-all"
          >
            {selectedIds.length === materials.length ? 'Deselect_All' : 'Select_All_Vault'}
          </button>
          <div className="text-right">
            <span className="text-4xl font-black text-black tracking-tighter">{materials.length}</span>
            <span className="text-[10px] font-black text-textMuted uppercase tracking-widest block mt-1">Total_Stored</span>
          </div>
        </div>
      </header>

      {/* Bulk Action Bar - Sticky Premium UI */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center space-x-8 border-2 border-white/20 backdrop-blur-xl animate-bounce-in-up">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Archive_Batch_Ready</span>
            <span className="text-lg font-black tracking-tighter">{selectedIds.length} <span className="text-sm opacity-50">SELECTED</span></span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <button
            onClick={handleBulkDownload}
            disabled={isBulkDownloading}
            className="bg-white text-black px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center space-x-3 disabled:opacity-50"
          >
            {isBulkDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Archive to Local Drive</span>
                <span className="text-lg translate-y-[-1px]">📥</span>
              </>
            )}
          </button>
          <button 
            onClick={() => setSelectedIds([])}
            className="text-[10px] font-black opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex-1 min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-32 space-y-6">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-black tracking-[.4em] uppercase">ACCESSING VAULT...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-32 space-y-8 opacity-20 filter grayscale">
            <div className="w-24 h-24 border-8 border-black rounded-full flex items-center justify-center text-5xl font-black">!</div>
            <p className="text-3xl font-black text-black tracking-tighter">VAULT_EMPTY_SIGNAL</p>
            <p className="text-sm max-w-sm leading-relaxed text-textMuted uppercase tracking-widest font-black">Commit Discovery Signals to Persist Data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 p-2">
            {materials.map(mat => (
              <div
                key={mat.id}
                onClick={() => toggleSelect(mat.id)}
                className={`bg-panel rounded-3xl p-8 border-2 transition-all duration-500 group flex flex-col h-[320px] shadow-sm hover:translate-y-[-10px] relative overflow-hidden cursor-pointer ${
                  selectedIds.includes(mat.id) 
                    ? 'border-black ring-4 ring-black/5 shadow-2xl' 
                    : 'border-borderDark hover:border-black'
                }`}
              >
                {/* Visual grid bg for cards */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                {/* Selection Indicator */}
                <div className={`absolute top-6 right-6 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all z-10 ${
                  selectedIds.includes(mat.id) ? 'bg-black border-black text-white' : 'border-borderDark bg-white opacity-40 group-hover:opacity-100'
                }`}>
                  {selectedIds.includes(mat.id) && <span className="text-[10px] font-black">✓</span>}
                </div>

                <div className="flex items-start justify-between mb-8 pb-4 border-b-2 border-black/10 relative">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white text-xs font-black shadow-lg">PDF</div>
                    <span className="text-[9px] uppercase font-bold text-black tracking-widest opacity-40">EXTRACTION_SIG</span>
                  </div>
                  <span className="text-[9px] text-black font-black font-mono bg-white border border-borderDark px-2 py-1 rounded shadow-sm mr-8">
                    {new Date(mat.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-black text-lg leading-tight text-black mb-1 line-clamp-3 group-hover:underline relative transition-all" title={mat.product_name}>
                  {mat.product_name || "UNNAMED_ENTITY"}
                </h3>

                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-textMuted flex items-center space-x-2 relative opacity-60 group-hover:opacity-100 transition-opacity">
                  <span>{mat.company}</span>
                  <div className="w-1 h-1 bg-borderDark rounded-full" />
                  <span className="text-black">{mat.material_category}</span>
                </div>

                <div className="mt-auto pt-8 flex items-center justify-between border-t-2 border-black/10 relative">
                  <a
                    href={mat.source_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-all"
                  >
                    ORIGIN_URI ↗
                  </a>

                  <a
                    href={getDownloadUrl(mat.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-black text-white px-5 py-2.5 text-[10px] font-black rounded-xl shadow-lg hover:shadow-glow hover:scale-105 transition-all uppercase tracking-widest active:scale-95"
                    download
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
