import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, NewSnapshotPage } from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-mosh-light">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new-snapshot" element={<NewSnapshotPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export { App };
