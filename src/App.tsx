import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SelectionProvider } from './context/SelectionContext';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import Inventario from './pages/Inventario';
import Soportes from './pages/Soportes';
import Soluciones from './pages/Soluciones';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <SelectionProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/soportes" element={<Soportes />} />
            <Route path="/soluciones" element={<Soluciones />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/soportes" element={<Dashboard />} />
            <Route path="/dashboard/soportes/:id/edit" element={<Dashboard />} />
            <Route path="/dashboard/mediakits" element={<Dashboard />} />
            <Route path="/dashboard/mediakits/nuevo" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </SelectionProvider>
  );
}
