import { useState, useEffect } from 'react';
import { getMaterials, getDownloadUrl } from '../services/api';

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="py-6 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-accent">Materials Vault</h1>
        <p className="text-textMuted mt-1">Approved, downloaded, and deduplicated Technical Data Sheets.</p>
      </div>

      <div className="glass-panel flex-1 flex flex-col overflow-hidden">
        {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center">
                <div className="loader items-center flex space-x-2 text-accent">
                   <div className="w-3 h-3 bg-accent rounded-full animate-bounce"></div>
                   <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                   <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
            </div>
        ) : materials.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-textMuted text-center space-y-4">
             <div className="text-6xl opacity-30 mb-2">📁</div>
             <p className="text-xl">Vault is empty.</p>
             <p className="text-sm opacity-60">Go to Candidates and Accept documents to store them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 overflow-y-auto w-full scrollbar-thin">
            {materials.map(mat => (
              <div 
                key={mat.id} 
                className="bg-panel rounded-2xl p-5 shadow-neumorph border border-borderDark/20 hover:border-accent/30 transition group flex flex-col h-48"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-background shadow-neumorph-inset flex items-center justify-center text-danger">
                    PDF
                  </div>
                  <span className="text-[10px] text-textMuted bg-background px-2 py-1 rounded-md mt-1 border border-borderDark/50 tracking-wider">
                    {new Date(mat.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg leading-tight truncate text-textMain group-hover:text-accent transition">
                  {mat.product_name || "Unknown Document"}
                </h3>
                
                <p className="text-sm text-textMuted mt-1 mb-auto truncate">
                  {mat.company} • <span className="text-accent/80 font-medium">{mat.material_category}</span>
                </p>
                
                <div className="mt-4 pt-4 border-t border-borderDark/40 flex items-center justify-between">
                  <a 
                    href={mat.source_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-textMuted hover:text-accent truncate flex-1 block pr-2"
                  >
                    View Source ↗
                  </a>
                  
                  <a 
                    href={getDownloadUrl(mat.id)}
                    className="bg-background text-textMain px-4 py-2 text-sm rounded-lg shadow-neumorph hover:text-accent hover:shadow-neumorph-inset transition font-semibold"
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
