import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import FetchPanel from './pages/FetchPanel';
import CandidatesPage from './pages/CandidatesPage';
import MaterialsPage from './pages/MaterialsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FetchPanel />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
