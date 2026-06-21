import { Routes, Route, Navigate } from 'react-router-dom';
import { DocViewer } from './features/DocViewer/DocViewer';

export default function App() {
  return (
    <Routes>
      <Route path="/viewer/:documentId" element={<DocViewer />} />
      <Route path="*" element={<Navigate to="/viewer/1" replace />} />
    </Routes>
  );
}
