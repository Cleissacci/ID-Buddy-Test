import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SmeWorkspace from './pages/SmeWorkspace';
import CurriculumMapper from './pages/CurriculumMapper';
import ScriptLab from './pages/ScriptLab';
import A11yQa from './pages/A11yQa';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sme-translator" element={<SmeWorkspace />} />
          <Route path="curriculum-mapper" element={<CurriculumMapper />} />
          <Route path="script-lab" element={<ScriptLab />} />
          <Route path="accessibility-qa" element={<A11yQa />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
